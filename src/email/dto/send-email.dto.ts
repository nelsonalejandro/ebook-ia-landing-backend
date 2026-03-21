import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty()
  email: string;
}
