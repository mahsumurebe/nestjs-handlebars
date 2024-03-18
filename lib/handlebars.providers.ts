import { Provider } from '@nestjs/common';
import * as path from 'path';
import * as _ from 'lodash';
import { getModuleToken } from './common';
import { ModuleOptions, SubModuleOptions } from './interfaces';
import { HANDLEBARS_MODULE_OPTIONS } from './handlebars.constants';
import { HandlebarsService } from './handlebars.service';

export function createSubModuleProviders(
  moduleName: string,
  options: SubModuleOptions,
): Provider {
  return {
    provide: getModuleToken(moduleName),
    useFactory: (moduleOptions: ModuleOptions) => {
      if (!options?.i18n?.directories) {
        _.set(options, 'i18n.directories', [
          path.join(
            options.templateDirectory,
            options.i18n?.defaultDirectoryName || 'locales',
          ),
        ]);
      }

      const serviceOptions: SubModuleOptions = _.defaultsDeep(
        options,
        moduleOptions,
      );
      serviceOptions.i18n!.directories = [
        ...(options?.i18n?.directories || []),
        ...(moduleOptions.i18n?.directories || []),
      ];

      if (serviceOptions.partialDirectories) {
        serviceOptions.partialDirectories = [
          ...(options?.partialDirectories || []),
          ...(moduleOptions.partialDirectories || []),
        ];
      }

      return new HandlebarsService(moduleName, serviceOptions);
    },
    inject: [HANDLEBARS_MODULE_OPTIONS],
  };
}
