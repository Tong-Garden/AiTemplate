/** Request body for `PUT /v1/users/{id}`; omitted fields stay unchanged. */
export type UpdateUserDto = {
  name?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
};
