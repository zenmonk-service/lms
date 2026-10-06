import { Module } from '@nestjs/common';
import { SendMailService } from './send-mail.service';
import { MailModule } from '../../infrastructure/http/mailer/mailer.module';

@Module({
    imports: [MailModule],
    providers: [SendMailService],
    exports: [SendMailService],
})
export class SendMailModule {}