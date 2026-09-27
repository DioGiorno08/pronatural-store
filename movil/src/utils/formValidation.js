export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());

export const parsePositiveAmount = (value) => {
  const amount = Number(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
};

export const parseNonNegativeInteger = (value) => {
  const text = String(value ?? "").trim();
  if (!/^\d+$/.test(text)) return null;
  const amount = Number(text);
  return Number.isSafeInteger(amount) ? amount : null;
};

export const normalizeApiUrl = (value) => {
  const cleanUrl = String(value || "").trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(cleanUrl);
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
      return null;
    }
    return cleanUrl;
  } catch {
    return null;
  }
};
