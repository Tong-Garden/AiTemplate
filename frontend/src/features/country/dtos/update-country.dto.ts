/** Request body for `PUT /v1/countries/{id}`; omitted fields stay unchanged. */
export type UpdateCountryDto = {
  name?: string;
  iso_code?: string;
  phone_code?: string;
};
