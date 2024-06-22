import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class DirectoryUserOrgUnitDataDto {
  @Expose()
  positionName!: string;

  @Expose()
  @IsString()
  levelName!: string;
}
