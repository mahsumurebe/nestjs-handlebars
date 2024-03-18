import { DynamicModule, Module } from '@nestjs/common';
import {
  ModuleAsyncOptions,
  ModuleOptions,
  SubModuleOptions,
} from './interfaces';
import { HandlebarsCoreModule } from './handlebars-core.module';
import { createSubModuleProviders } from './handlebars.providers';

@Module({})
export class HandlebarsModule {
  static forRoot(options: ModuleOptions): DynamicModule {
    return {
      module: HandlebarsModule,
      imports: [HandlebarsCoreModule.forRoot(options)],
    };
  }

  static forSubModule(
    moduleName: string,
    options: SubModuleOptions,
  ): DynamicModule {
    const provider = createSubModuleProviders(moduleName, options);
    return {
      module: HandlebarsModule,
      providers: [provider],
      exports: [provider],
    };
  }

  static forRootAsync(options: ModuleAsyncOptions): DynamicModule {
    return {
      module: HandlebarsModule,
      imports: [HandlebarsCoreModule.forRootAsync(options)],
    };
  }
}
