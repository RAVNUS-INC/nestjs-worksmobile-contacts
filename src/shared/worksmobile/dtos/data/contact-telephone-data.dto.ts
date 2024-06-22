import { IsBoolean, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ContactTelephoneDataDto {
  @Expose()
  @IsBoolean()
  primary!: boolean;

  @Expose()
  @IsString()
  telephone!: string;

  @Expose()
  @IsString()
  type!: string;
}
