import { Injectable } from '@nestjs/common';
import { HandlebarsService, InjectHandlebars } from '../../../../lib';

@Injectable()
export class SmsService {
  @InjectHandlebars('sms') private readonly handlebars: HandlebarsService;

  compileSmsTest() {
    return this.handlebars.compile('sms-test');
  }

  compileSmsWithLocale(locale?: string) {
    return this.handlebars.compile(`sms-with-locale`, {}, locale);
  }

  compileSmsWithPartial() {
    return this.handlebars.compile('sms-with-partial');
  }

  compileSmsWithPartialWithParam(param: { name: string }) {
    return this.handlebars.compile('sms-with-partial-with-param', param);
  }
}
