type IntlWithTimeZones = typeof Intl & {
  supportedValuesOf?: (key: 'timeZone') => string[];
};

const FALLBACK_TIMEZONES = [
  'UTC',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
];

const loadTimezones = (): string[] => {
  const names = (Intl as IntlWithTimeZones).supportedValuesOf?.('timeZone') ?? FALLBACK_TIMEZONES;
  return names.includes('UTC') ? names : ['UTC', ...names];
};

/** IANA timezone names the browser knows, with UTC always present; the backend stays the authority. */
export const TIMEZONES: string[] = loadTimezones();

/** Same names as objects, the shape the grid's dropdown editor needs to preselect the row's value. */
export const TIMEZONE_OPTIONS: Array<{ timezone: string }> = TIMEZONES.map((timezone) => ({
  timezone,
}));
