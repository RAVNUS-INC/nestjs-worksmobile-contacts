import { Exclude, Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { DirectoryUserOrgUnitDataDto } from './directory-user-org-unit-data.dto';

@Exclude()
export class DirectoryUserOrganizationsDataDto {
  @Expose()
  @IsString()
  levelName!: string;

  @Expose()
  @Type(() => DirectoryUserOrgUnitDataDto)
  orgUnits!: DirectoryUserOrgUnitDataDto[];
}
