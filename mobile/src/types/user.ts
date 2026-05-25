export interface User {
  Id: string;
  Name: string;
  Email: string;
  Role: 'CLIENT' | 'PROFESSIONAL';
}

export interface SyncUserResponse {
  Token: string;
  UserId: string;
  Name: string;
  Email: string;
  Role: 'CLIENT' | 'PROFESSIONAL';
}
