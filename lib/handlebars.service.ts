import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as fs from 'fs';
import * as i18next from 'i18next';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as debug from 'debug';
import * as _ from 'lodash';
import * as glob from 'glob';
import { SubModuleOptions } from './interfaces';
import {
  InvalidI18nFolderException,
  TemplateNotFoundException,
} from './exceptions';

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

  private async processI18n() {
    if (this.options.i18n !== undefined && this.options.i18n.use) {
      this.debug('Configuring i18n');
      let i18nOptions = this.options.i18n;
      i18nOptions.directories!.map((directory) => {
        if (!path.isAbsolute(directory)) {
          return path.join(this.options.templateDirectory, directory);
        }
        return directory;
      });

      const resources: i18next.Resource = {};

      const files = _.uniq(i18nOptions.directories)
        .map((directory) => glob.sync(path.join(directory, '**', '*.json'), {}))
        .flat();

      for (const filePath of files) {
        const pathInfo = path.parse(filePath);
        const basePath = i18nOptions.directories!.find((d) =>
          filePath.startsWith(d),
        );
        const r = new RegExp(`^${basePath}${path.sep}?`);
        const locale = pathInfo.dir.replace(r, '');
        if (locale === '') {
          throw new InvalidI18nFolderException(pathInfo.dir);
        }
        this.debug(
          `Loading locale: ${locale}.${pathInfo.name} from file: ${filePath}`,
        );
        _.set(
          resources,
          `${locale}.default.${pathInfo.name}`,
          JSON.parse(fs.readFileSync(filePath, 'utf8')),
        );
      }

      this.i18n = i18next.createInstance();
      await this.i18n.init({
        fallbackLng: 'en',
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
    if (
      this.options.partialDirectories &&
      Array.isArray(partialDirectories) &&
      partialDirectories.length > 0
    ) {
      this.debug('Processing partials');
      for (let [index, partialDirectory] of partialDirectories.entries()) {
        if (!path.isAbsolute(partialDirectory)) {
          partialDirectory = path.join(
            this.options.templateDirectory,
            partialDirectory,
          );
        }
        this.options.partialDirectories[index] = partialDirectory;
        this.debug(`Processing partials in directory: ${partialDirectory}`);
        const partials = glob.sync(
          path.join(partialDirectory, '**', '*.hbs'),
          {},
        );
        for (const partialPath of partials) {
          const pathInfo = path.parse(partialPath);
          const partialName = pathInfo.name;
          const partialContent = fs.readFileSync(partialPath, 'utf8');
          this.debug(`Registering partial: ${partialName}`);
          this.handlebars.registerPartial(partialName, partialContent);
        }
      }
    }
  }

  private processTemplates() {
    const templateDirectory = this.options.templateDirectory;
    this.debug('Processing templates');
    let ignoreFn = (p: glob.Path) => {
      if (!this.options.partialDirectories) return false;
      return this.options.partialDirectories.includes(p.path);
    };
    const templates = glob.sync(path.join(templateDirectory, '**', '*.hbs'), {
      ignore: {
        ignored: ignoreFn,
        childrenIgnored: ignoreFn,
      },
    });

    for (const templatePath of templates) {
      const pathInfo = path.parse(templatePath);
      const templateName = pathInfo.name;
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      this.debug(`Registering template: ${templateName}`);
      this.templates.set(
        templateName,
        this.handlebars.compile(templateContent, this.options.templateOptions),
      );
    }
  }
}
