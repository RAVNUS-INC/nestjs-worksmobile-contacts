import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ContactNameDataDto {
  @Expose()
  @IsString()
  @IsOptional()
  lastName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  firstName?: string;
}
