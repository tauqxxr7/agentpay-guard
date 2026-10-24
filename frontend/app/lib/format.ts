export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const humanize = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/^./, character => character.toUpperCase());
export const redactOrder = (id?: string | null) => id && id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-4)}` : 'Unavailable';
export const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Pending';
