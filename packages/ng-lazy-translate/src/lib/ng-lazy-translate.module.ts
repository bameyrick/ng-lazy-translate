import { ModuleWithProviders, NgModule } from '@angular/core';
import { LazyTranslateModuleConfig } from './models';
import { DEFAULT_LANGUAGE, ENABLE_TRANSLATION_LOGGING, LANGUAGES, TRANSLATION_ASSET_PATHS, USE_DEFAULT_LANGUAGE } from './tokens';
import { LazyTranslateService } from './translate.service';

@NgModule({})
export class NgLazyTranslateModule {
  public static forRoot(config: LazyTranslateModuleConfig): ModuleWithProviders<NgLazyTranslateModule> {
    return {
      ngModule: NgLazyTranslateModule,
      providers: [
        { provide: LANGUAGES, useValue: config.languages },
        { provide: DEFAULT_LANGUAGE, useValue: config.defaultLanguage },
        { provide: USE_DEFAULT_LANGUAGE, useValue: config.useDefaultLanguage },
        { provide: ENABLE_TRANSLATION_LOGGING, useValue: config.enableLogging },
        {
          provide: TRANSLATION_ASSET_PATHS,
          useValue: config.translationAssetPaths,
        },
        LazyTranslateService,
      ],
    };
  }
}
