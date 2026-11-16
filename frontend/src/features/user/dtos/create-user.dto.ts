/** Request body for `POST /v1/users`. */
export type CreateUserDto = {
  name: string;
  email: string;
  phone: string;
  is_active?: boolean;
};
