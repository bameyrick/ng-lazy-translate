/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef } from '@angular/core';
import { createMock } from '@golevelup/ts-jest';
import { Dictionary } from '@qntm-code/utils';
import { of } from 'rxjs';
import { LazyTranslateService } from '../translate.service';
import { LazyTranslatePipe } from './translate.pipe';

describe(`LazyTranslatePipe`, () => {
  let pipe: LazyTranslatePipe;

  beforeEach(() => {
    pipe = new LazyTranslatePipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      createMock<LazyTranslateService>({ translate: (key?: string | null, _interpolateParams?: Dictionary<unknown>) => of(`${key}`) }),
      createMock<ChangeDetectorRef>()
    );
  });

  it(`creates an instance`, () => {
    expect(pipe).toBeTruthy();
  });

  describe(`paramsSubscription`, () => {
    it(`should unsubscribe when params change`, () => {
      const unsubscribeSpy = jest.spyOn(pipe as any, 'unsubscribe');

      pipe.transform('test', { test: 'test' });

      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it(`should create a new translateSubscription`, () => {
      expect((pipe as any).translationSubscription).toBeUndefined();

      pipe.transform('test');

      expect((pipe as any).translationSubscription).toBeDefined();
    });
  });

  describe(`transform`, () => {
    it(`should update the params$ observable with the key and interpolateParams`, () => {
      const paramsSpy = jest.spyOn((pipe as any).params$, 'next');

      pipe.transform('test', `{ test: 'test' }`);

      expect(paramsSpy).toHaveBeenCalledWith({ key: 'test', interpolateParams: { test: 'test' } });
    });

    it(`should pass the defaultValue when interpolateParams are provided`, () => {
      const paramsSpy = jest.spyOn((pipe as any).params$, 'next');

      pipe.transform('no-value-test', `{ test: 'test' }`, 'default');

      expect(paramsSpy).toHaveBeenCalledWith({ key: 'no-value-test', interpolateParams: { test: 'test' }, defaultValue: 'default' });
    });

    it(`should pass the defaultValue when interpolateParams are not provided`, () => {
      const paramsSpy = jest.spyOn((pipe as any).params$, 'next');

      pipe.transform('no-value-test', 'default');

      expect(paramsSpy).toHaveBeenCalledWith({ key: 'no-value-test', defaultValue: 'default' });
    });
  });
});
