import { type ModuleMetadata, Type } from '@nestjs/common';
import { HelperDelegate } from 'handlebars';
import { InitOptions } from 'i18next';

export interface I18nOptions
  extends Omit<InitOptions, 'defaultNS' | 'ns' | 'fallbackNS'> {
  use: boolean;
  i18nHelperName?: string;
  directories?: string[];
  defaultDirectoryName?: string;
}

export interface HandlebarsOptions {
  partialDirectories?: string[];
  templateOptions?: RuntimeOptions;
  compileOptions?: CompileOptions;
  helpers?: HandlebarsHelper[];
  i18n?: I18nOptions;
}

export interface CompileOptions {
  locale?: string;
}

export interface HandlebarsHelper {
  name: string;
  fn: HelperDelegate;
}

export type HandlebarsModuleOptions = Partial<HandlebarsOptions>;

export type ModuleOptions = Partial<HandlebarsOptions>;

export interface SubModuleOptions extends Partial<HandlebarsOptions> {
  templateDirectory: string;
}

export interface HandlebarsOptionsFactory {
  createHandlebarsOptions(): Promise<ModuleOptions> | ModuleOptions;
}

export interface ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<HandlebarsOptionsFactory>;
  useClass?: Type<HandlebarsOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ModuleOptions> | ModuleOptions;
  inject?: any[];
}
