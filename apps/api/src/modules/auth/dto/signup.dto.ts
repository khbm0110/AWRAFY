import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(2)
  storeName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10) // كلمة سر قوية إجبارية — تفصيل صارم أكثر يتزاد لاحقا (complexity rules)
  password!: string;
}
