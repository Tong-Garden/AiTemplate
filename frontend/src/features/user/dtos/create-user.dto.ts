export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  is_active?: boolean;
}
