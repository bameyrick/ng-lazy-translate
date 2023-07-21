import { MissingTranslationHandlerFn } from '@qntm-code/translation-key-store';
import { Language } from './language.model';
import { TranslationAssetPaths } from './translation-asset-paths.model';

export interface LazyTranslateModuleConfig {
  languages: Language[];
  defaultLanguage: string;
  translationAssetPaths: TranslationAssetPaths;
  useDefaultLanguage?: boolean;
  enableLogging?: boolean;
  missingTranslationHandler?: MissingTranslationHandlerFn;
}
