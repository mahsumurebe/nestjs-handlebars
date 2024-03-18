import { Module } from '@nestjs/common';
import * as path from 'path';
import { HandlebarsModule } from '../../../../lib';
import { SmsService } from './sms.service';

@Module({
  imports: [
    HandlebarsModule.forSubModule('sms', {
      templateDirectory: path.join(__dirname, 'templates'),
      partialDirectories: [path.join(__dirname, 'partials')],
      i18n: {
        use: true,
        directories: [path.join(__dirname, 'i18n')],
      },
    }),
  ],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
