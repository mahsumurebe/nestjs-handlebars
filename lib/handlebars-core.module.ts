import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  HandlebarsOptionsFactory,
  ModuleAsyncOptions,
  ModuleOptions,
} from './interfaces';
import { HANDLEBARS_MODULE_OPTIONS } from './handlebars.constants';

@Global()
@Module({})
export class HandlebarsCoreModule {
  static forRoot(options: ModuleOptions = {}): DynamicModule {
    const handlebarsModuleOptions = {
      provide: HANDLEBARS_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: HandlebarsCoreModule,
      providers: [handlebarsModuleOptions],
      exports: [handlebarsModuleOptions],
    };
  }

  static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: HandlebarsCoreModule,
      imports: options.imports,
      providers: asyncProviders,
      exports: asyncProviders,
    };
  }

  private static createAsyncProviders(options: ModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<HandlebarsOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: ModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: HANDLEBARS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<HandlebarsOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<HandlebarsOptionsFactory>,
    ];
    return {
      provide: HANDLEBARS_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HandlebarsOptionsFactory) =>
        await optionsFactory.createHandlebarsOptions(),
      inject,
    };
  }
}
