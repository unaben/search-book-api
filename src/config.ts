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
    providerA: requireEnv("PROVIDER_A_BASE_URL"),
    providerB: requireEnv("PROVIDER_B_BASE_URL"),
    providerC: requireEnv("PROVIDER_C_BASE_URL"),
    providerD: requireEnv('PROVIDER_D_BASE_URL'),
    providerE: requireEnv("PROVIDER_E_BASE_URL"), 
  },
} as const;