import { ModuleWithProviders, NgModule } from '@angular/core';
import { LazyTranslateModuleConfig } from './models';
import { LazyTranslatePipe } from './pipe';
import { NG_LAZY_TRANSLATE_CONFIG } from './tokens';
import { LazyTranslateService } from './translate.service';

@NgModule({
  declarations: [LazyTranslatePipe],
  exports: [LazyTranslatePipe],
})
export class NgLazyTranslateModule {
  public static forRoot(config: LazyTranslateModuleConfig): ModuleWithProviders<NgLazyTranslateModule> {
    return {
      ngModule: NgLazyTranslateModule,
      providers: [{ provide: NG_LAZY_TRANSLATE_CONFIG, useValue: config }, LazyTranslateService],
    };
  }

  public static forChild(config: LazyTranslateModuleConfig): ModuleWithProviders<NgLazyTranslateModule> {
    return {
      ngModule: NgLazyTranslateModule,
      providers: [{ provide: NG_LAZY_TRANSLATE_CONFIG, useValue: config }, LazyTranslateService],
    };
  }
}
