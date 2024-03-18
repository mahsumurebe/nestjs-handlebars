import { DEFAULT_MODULE_NAME } from '../handlebars.constants';

export function getModuleToken(moduleName: string = DEFAULT_MODULE_NAME) {
  return `Handlebars${moduleName}Token`;
}
