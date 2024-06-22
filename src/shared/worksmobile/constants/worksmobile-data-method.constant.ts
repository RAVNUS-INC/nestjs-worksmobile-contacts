export const WorksmobileDataMethod = {
  GetContacts: 'getContacts',
  GetDirectoryUsers: 'getDirectoryUsers',
};

export type WorksmobileDataMethodType =
  (typeof WorksmobileDataMethod)[keyof typeof WorksmobileDataMethod];
