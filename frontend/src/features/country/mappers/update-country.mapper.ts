import type { UpdateCountryDto } from '../dtos';
import type { updateCountrySchema } from '../schemas';
import type { z } from 'zod';

type ValidatedUpdateCountry = z.output<typeof updateCountrySchema>;

/** Maps validated update-country values to the request DTO. */
export const updateCountryMapper = {
  toDto: (data: ValidatedUpdateCountry): UpdateCountryDto => ({
    name: data.name,
    iso_code: data.iso_code,
    phone_code: data.phone_code,
  }),
};
