/** Request body for `POST /v1/countries`. */
export type CreateCountryDto = {
  name: string;
  iso_code: string;
  phone_code: string;
};
