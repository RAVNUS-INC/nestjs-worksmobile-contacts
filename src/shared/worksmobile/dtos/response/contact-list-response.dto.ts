import { ContactDataDto } from '../data/contact-data.dto';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ContactListResponseDto {
  @Expose()
  @Type(() => ContactDataDto)
  contacts!: ContactDataDto[];
}
