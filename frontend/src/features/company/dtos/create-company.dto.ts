/** Request body for `POST /v1/companies`. */
export type CreateCompanyDto = {
  name: string;
  address: string;
  phone_number: string;
  timezone: string;
};
