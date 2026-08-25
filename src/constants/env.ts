import { z } from 'zod';

/**
 * Validates `import.meta.env` once at module load, so a misconfigured deploy
 * fails loudly at startup instead of silently shipping an empty API base URL or
 * a stray `ENABLE_MOCKS` typo to production. Three of our four real projects
 * skip this entirely (raw `import.meta.env.VITE_X` access, no schema) — one
 * even shipped dead CRA-style `process.env` code as a result. This is the
 * boilerplate closing that gap.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default(''),
  VITE_ENABLE_MOCKS: z.enum(['true', 'false']).default('true'),
});

function parseEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

export const ENV = parseEnv();
