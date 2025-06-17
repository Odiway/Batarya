// src/constants/roles.ts
export enum Role {
  ADMIN = 'Admin',
  YONETICI = 'Yonetici',
  USTA = 'Usta',
}
export const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.YONETICI]: 'Yönetici',
  [Role.USTA]: 'Usta',
};
