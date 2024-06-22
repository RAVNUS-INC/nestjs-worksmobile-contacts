import { ContactNameDataDto } from './contact-name-data.dto';
import { ContactEmailDataDto } from './contact-email-data.dto';
import { ContactTelephoneDataDto } from './contact-telephone-data.dto';
import { ContactOrganizationDataDto } from './contact-organization-data.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

@Exclude()
export class ContactDataDto {
  @Expose()
  contactId!: string;

  @Expose()
  @Type(() => ContactNameDataDto)
  contactName!: ContactNameDataDto;

  @Expose()
  @IsArray()
  @Type(() => ContactEmailDataDto)
  emails!: ContactEmailDataDto[];

  @Expose()
  @IsArray()
  @Type(() => ContactTelephoneDataDto)
  telephones!: ContactTelephoneDataDto[];

  @Expose()
  @IsArray()
  @Type(() => ContactOrganizationDataDto)
  organizations!: ContactOrganizationDataDto[];

  @Expose()
  @IsString()
  createdTime!: string;

  @Expose()
  @IsString()
  modifiedTime!: string;
}
