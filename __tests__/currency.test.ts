import {
  formatCurrency,
  getCurrencySymbol,
  DEFAULT_CURRENCY,
} from "../utils/currency";

describe("currency utility", () => {
  it("formats positive USD amounts correctly", () => {
    const formatted = formatCurrency(2550, "USD", "en-US");
    expect(formatted).toBe("$25.50");
  });

  it("formats zero amount correctly", () => {
    const formatted = formatCurrency(0, "USD", "en-US");
    expect(formatted).toBe("$0.00");
  });

  it("formats negative amounts correctly", () => {
    const formatted = formatCurrency(-1550, "USD", "en-US");
    expect(formatted).toBe("-$15.50");
  });

  it("handles different currencies like EUR and GBP", () => {
    const eur = formatCurrency(1000, "EUR", "en-US");
    expect(eur).toContain("€");
    expect(eur).toContain("10.00");

    const gbp = formatCurrency(4999, "GBP", "en-GB");
    expect(gbp).toContain("£");
    expect(gbp).toContain("49.99");
  });

  it("falls back gracefully on invalid currency code", () => {
    const fallback = formatCurrency(1200, "INVALID", "en-US");
    expect(fallback).toContain("12.00");
  });

  it("returns correct currency symbols", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("EUR")).toBe("€");
    expect(getCurrencySymbol("GBP")).toBe("£");
    expect(getCurrencySymbol("GHS")).toBe("₵");
    expect(getCurrencySymbol("UNKNOWN")).toBe("UNKNOWN");
  });
});
