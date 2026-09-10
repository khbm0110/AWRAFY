import { IsIn, IsString } from 'class-validator';

export class SendConfirmationDto {
  @IsString()
  orderId!: string;

  @IsIn(['whatsapp', 'sms', 'call'])
  channel!: string;
}
