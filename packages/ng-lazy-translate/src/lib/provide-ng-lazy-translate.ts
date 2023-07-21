import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { LazyTranslateModuleConfig } from './models';
import { NG_LAZY_TRANSLATE_CONFIG } from './tokens';
import { LazyTranslateService } from './translate.service';

export function provideLazyTranslate(config: LazyTranslateModuleConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NG_LAZY_TRANSLATE_CONFIG,
      useValue: config,
    },
    LazyTranslateService,
  ]);
}
