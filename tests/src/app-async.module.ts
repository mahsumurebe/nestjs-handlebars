import { Module } from '@nestjs/common';
import { HandlebarsModule } from '../../lib';
import { MailModule } from './modules/mail/mail.module';
import { SmsModule } from './modules/sms/sms.module';

@Module({
  imports: [
    HandlebarsModule.forRootAsync({
      imports: [],
      useFactory: async () => ({
        i18n: {
          use: true,
          i18nHelperName: 'i18n',
        },
      }),
    }),
    MailModule,
    SmsModule,
  ],
})
export class ApplicationModule {}
