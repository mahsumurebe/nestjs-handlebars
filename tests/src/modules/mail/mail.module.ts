import { Module } from '@nestjs/common';
import * as path from 'path';
import { HandlebarsModule } from '../../../../lib';
import { MailService } from './mail.service';

@Module({
  imports: [
    HandlebarsModule.forSubModule('mail', {
      templateDirectory: path.join(__dirname, 'templates'),
      partialDirectories: ['partials'],
      i18n: {
        use: true,
        i18nHelperName: 't',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
