import { IsBoolean, IsEmail } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ContactEmailDataDto {
  @Expose()
  @IsBoolean()
  primary!: boolean;

  @Expose()
  @IsEmail()
  email!: string;
}
