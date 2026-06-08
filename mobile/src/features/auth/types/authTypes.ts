export type User = {
  id: string;
  name: string;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  Token: string;
  UserId: string;
  Name: string;
  Email: string;
  Role: string;
};

