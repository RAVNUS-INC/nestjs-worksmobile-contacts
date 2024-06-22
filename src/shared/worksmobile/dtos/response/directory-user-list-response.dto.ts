import { Exclude, Expose, Type } from 'class-transformer';
import { DirectoryUserDataDto } from '../data/directory-user-data.dto';

@Exclude()
export class DirectoryUserListResponseDto {
  @Expose()
  @Type(() => DirectoryUserDataDto)
  users!: DirectoryUserDataDto[];
}
