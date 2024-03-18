import { Inject } from '@nestjs/common';
import { getModuleToken } from './handlebars.utils';

export const InjectHandlebars = (moduleName: string) =>
  Inject(getModuleToken(moduleName));
