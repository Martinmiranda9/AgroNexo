// TODO: implementar
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    AUTH0_SECRET: z.string().min(1, 'AUTH0_SECRET is required'),
    AUTH0_BASE_URL: z.string().url('AUTH0_BASE_URL must be a valid URL'),
    AUTH0_ISSUER_BASE_URL: z.string().url('AUTH0_ISSUER_BASE_URL must be a valid URL'),
    AUTH0_CLIENT_ID: z.string().min(1, 'AUTH0_CLIENT_ID is required'),
    AUTH0_CLIENT_SECRET: z.string().min(1, 'AUTH0_CLIENT_SECRET is required'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === 'test',
});
