import { BaseException } from './base.exception';

export class TemplateNotFoundException extends BaseException {
  constructor(public readonly templateName: string) {
    super(`Template "${templateName}" not found`);
  }
}
