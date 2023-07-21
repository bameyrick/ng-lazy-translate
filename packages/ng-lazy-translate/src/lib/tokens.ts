import { InjectionToken } from '@angular/core';
import { MissingTranslationHandlerFn } from '@qntm-code/translation-key-store';
import { Language, TranslationAssetPaths } from './models';

export const LANGUAGES = new InjectionToken<Language[]>('LANGUAGES');

export const USE_DEFAULT_LANGUAGE = new InjectionToken<boolean>('USE_DEFAULT_LANGUAGE');

export const DEFAULT_LANGUAGE = new InjectionToken<string>('DEFAULT_LANGUAGE');

export const ENABLE_TRANSLATION_LOGGING = new InjectionToken<string>('ENABLE_TRANSLATION_LOGGING');

export const MISSING_TRANSLATION_HANDLER = new InjectionToken<MissingTranslationHandlerFn>('MISSING_TRANSLATION_HANDLER');

export const TRANSLATION_ASSET_PATHS = new InjectionToken<TranslationAssetPaths>('TRANSLATION_ASSET_PATHS');
