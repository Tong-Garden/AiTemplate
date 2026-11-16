/** Request body for `PUT /v1/companies/{id}`; omitted fields stay unchanged. */
export type UpdateCompanyDto = {
  name?: string;
  address?: string;
  phone_number?: string;
  timezone?: string;
};
