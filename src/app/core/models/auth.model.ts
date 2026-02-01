export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
