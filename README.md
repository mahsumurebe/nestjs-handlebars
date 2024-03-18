# NestJS Handlebars Template Engine

<a href="https://www.npmjs.com/nestjs-handlebars" target="_blank">
<img src="https://img.shields.io/npm/v/nestjs-handlebars" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/nestjs-handlebars" target="_blank">
<img src="https://img.shields.io/npm/l/nestjs-handlebars" alt="Package License" /></a>
<a href="https://www.npmjs.com/nestjs-handlebars" target="_blank">
<img src="https://img.shields.io/npm/dm/nestjs-handlebars" alt="NPM Downloads" /></a>
<a href="https://github.com/mahsumurebe/nestjs-handlebars" target="_blank">
<img src="https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_95.svg" alt="Coverage" /></a>
<a href="https://github.com/mahsumurebe/nestjs-handlebars"><img alt="Github Page" src="https://img.shields.io/badge/Github%20Page-nestjs--sequelize--pagination-yellow?style=flat-square&logo=github" /></a>
<a href="https://github.com/mahsumurebe"><img alt="Author" src="https://img.shields.io/badge/Author-Mahsum%20Urebe-blueviolet?style=flat-square&logo=appveyor" /></a>

## Description

This is a [Handlebars](https://handlebarsjs.com/) template engine for [NestJS](https://nestjs.com/). It uses
the [i18next](https://www.i18next.com/) library for internationalization.

## Integration

To start using it, we first install the required dependencies. In this chapter we will demonstrate the use of the
pagination for nestjs.

You simply need to install the package !

```shell
$ npm install --save nestjs-handlebars
```

## Getting Started

Once the installation process is complete, we can import the **HandlebarsModule** into the root **AppModule**

```ts
import {Module} from '@nestjs/common';
import {HandlebarsModule} from 'nestjs-handlebars';
import {MailModule} from './modules/mail/mail.module';
import {SmsModule} from './modules/sms/sms.module';

@Module({
    imports: [
        HandlebarsModule.forRoot({
            // Global configuration
            i18n: {
                use: true,
                i18nHelperName: 'i18n',
            },
        }),
        MailModule,
        SmsModule,
    ],
})
export class ApplicationModule {
}
```

The **forRoot()** method supports all the configuration properties exposed by the handlebars constuctor . In addition,
there are several extra configuration properties described below.

### Configuration for I18nOptions

| Field                | Description                                                               |
|----------------------|---------------------------------------------------------------------------|
| use                  | Indicates whether the I18n feature is enabled or not.                     |
| i18nHelperName       | Specifies a custom name for the Handlebars helper.                        |
| directories          | Array containing directories where translation files are located.         |
| defaultDirectoryName | Specifies the default directory name where translation files are located. |

### Configuration for HandlebarsOptions

| Field              | Description                                                          |
|--------------------|----------------------------------------------------------------------|
| partialDirectories | Array containing directories where partial files are located.        |
| templateOptions    | An object of type RuntimeOptions used to determine template options. |
| compileOptions     | An object of type CompileOptions used to determine compile options.  |
| helpers            | List of available Handlebars helpers.                                |
| i18n               | An object of type I18nOptions used to determine I18n features.       |

## Usage

### HandlebarsModule.forSubModule()

The **forSubModule()** method is used to import the **HandlebarsService** into a sub-module. The first parameter is the
module name and the second parameter is the configuration object. Configuration properties are the same as the *
*forRoot()** method and extra configuration property is **templateDirectory**. This property is used to specify the
directory where the template files are located for the sub-module.

```ts
import {Module} from '@nestjs/common';
import {HandlebarsModule} from 'nestjs-handlebars';
import * as path from 'path';
import {SmsService} from './sms.service';

@Module({
    imports: [
        HandlebarsModule.forSubModule('sms', {
            templateDirectory: path.join(__dirname, 'templates'),
            partialDirectories: [path.join(__dirname, 'partials')],
            i18n: {
                use: true,
                directories: [path.join(__dirname, 'i18n')],
            },
        }),
    ],
    providers: [SmsService],
    exports: [SmsService],
})
export class SmsModule {
}
```

### Service

Handlebars implements the Active Record pattern. With this pattern, you use model classes directly to interact with the
database. To continue the example, we need at least one model. Let's define the Item Model.

```ts
import {Injectable} from '@nestjs/common';
import {HandlebarsService, InjectHandlebars} from 'nestjs-handlebars';

@Injectable()
export class SmsService {
    @InjectHandlebars('sms') private readonly handlebars: HandlebarsService;

    compileSmsTest() {
        return this.handlebars.compile('sms-test');
    }

    compileSmsWithLocale(locale?: string) {
        return this.handlebars.compile(`sms-with-locale`, {}, locale);
    }

    compileSmsWithPartial() {
        return this.handlebars.compile('sms-with-partial');
    }

    compileSmsWithPartialWithParam(param: { name: string }) {
        return this.handlebars.compile('sms-with-partial-with-param', param);
    }
}
```

### Decorator

InjectHandlebars is a decorator that allows you to inject a HandlebarsService instance into a property. The decorator
wants module name as a parameter.

## License

nestjs-handlebars is [MIT licensed](./LICENSE).
