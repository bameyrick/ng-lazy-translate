import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Dictionary, isEqual, isNullOrUndefined, isObject, isString } from '@qntm-code/utils';
import { Subject, Subscription, distinctUntilChanged } from 'rxjs';
import { LazyTranslateService } from '../translate.service';

@Pipe({ name: 'translate', pure: false })
export class LazyTranslatePipe implements PipeTransform, OnDestroy {
  /**
   * The value to return
   */
  private value?: string;

  /**
   * Subscription to the translation, this might change if the user changes their language or the default language is changed
   */
  private translationSubscription?: Subscription;

  /**
   * An observable of the params provided from the transform
   */
  private readonly params$ = new Subject<{ key?: string | null; interpolateParams?: Dictionary<unknown>; defaultValue?: string }>();

  /**
   * Handle the params being updated
   */
  private readonly paramsSubscription = this.params$
    .pipe(distinctUntilChanged((previous, next) => isEqual(previous, next)))
    .subscribe(({ key, interpolateParams, defaultValue }) => {
      this.unsubscribe();

      this.translationSubscription = this.translateService.translate(key, interpolateParams, defaultValue).subscribe(value => {
        this.value = value;

        this.changeDetectorRef.detectChanges();
      });
    });

  constructor(private readonly translateService: LazyTranslateService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  public ngOnDestroy(): void {
    this.unsubscribe();

    this.paramsSubscription.unsubscribe();
  }

  public transform(key?: string | null, ...args: Array<Dictionary<unknown> | string>): string | undefined {
    let interpolateParams: Dictionary<unknown> | undefined;
    let defaultValue: string | undefined;

    if (args.length > 1) {
      defaultValue = args[1] as string;
    }

    if (!isNullOrUndefined(args[0])) {
      const params = args[0];

      if (isString(params)) {
        /** We accept objects written in the template such as {n:1}, {'n':1}, {n:'v'} which is why we might need to change it to real JSON
         * objects such as {"n":1} or {"n":"v"}
         */
        const validArgs: string = params.replace(/(')?([a-zA-Z0-9_]+)(')?(\s)?:/g, '"$2":').replace(/:(\s)?(')(.*?)(')/g, ':"$3"');

        try {
          interpolateParams = JSON.parse(validArgs);
        } catch (error) {
          defaultValue = params;
        }
      } else if (isObject(args[0]) && !Array.isArray(args[0])) {
        interpolateParams = args[0] as Dictionary<unknown>;
      }
    }

    this.params$.next({ key, interpolateParams, defaultValue });

    return this.value;
  }

  private unsubscribe(): void {
    if (this.translationSubscription) {
      this.translationSubscription.unsubscribe();
    }
  }
}
