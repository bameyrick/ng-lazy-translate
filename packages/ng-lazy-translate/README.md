# @qntm-code/ng-lazy-translate

Lazy loaded translation module for Angular using [messageformat](https://messageformat.github.io/).

[![GitHub release](https://img.shields.io/github/release/bameyrick/ng-lazy-translate.svg)](https://github.com/bameyrick/ng-lazy-translate/releases)
[![Tests](https://github.com/bameyrick/ng-lazy-translate/actions/workflows/tests.yml/badge.svg)](https://github.com/bameyrick/ng-lazy-translate/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/bameyrick/ng-lazy-translate/branch/main/graph/badge.svg)](https://codecov.io/gh/bameyrick/ng-lazy-translate)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bameyrick_ng-lazy-translate&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bameyrick_ng-lazy-translate)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=bameyrick_ng-lazy-translate&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=bameyrick_ng-lazy-translate)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bameyrick_ng-lazy-translate&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=bameyrick_ng-lazy-translate)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bameyrick_ng-lazy-translate&metric=bugs)](https://sonarcloud.io/summary/new_code?id=bameyrick_ng-lazy-translate)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bameyrick_ng-lazy-translate&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=bameyrick_ng-lazy-translate)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=bameyrick_ng-lazy-translate&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=bameyrick_ng-lazy-translate)

- [@qntm-code/ng-lazy-translate](#qntm-codeng-lazy-translate)
  - [Installation](#installation)
  - [Usage - Standalone Components](#usage---standalone-components)
    - [1. Create providers](#1-create-providers)
  - [Usage - Within a Module](#usage---within-a-module)
    - [1. Import Module](#1-import-module)
    - [2. Import module in component](#2-import-module-in-component)
  - [Using pipe in a template](#using-pipe-in-a-template)
  - [Using the service in a component/service](#using-the-service-in-a-componentservice)
  - [Dynamically adding translation asset paths](#dynamically-adding-translation-asset-paths)
  - [LazyTranslateModuleConfig](#lazytranslatemoduleconfig)
  - [Language](#language)
  - [TranslationAssetPaths](#translationassetpaths)
  - [Translation files](#translation-files)
  - [Default value](#default-value)

## Installation

```bash
npm i @qntm-code/ng-lazy-translate
```

## Usage - Standalone Components

### 1. Create providers

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
```

```typescript
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideLazyTranslate } from '@qntm-code/ng-lazy-translate';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideLazyTranslate({
      defaultLanguage: 'en',
      languages: [
        {
          code: 'en',
          displayValue: 'English',
        },
        {
          code: 'fr',
          displayValue: 'Français',
        },
      ],
      translationAssetPaths: {
        'en.common': 'asset/i18n/en/common.json',
        'fr.common': 'asset/i18n/fr/common.json',
      },
      missingTranslationHandler: (language: string, key: string) => console.error(`Custom handler: Could not find ${key} in ${language}`),
      missingFileHandler: (namespace: string, language: string) =>
        console.error(`Custom handler: CFile with namespace ${namespace} not found for language ${language}`),
    }),
  ],
};
```

## Usage - Within a Module

### 1. Import Module

```typescript
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NgLazyTranslateModule } from '@qntm-code/ng-lazy-translate';

@NgModule({
  imports: [
    HttpClientModule,
    NgLazyTranslateModule.forRoot({
      defaultLanguage: 'en',
      languages: [
        {
          code: 'en',
          displayValue: 'English',
        },
        {
          code: 'fr',
          displayValue: 'Français',
        },
      ],
      translationAssetPaths: {
        'en.common': 'asset/i18n/en/common.json',
        'fr.common': 'asset/i18n/fr/common.json',
      },
    }),
  ],
})
export class AppModule {}
```

### 2. Import module in component

```typescript
import { Component } from '@angular/core';
import { NgLazyTranslateModule } from '@qntm-code/ng-lazy-translate';

@Component({
  standalone: true,
  imports: [NgLazyTranslateModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
```

## Using pipe in a template

```html
<p>{{ 'common.hello_world' | translate }}</p>
```

## Using the service in a component/service

```typescript
import { Injectable } from '@angular/core';
import { LazyTranslateService } from '@qntm-code/ng-lazy-translate';

@Injectable()
export class MyService {
  constructor(private readonly translateService: LazyTranslateService) {}

  public doSomething(): Observable<string> {
    return this.translateService.translate('common.hello_world');
  }
}
```

## Dynamically adding translation asset paths

You can dynamically add translation asset paths by calling the `addTranslationAssetPaths` method on the `LazyTranslateService`:

```typescript
import { LazyTranslateService } from '@qntm-code/ng-lazy-translate';

@Injectable()
export class MyService {
  private readonly translateService = inject(LazyTranslateService);

  constructor() {
    this.translateService.addTranslationAssetPaths({
      'en.home': 'assets/i18n/en/home.json',
      'fr.home': 'assets/i18n/fr/home.json',
    });
  }
}
```

## LazyTranslateModuleConfig

Whether you use the standalone components or the module, the LazyTranslateModuleConfig options are the same.

| Option                    | Type                                            | Description                                                                                                       | Mandatory | Default                      |
| ------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------- |
| defaultLanguage           | string                                          | The default language to use if no language is specified                                                           | Yes       | N/A                          |
| languages                 | [Language[]](#language)                         | The list of languages to support                                                                                  | Yes       | N/A                          |
| translationAssetPaths     | [TranslationAssetPaths](#translationassetpaths) | The list of translation assets to load. The key is the language and the translation file name.                    | No        | N/A                          |
| useDefaultLanguage        | boolean                                         | Whether to use the default language if the specified language is not found                                        | No        | `true`                       |
| enableLogging             | boolean                                         | Whether to enable logging of missing translations                                                                 | No        | `true`                       |
| missingTranslationHandler | (language: string, key: string) => void         | A custom handler to use when a translation is not found. If not specified, the default handler will be used.      | No        | Will console.error a message |
| missingFileHandler        | (namespace: string, language: string) => void   | A custom handler to use when a translation file is not found. If not specified, the default handler will be used. | No        | Will console.error a message |

## Language

| Option      | Type   | Description        |
| ----------- | ------ | ------------------ |
| code        | string | The language code. |
| displayName | string | The language name. |

## TranslationAssetPaths

| Option | Type   | Description                                                                  |
| ------ | ------ | ---------------------------------------------------------------------------- |
| key    | string | The language and translation file name. For example: `en.common` or `fr.app` |
| value  | string | The path to the translation file. e.g `assets/i18n/en.common.json`           |

## Translation files

Translation files must be in JSON format and have the following structure:

```json
{
  "hello_world": "Hello World!"
}
```

You can also use nested keys:

```json
{
  "greetings": {
    "hello_world": "Hello World!"
  }
}
```

You can then access this nest value like so:

- In a template:

  ```html
  {{ 'common.greetings.hello_world' | translate }}
  ```

- In a component/service:

  ```typescript
  this.translateService.translate('common.greetings.hello_world');
  ```

The translation service uses [messageformat](https://messageformat.github.io/) to format the translation., which allows you to pass values to your translated text:

```json
{
  "greetings": {
    "hello_world": "Hello {name}! It is {time}"
  }
}
```

- Template:

  ```html
  {{ 'common.greetings.hello_world' | translate: { name: 'John', time: '10:00' } }}
  ```

- Component/Service:

  ```typescript
  this.translateService.translate('common.greetings.hello_world', { name: 'John', time: '10:00' });
  ```

## Default value

If you want to provide a default value for when a translation is not found in any language, you can do so by passing it as the last parameter to the translate pipe or function:

- Template:

  ```html
  {{ 'common.greetings.hello_world' | translate: { name: 'John', time: '10:00' }: 'Hello, this is my default string' }}
  ```

  or without values:

  ```html
  {{ 'common.greetings.hello_world' | translate: 'Hello, this is my default string' }}
  ```

- Component/Service:

  ```typescript
  this.translateService.translate('common.greetings.hello_world', { name: 'John', time: '10:00' }, 'Hello, this is my default string');
  ```

  or without values:

  ```typescript
  this.translateService.translate('common.greetings.hello_world', undefined, 'Hello, this is my default string');
  ```
