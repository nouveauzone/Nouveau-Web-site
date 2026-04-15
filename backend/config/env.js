const required = ["JWT_SECRET", "MONGO_URI"];

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (!missing.length) return;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  console.warn(`[env] Missing variables in development: ${missing.join(", ")}`);
};

module.exports = { validateEnv };
