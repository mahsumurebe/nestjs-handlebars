import { Module } from '@nestjs/common';
import { HandlebarsModule } from '../../lib';
import { MailModule } from './modules/mail/mail.module';
import { SmsModule } from './modules/sms/sms.module';

@Module({
  imports: [
    HandlebarsModule.forRoot({
      i18n: {
        use: true,
        i18nHelperName: 'i18n',
        directories: [__dirname + '/global-locale'],
      },
      partialDirectories: [__dirname + '/global-partials'],
    }),
    MailModule,
    SmsModule,
  ],
})
export class ApplicationModule {}
