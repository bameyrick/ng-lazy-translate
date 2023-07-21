import { Language } from './language.model';
import { TranslationAssetPaths } from './translation-asset-paths.model';

export interface LazyTranslateModuleConfig {
  languages: Language[];
  defaultLanguage: string;
  useDefaultLanguage?: boolean;
  enableLogging?: boolean;
  translationAssetPaths?: TranslationAssetPaths;
}
