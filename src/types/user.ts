// src/types/user.ts
import { Role } from '../constants/roles';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
