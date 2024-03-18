import { BaseException } from './base.exception';

export class InvalidI18nFolderException extends BaseException {
  constructor(public readonly folder: string) {
    super(`Invalid i18n folder: ${folder}`);
  }
}
