import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SendMailService {
    constructor(private readonly mailerService: MailerService) {}

  async sendMail(payload: any) {
    try {
      await this.mailerService.sendMail({
        to: payload.mail,
        from: 'vasudevgarg7@gmail.com',
        subject: 'Quotes',
        text: '',
      });
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }
}