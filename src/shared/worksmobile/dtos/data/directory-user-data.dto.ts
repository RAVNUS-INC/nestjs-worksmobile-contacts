import { Exclude, Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { ContactNameDataDto } from './contact-name-data.dto';
import { DirectoryUserOrganizationsDataDto } from './directory-user-organizations-data.dto';

@Exclude()
export class DirectoryUserDataDto {
  @Expose()
  userId!: string;

  @Expose()
  @IsString()
  cellPhone!: string;

  @Expose()
  @IsString()
  levelName!: string;

  @Expose()
  @IsString()
  telephone!: string;

  @Expose()
  @IsString()
  userName!: Pick<ContactNameDataDto, 'firstName' | 'lastName'>;

  @Expose()
  @Type(() => DirectoryUserOrganizationsDataDto)
  organizations!: DirectoryUserOrganizationsDataDto[];
}
