const required = ["JWT_SECRET", "MONGO_URI"];

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (!missing.length) return;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  console.warn(`[env] Missing variables in development: ${missing.join(", ")}`);
};

const getPublicBaseUrl = () => {
  const raw = String(process.env.BASE_URL || "").trim();
  if (raw) return raw.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    return "https://api.nouveauz.com";
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};

module.exports = { validateEnv, getPublicBaseUrl };
