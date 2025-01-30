import { MissingTranslationHandlerFn } from '@qntm-code/translation-key-store';
import { Language } from './language.model';
import { MissingFileHandlerFn } from './missing-file-handler-fn.model';
import { TranslationAssetPaths } from './translation-asset-paths.model';

export interface LazyTranslateModuleConfig {
  languages: Language[];
  defaultLanguage: string;
  translationAssetPaths?: TranslationAssetPaths;
  preload?: boolean;
  useDefaultLanguage?: boolean;
  enableLogging?: boolean;
  missingTranslationHandler?: MissingTranslationHandlerFn;
  missingFileHandler?: MissingFileHandlerFn;
}
