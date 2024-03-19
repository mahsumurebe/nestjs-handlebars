import { Injectable } from '@nestjs/common';
import { HandlebarsService, InjectHandlebars } from '../../../../lib';

@Injectable()
export class MailService {
  @InjectHandlebars('mail') private readonly handlebars: HandlebarsService;

  compileMailTest() {
    return this.handlebars.compile('mail-test');
  }

  compileMailSubFolder(locale?: string) {
    return this.handlebars.compile(`sub-folder/mail-sub-folder`, {}, locale);
  }

  compileMailWithLocale(locale?: string) {
    return this.handlebars.compile(`mail-with-locale`, {}, locale);
  }

  compileMailWithPartial() {
    return this.handlebars.compile('mail-with-partial');
  }

  compileMailWithPartialWithParam(param: { name: string }) {
    return this.handlebars.compile('mail-with-partial-with-param', param);
  }

  getTranslate(key: string, locale?: string) {
    return this.handlebars.translate(
      key,
      locale
        ? {
            lng: locale,
          }
        : undefined,
    );
  }
}
