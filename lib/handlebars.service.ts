import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as i18next from 'i18next';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as debug from 'debug';
import * as _ from 'lodash';
import * as glob from 'glob';
import { SubModuleOptions } from './interfaces';
import { TemplateNotFoundException } from './exceptions';

@Injectable()
export class HandlebarsService implements OnApplicationBootstrap {
  private readonly debug: debug.Debugger;
  private readonly templates: Map<string, HandlebarsTemplateDelegate> = new Map<
    string,
    HandlebarsTemplateDelegate
  >();
  private i18n: i18next.i18n;
  private handlebars: typeof Handlebars;

  constructor(
    moduleName: string,
    private options: SubModuleOptions,
  ) {
    this.debug = debug(`nestjs:handlebars:${moduleName}`);
    this.handlebars = Handlebars.create();
    if (this.options.helpers !== undefined) {
      for (const helper of this.options.helpers) {
        this.debug('Registering helper: ' + helper.name);
        this.handlebars.registerHelper(helper.name, helper.fn);
      }
    }
    _.set(
      this.options,
      'partialDirectories',
      _.uniq(this.options.partialDirectories || []).map((directory) => {
        if (!path.isAbsolute(directory)) {
          return path.join(this.options.templateDirectory, directory);
        }
        return directory;
      }),
    );

    _.set(
      this.options,
      'i18n.directories',
      _.uniq(this.options.i18n?.directories || []),
    );
  }

  async onApplicationBootstrap() {
    await this.processI18n();
    this.processPartials();
    this.processTemplates();
  }

  compile(
    name: string,
    parameters: Record<string, any> = {},
    locale?: string,
  ): string {
    parameters = _.defaultsDeep(parameters, {
      locale: locale || this.options.i18n?.fallbackLng || 'en',
    });
    let templateOptions: Handlebars.RuntimeOptions = _.defaultsDeep(
      this.options.templateOptions,
      {
        data: parameters,
      },
    );
    const template = this.templates.get(name);
    if (!template) {
      throw new TemplateNotFoundException(name);
    }
    this.debug(`Compiling template: ${name}`, parameters, templateOptions);
    try {
      return template(parameters, templateOptions);
    } catch (err) {
      throw err;
    }
  }

  private getKey(parsedFilePath: path.ParsedPath, separator: string): string {
    const out: string[] = [];
    if (parsedFilePath.dir) {
      out.push(parsedFilePath.dir.replace(/[\/\\]+/g, separator));
    }
    out.push(parsedFilePath.name);
    return out.join(separator);
  }

  private async processI18n() {
    if (this.options.i18n && this.options.i18n.use) {
      this.debug('Configuring i18n');
      let i18nOptions = this.options.i18n;
      i18nOptions.directories!.map((directory) => {
        if (!path.isAbsolute(directory)) {
          return path.join(this.options.templateDirectory, directory);
        }
        return directory;
      });

      const resources: i18next.Resource = {};

      for (const directory of i18nOptions.directories!) {
        const languages = glob.sync(path.join(directory, '*', path.sep), {
          dot: false,
        });
        for (const langDirPath of languages) {
          const language = path.relative(directory, langDirPath);
          this.debug(`Processing i18n resources for language: ${language}`);
          const files = glob.sync(path.join(langDirPath, '**', '*.json'));
          for (const file of files) {
            const filePath = path.parse(path.relative(langDirPath, file));
            const content = fs.readFileSync(file, 'utf8');
            const key = this.getKey(filePath, '.');
            const langPath = `${language}.default.${key}`;
            _.set(resources, langPath, {
              ..._.get(resources, langPath, {}),
              ...JSON.parse(content),
            });
            this.debug(`Registering i18n resource: ${langPath} `);
          }
        }
      }

      console.log(JSON.stringify(resources, null, 2));

      this.i18n = i18next.createInstance();
      await this.i18n.init({
        ...i18nOptions,
        defaultNS: 'default',
        resources,
      });

      const i18nHelperName = i18nOptions.i18nHelperName || 'i18n';
      this.debug(`Registering i18n helper: ${i18nHelperName}`);
      this.handlebars.registerHelper(
        i18nHelperName,
        (phrase: string, options: Handlebars.HelperOptions) => {
          const locale = options.hash?.locale || options.data?.locale;
          this.debug(
            `Getting translation for key: ${phrase} in locale: ${locale || 'default'}`,
          );
          return this.i18n.t(phrase, {
            lng: locale,
            defaultValue: options.hash?.defaultValue,
            ...options.data,
          });
        },
      );
    }
  }

  private processPartials() {
    const partialDirectories = this.options.partialDirectories;
    if (Array.isArray(partialDirectories) && partialDirectories.length > 0) {
      this.debug('Processing partials');
      for (let partialDirectory of partialDirectories) {
        this.debug(`Processing partials in directory: ${partialDirectory}`);
        const partials = glob.sync(path.join(partialDirectory, '**', '*.hbs'));
        for (const file of partials) {
          const filePath = path.parse(path.relative(partialDirectory, file));
          const content = fs.readFileSync(file, 'utf8');
          const key = this.getKey(filePath, '/');
          this.debug(`Registering partial: ${key}`);
          this.handlebars.registerPartial(key, content);
        }
      }
    }
  }

  private processTemplates() {
    this.debug('Processing templates');
    let ignoreFn = (p: glob.Path) => {
      if (!this.options.partialDirectories) return false;
      return this.options.partialDirectories.includes(p.path);
    };

    const templates = glob.sync(
      path.join(this.options.templateDirectory, '**', '*.hbs'),
      {
        ignore: {
          ignored: ignoreFn,
          childrenIgnored: ignoreFn,
        },
      },
    );
    for (const file of templates) {
      const filePath = path.parse(
        path.relative(this.options.templateDirectory, file),
      );
      const content = fs.readFileSync(file, 'utf8');
      const key = path.join(filePath.dir, filePath.name);
      this.debug(`Registering template: ${key}`);
      this.templates.set(key, this.handlebars.compile(content));
    }
  }
}
