import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ContactOrganizationDataDto {
  @Expose()
  @IsBoolean()
  primary!: boolean;

  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsString()
  @IsOptional()
  department?: string;

  @Expose()
  @IsString()
  @IsOptional()
  title?: string;
}
