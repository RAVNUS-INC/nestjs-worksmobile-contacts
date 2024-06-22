export interface UserBulkInsertInterface {
  id: string;
  name: string;
  isInternal: string;
  emails?: string;
  telephoneCellphone?: string;
  telephoneWork?: string;
  telephoneWorkFax?: string;
  telephoneHome?: string;
  telephoneHomeFax?: string;
  telephoneOther?: string;
  telephoneCustom?: string;
  organizations?: string;
  createdTime?: string;
  modifiedTime?: string;
}
