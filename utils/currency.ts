export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "GHS", symbol: "₵", label: "Ghana Cedi (₵)" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar (CA$)" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar (A$)" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen (¥)" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira (₦)" },
  { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
] as const;

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_LOCALE = "en-US";

/**
 * Formats minor currency units (e.g. cents) into a formatted currency string.
 *
 * @param amountMinor Amount in integer minor units (e.g. 1050 for $10.50)
 * @param currency ISO 4217 currency code (default: 'USD')
 * @param locale Locale string (default: 'en-US')
 * @returns Formatted currency string (e.g. "$10.50")
 */
export function formatCurrency(
  amountMinor: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  const amount = (amountMinor || 0) / 100;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || DEFAULT_CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if locale or currency code is invalid
    const sign = amount < 0 ? "-" : "";
    const abs = Math.abs(amount).toFixed(2);
    return `${sign}${currency} ${abs}`;
  }
}

/**
 * Returns currency symbol for a currency code.
 */
export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  const match = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === currency.toUpperCase());
  return match?.symbol || currency;
}
