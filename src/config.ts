import dotenv from "dotenv";

dotenv.config({ quiet: true });

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: parseInt(process.env["PORT"] ?? "8080", 10),

  providers: {
    a: requireEnv("PROVIDER_A_BASE_URL"),
    b: requireEnv("PROVIDER_B_BASE_URL"),
    c: requireEnv("PROVIDER_C_BASE_URL"),
    d: requireEnv('PROVIDER_D_BASE_URL'),
    e: requireEnv("PROVIDER_E_BASE_URL"), 
  },
} as const;