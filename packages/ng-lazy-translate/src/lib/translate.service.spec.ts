/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { delay } from '@qntm-code/utils';
import { firstValueFrom } from 'rxjs';

import { Language, TranslationAssetPaths } from './models';
import { NG_LAZY_TRANSLATE_CONFIG } from './tokens';
import { LazyTranslateService } from './translate.service';

const TEST_LANGUAGES: Language[] = [
  { code: 'en', displayValue: 'English' },
  { code: 'cy', displayValue: 'Cymraeg' },
];

const TEST_ASSET_PATHS: TranslationAssetPaths = {
  'en.common': 'assets/i18n/en/common.json',
  'cy.common': 'assets/i18n/cy/common.json',
};

describe(`LazyTranslateService`, () => {
  let service: LazyTranslateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: NG_LAZY_TRANSLATE_CONFIG,
          useValue: {
            defaultLanguage: 'en',
            enableLogging: false,
            languages: TEST_LANGUAGES,
            translationAssetPaths: TEST_ASSET_PATHS,
            useDefaultLanguage: true,
          },
        },
        LazyTranslateService,
      ],
    });
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
  });

  describe(`if logging is enabled`, () => {
    let consoleLog: typeof console.log;
    let consoleError: typeof console.error;
    let logSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
      TestBed.overrideProvider(NG_LAZY_TRANSLATE_CONFIG, {
        useValue: {
          defaultLanguage: 'en',
          enableLogging: true,
          languages: TEST_LANGUAGES,
          translationAssetPaths: TEST_ASSET_PATHS,
        },
      });

      consoleLog = console.log;
      consoleError = console.error;

      logSpy = jest.spyOn(console, 'log').mockImplementation();
      errorSpy = jest.spyOn(console, 'error').mockImplementation();

      service = TestBed.inject(LazyTranslateService);
    });

    afterEach(() => {
      console.log = consoleLog;
      console.error = consoleError;
    });

    it(`should log the current language`, () => {
      expect(logSpy).toHaveBeenCalledWith('Current language: en');
    });

    it(`should log if a file with a namespace is not found`, async () => {
      void firstValueFrom(service.translate('test.test'));

      await delay();

      expect(errorSpy).toHaveBeenCalledWith(`File with namespace test not found for language en`);
    });
  });

  describe(`if logging is disabled`, () => {
    beforeEach(() => {
      httpMock = TestBed.inject(HttpTestingController);
      service = TestBed.inject(LazyTranslateService);
    });

    it(`should be created`, () => {
      expect(service).toBeTruthy();
    });

    it(`current lanaugage should be english`, async () => {
      expect(await firstValueFrom(service.language$)).toBe('en');
    });

    describe(`setLanguage`, () => {
      it(`should call getValidLanguageCode`, () => {
        const getValidLanguageCodeSpy = jest.spyOn(service as any, 'getValidLanguageCode');

        service.setLanguage('en');

        expect(getValidLanguageCodeSpy).toHaveBeenCalledWith('en');
      });

      it(`should call next on language$`, () => {
        const nextSpy = jest.spyOn(service.language$, 'next');

        service.setLanguage('en');

        expect(nextSpy).toHaveBeenCalledWith('en');
      });
    });

    describe(`translate`, () => {
      it(`should return the key if no translation is found`, async () => {
        const result = firstValueFrom(service.translate('common.test'));

        await delay();

        httpMock.expectOne(TEST_ASSET_PATHS[`en.common`]).flush({});

        expect(await result).toBe('common.test');
      });

      it(`should return the default value if no translation is found and a default value is provided`, async () => {
        const result = firstValueFrom(service.translate('common.no-value', undefined, ''));

        await delay();

        httpMock.expectOne(TEST_ASSET_PATHS[`en.common`]).flush({});

        expect(await result).toBe('');
      });

      it(`the value should update when the language changes`, async () => {
        let result = '';

        service.translate('common.test').subscribe(r => (result = r));

        service.setLanguage('cy');

        await delay();

        httpMock.expectOne(TEST_ASSET_PATHS[`cy.common`]).flush({ test: 'test' });

        await delay();

        expect(result).toBe('test');

        service.setLanguage('en');

        await delay();

        httpMock.expectOne(TEST_ASSET_PATHS[`en.common`]).flush({});

        await delay();

        expect(result).toBe('common.test');
      });

      it(`should use the default language file for a given namespace if the namespace file does not exist for the current language`, async () => {
        service.setLanguage('cy');

        const result = firstValueFrom(service.translate('common.test'));

        await delay();

        httpMock.expectOne(TEST_ASSET_PATHS[`cy.common`]).flush('', { status: 404, statusText: 'Not Found' });

        await delay();

        httpMock.expectOne(TEST_ASSET_PATHS[`en.common`]).flush({ test: 'test' });

        expect(await result).toBe('test');
      });

      it(`should return the key in the default language if it does not exist in the current language`, async () => {
        service.setLanguage('cy');

        const result = firstValueFrom(service.translate('common.test'));

        await delay();

        httpMock.expectOne(TEST_ASSET_PATHS[`cy.common`]).flush({});

        await delay();

        httpMock.expectOne(TEST_ASSET_PATHS[`en.common`]).flush({ test: 'test' });

        expect(await result).toBe('test');
      });
    });

    describe(`getValidLanguageCode`, () => {
      it(`should return the default language if the language is not supported`, () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const result = (service as any).getValidLanguageCode('fr');

        expect(result).toBe('en');
      });
    });
  });

  describe(`flattenParams`, () => {
    it(`should return an empty object if no params are passed`, () => {
      const params = undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const result = (service as any).flattenParams(params);

      expect(result).toEqual(params);
    });

    it(`should convert nested parameters to a flat object`, () => {
      const params = { test: { test: 'test' } };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const result = (service as any).flattenParams(params);

      expect(result).toEqual({ test: 'test' });
    });
  });

  describe('addTranslationPaths', () => {
    it('should preload the translations if preload is true', () => {
      const downloadFileSpy = jest.spyOn(service as never, 'downloadFile');

      service.addTranslationPaths(
        {
          'en.common': 'assets/i18n/en/common.json',
          'cy.common': 'assets/i18n/cy/common.json',
        },
        true
      );

      expect(downloadFileSpy).toHaveBeenCalledWith('en', 'common');
      expect(downloadFileSpy).not.toHaveBeenCalledWith('cy', 'common');
    });
  });
});
