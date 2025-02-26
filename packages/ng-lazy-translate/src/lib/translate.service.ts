import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { TranslationKeyStore, TranslationValue } from '@qntm-code/translation-key-store';
import { isEqual, isNullOrUndefined, isObject, isString } from '@qntm-code/utils';
import {
  BehaviorSubject,
  NEVER,
  Observable,
  Subscription,
  catchError,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  from,
  map,
  mergeMap,
  of,
  pairwise,
  shareReplay,
  withLatestFrom,
} from 'rxjs';
import { LazyTranslateModuleConfig, TranslationAssetPaths } from './models';
import { NG_LAZY_TRANSLATE_CONFIG } from './tokens';

@Injectable()
export class LazyTranslateService {
  /**
   * The current language
   */
  public readonly language$: BehaviorSubject<string>;

  /**
   * The default language to fall back to if no translation is found
   */
  private readonly defaultLanguage$: BehaviorSubject<string>;

  /**
   * The dictionary for the current language
   */
  private readonly store: TranslationKeyStore;

  /**
   * Files that have already been attempted to be downloaded
   */
  private readonly downloadedRequests: Record<string, Observable<Record<string, unknown> | undefined> | undefined> = {};

  /**
   * Config for the service
   */
  private readonly config: LazyTranslateModuleConfig;

  private readonly translationAssetPaths = new Map<string, string>();

  constructor(@Inject(NG_LAZY_TRANSLATE_CONFIG) config: LazyTranslateModuleConfig, private readonly http: HttpClient) {
    this.config = { useDefaultLanguage: true, enableLogging: true, ...config };

    if (this.config.translationAssetPaths) {
      this.addTranslationPaths(this.config.translationAssetPaths, this.config.preload);
    }

    this.defaultLanguage$ = new BehaviorSubject<string>(this.config.defaultLanguage);

    this.language$ = new BehaviorSubject<string>(
      this.getValidLanguageCode(typeof window !== 'undefined' ? navigator.language : this.config.defaultLanguage)
    );

    this.store = new TranslationKeyStore({
      enableLogging: this.config.enableLogging,
      missingTranslationHandler: this.config.missingTranslationHandler,
    });

    this.subscribeToLanguageChange(this.language$, this.defaultLanguage$);
    this.subscribeToLanguageChange(this.defaultLanguage$, this.language$);

    if (this.config.enableLogging) {
      this.language$.subscribe(language => console.log(`Current language: ${language}`));
    }
  }

  /**
   * Adds translation asset paths
   */
  public addTranslationPaths(paths: TranslationAssetPaths, preload?: boolean): void {
    Object.entries(paths).forEach(([key, value]) => {
      this.translationAssetPaths.set(key, value);
      if (preload) {
        const [language, namespace] = key.split('.');

        if (language === this.language$.getValue()) {
          this.downloadFile(language, namespace);
        }
      }
    });
  }

  public setLanguage(language: string): void {
    this.language$.next(this.getValidLanguageCode(language));
  }

  public translate(key?: string | null, params?: Record<string, unknown>, defaultValue?: string): Observable<string> {
    return combineLatest([this.language$, this.defaultLanguage$]).pipe(
      distinctUntilChanged((previous, next) => isEqual(previous, next)),
      concatMap(() => (isString(key) ? of(key) : NEVER)),
      mergeMap(k => from(this.getKey(k))),
      map(result => {
        if (isNullOrUndefined(result)) {
          if (!isNullOrUndefined(defaultValue)) {
            return defaultValue;
          }

          return key || '';
        }

        return result(this.flattenParams(params));
      })
    );
  }

  /**
   * Subscribes to either the language or default language changing. If the new previous language or default language is not the same as the
   * current language or default language, that language can be removed from the store to save memory.
   */
  private subscribeToLanguageChange(a$: Observable<string>, b$: Observable<string>): Subscription {
    return a$
      .pipe(
        pairwise(),
        map(([previous]) => previous),
        withLatestFrom(b$),
        filter(([a, b]) => b !== a),
        map(([a]) => a)
      )
      .subscribe(language => {
        this.store.removeLanguage(language);
        this.removeDownloadedFiles(language);
      });
  }

  /**
   * Gets a key for a given value
   */
  private async getKey(key: string): Promise<TranslationValue | undefined> {
    const parts = key.split('.');
    const namespace = parts[0];

    const language = await firstValueFrom(this.language$);
    const defaultLanguage = await firstValueFrom(this.defaultLanguage$);

    /**
     * If the namespace does not exist for the language and the default language is not the same as the language attempt to
     * download the file for the default language
     */
    if (!(await this.getNamespaceForLanguage(language, namespace)) && this.config.useDefaultLanguage && language !== defaultLanguage) {
      await this.getNamespaceForLanguage(defaultLanguage, namespace);
    }

    // Attempt to get the translation key value
    let result = this.store.getTranslationValue(key, language);

    // If the translation key value is not found and the language is not the same as the default language
    if (!result && this.config.useDefaultLanguage && language !== defaultLanguage) {
      await this.getNamespaceForLanguage(defaultLanguage, namespace);

      // Attempt to get the translation key value in the default language
      result = this.store.getTranslationValue(key, defaultLanguage);
    }

    return result;
  }

  /**
   * Downloads a namespace for a given language, and if found it will store it. Returns a boolean denoting whether the file was found
   */
  private async getNamespaceForLanguage(language: string, namespace: string): Promise<boolean> {
    const result = await firstValueFrom(this.downloadFile(language, namespace));

    if (result) {
      // If the file exists add it to the store
      this.store.addLanguageNamespace(language, namespace, result);

      return true;
    }

    return false;
  }

  /**
   * Downloads a language file for a given namespace
   */
  private downloadFile(language: string, namespace: string): Observable<Record<string, unknown> | undefined> {
    const path = this.translationAssetPaths.get(`${language}.${namespace}`);

    if (!path) {
      if (this.config.missingFileHandler) {
        this.config.missingFileHandler(namespace, language);
      } else if (this.config.enableLogging) {
        console.error(`File with namespace ${namespace} not found for language ${language}`);
      }

      return of(undefined);
    }

    let observable = this.downloadedRequests[path];

    if (!isNullOrUndefined(observable)) {
      return observable;
    }

    observable = this.http.get<Record<string, unknown>>(path).pipe(
      catchError(() => of(undefined)),
      shareReplay(1)
    );

    this.downloadedRequests[path] = observable;

    return observable;
  }

  /**
   * Removes the markers for files that have already been attempted to be downloaded
   */
  private removeDownloadedFiles(language: string): void {
    Object.keys(this.downloadedRequests)
      .filter(key => key.replace('assets/i18n/', '').split('.')[0] === language)
      .forEach(key => delete this.downloadedRequests[key]);
  }

  private getValidLanguageCode(language: string): string {
    if (this.config.languages.map(({ code }) => code).includes(language)) {
      return language;
    }

    if (language.includes('-')) {
      return this.getValidLanguageCode(language.split('-')[0]);
    }

    return this.config.defaultLanguage;
  }

  private flattenParams(params?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (params) {
      const result: Record<string, unknown> = {};

      Object.keys(params).forEach(key => {
        const value = params[key];

        if (isObject(value)) {
          Object.assign(result, this.flattenParams(value as Record<string, unknown>));
        } else {
          result[key] = value;
        }
      });

      return result;
    }

    return params;
  }
}
