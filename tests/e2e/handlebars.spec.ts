import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from '../src/app.module';
import { MailService } from '../src/modules/mail/mail.service';
import { SmsService } from '../src/modules/sms/sms.service';

describe('Handlebars', () => {
  let app: INestApplication;
  let mailService: MailService;
  let smsService: SmsService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    mailService = moduleFixture.get<MailService>(MailService);
    smsService = moduleFixture.get<SmsService>(SmsService);
    await app.init();
  });

  describe('Mail', () => {
    it('should compile mail-test', () => {
      expect(mailService.compileMailTest().trim()).toBe('Test1');
    });
    it('should compile mail-sub-folder', () => {
      expect(mailService.compileMailSubFolder().trim()).toBe(
        'It is a sub-folder',
      );
    });

    describe('Partials', () => {
      it('should compile mail-with-partial', () => {
        expect(mailService.compileMailWithPartial().trim()).toBe(
          'Mail Head\n' + 'Partial Test',
        );
      });

      it('should compile mail with partial with param', () => {
        expect(
          mailService.compileMailWithPartialWithParam({ name: 'John' }).trim(),
        ).toBe('Mail Head With Partial Hi John\n' + 'Partial With Param Test');
      });
    });

    describe('Locale', () => {
      it('should compile mail-with-locale template with en locale', () => {
        expect(mailService.compileMailWithLocale().trim()).toBe(
          'value-en-1 Locale: en',
        );
      });
      it('should compile mail-with-locale template default locale (en)', () => {
        expect(mailService.compileMailWithLocale('en').trim()).toBe(
          'value-en-1 Locale: en',
        );
      });
      it('should compile mail-with-locale template with tr locale', () => {
        expect(mailService.compileMailWithLocale('tr').trim()).toBe(
          'value-tr-1 Locale: tr',
        );
      });
      it('should translate mail-with-locale template with default locale', () => {
        expect(mailService.getTranslate('mail.param1').trim()).toBe(
          'value-en-1',
        );
      });
      it('should translate mail-with-locale template with en locale', () => {
        expect(mailService.getTranslate('mail.param1', 'en').trim()).toBe(
          'value-en-1',
        );
      });
      it('should translate mail-with-locale template with tr locale', () => {
        expect(mailService.getTranslate('mail.param1', 'tr').trim()).toBe(
          'value-tr-1',
        );
      });
    });
  });
  describe('Sms', () => {
    it('should compile sms-test', () => {
      expect(smsService.compileSmsTest().trim()).toBe('Test1');
    });

    describe('Partials', () => {
      it('should compile sms-with-partial', () => {
        expect(smsService.compileSmsWithPartial().trim()).toBe(
          'SMS Head\n' + 'Partial Test',
        );
      });

      it('should compile sms with partial with param', () => {
        expect(
          smsService.compileSmsWithPartialWithParam({ name: 'John' }).trim(),
        ).toBe('SMS Head With Partial Hi John\n' + 'Partial With Param Test');
      });
    });

    describe('Locale', () => {
      it('should compile sms-with-locale template with en locale', () => {
        expect(smsService.compileSmsWithLocale().trim()).toBe(
          'value-en-1 Locale: en',
        );
      });
      it('should compile sms-with-locale template default locale (en)', () => {
        expect(smsService.compileSmsWithLocale('en').trim()).toBe(
          'value-en-1 Locale: en',
        );
      });
      it('should compile sms-with-locale template with tr locale', () => {
        expect(smsService.compileSmsWithLocale('tr').trim()).toBe(
          'value-tr-1 Locale: tr',
        );
      });
    });
  });
});
