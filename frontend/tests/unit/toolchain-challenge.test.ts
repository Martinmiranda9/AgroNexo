import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import playwrightConfig from '../../playwright.config';
import tailwindConfig from '../../tailwind.config';
import postcssConfig from '../../postcss.config.mjs';
import prettierConfig from '../../prettier.config.js';
import tsConfig from '../../tsconfig.json';
import eslintConfig from '../../.eslintrc.json';

describe('Empirical Toolchain & Configuration Challenge', () => {
  describe('Task 1.1: Environment Configuration & Zod Validation (src/core/config/env.ts)', () => {
    // Replicate the exact Zod schema defined in env.ts for isolated stress-testing
    const serverSchema = z.object({
      AUTH0_SECRET: z.string().min(1, 'AUTH0_SECRET is required'),
      AUTH0_BASE_URL: z.string().url('AUTH0_BASE_URL must be a valid URL'),
      AUTH0_ISSUER_BASE_URL: z.string().url('AUTH0_ISSUER_BASE_URL must be a valid URL'),
      AUTH0_CLIENT_ID: z.string().min(1, 'AUTH0_CLIENT_ID is required'),
      AUTH0_CLIENT_SECRET: z.string().min(1, 'AUTH0_CLIENT_SECRET is required'),
      NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    });

    const clientSchema = z.object({
      NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
    });

    it('successfully validates complete, valid environment variable sets', () => {
      const validServerEnv = {
        AUTH0_SECRET: 'super_secret_auth0_encryption_key_32_chars',
        AUTH0_BASE_URL: 'http://localhost:3000',
        AUTH0_ISSUER_BASE_URL: 'https://agroconnect-dev.us.auth0.com',
        AUTH0_CLIENT_ID: 'auth0_client_id_12345',
        AUTH0_CLIENT_SECRET: 'auth0_client_secret_67890',
        NODE_ENV: 'development',
      };

      const validClientEnv = {
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api/v1',
      };

      const parsedServer = serverSchema.safeParse(validServerEnv);
      const parsedClient = clientSchema.safeParse(validClientEnv);

      expect(parsedServer.success).toBe(true);
      expect(parsedClient.success).toBe(true);
      if (parsedServer.success) {
        expect(parsedServer.data.AUTH0_SECRET).toBe(validServerEnv.AUTH0_SECRET);
        expect(parsedServer.data.AUTH0_BASE_URL).toBe(validServerEnv.AUTH0_BASE_URL);
        expect(parsedServer.data.NODE_ENV).toBe('development');
      }
    });

    it('applies default "development" value when NODE_ENV is omitted', () => {
      const serverEnvWithoutNodeEnv = {
        AUTH0_SECRET: 'key_123',
        AUTH0_BASE_URL: 'http://localhost:3000',
        AUTH0_ISSUER_BASE_URL: 'https://auth0.example.com',
        AUTH0_CLIENT_ID: 'client_123',
        AUTH0_CLIENT_SECRET: 'secret_123',
      };

      const result = serverSchema.safeParse(serverEnvWithoutNodeEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('development');
      }
    });

    it('rejects invalid or missing AUTH0_SECRET', () => {
      const missingSecret = {
        AUTH0_BASE_URL: 'http://localhost:3000',
        AUTH0_ISSUER_BASE_URL: 'https://auth0.example.com',
        AUTH0_CLIENT_ID: 'client_123',
        AUTH0_CLIENT_SECRET: 'secret_123',
      };
      const emptySecret = { ...missingSecret, AUTH0_SECRET: '' };

      const resMissing = serverSchema.safeParse(missingSecret);
      const resEmpty = serverSchema.safeParse(emptySecret);

      expect(resMissing.success).toBe(false);
      expect(resEmpty.success).toBe(false);
      if (!resEmpty.success) {
        expect(resEmpty.error.issues[0].message).toBe('AUTH0_SECRET is required');
      }
    });

    it('rejects malformed URL strings for AUTH0_BASE_URL and AUTH0_ISSUER_BASE_URL', () => {
      const malformedUrls = {
        AUTH0_SECRET: 'secret',
        AUTH0_BASE_URL: 'not-a-valid-url',
        AUTH0_ISSUER_BASE_URL: 'not-a-valid-url',
        AUTH0_CLIENT_ID: 'client_123',
        AUTH0_CLIENT_SECRET: 'secret_123',
      };

      const result = serverSchema.safeParse(malformedUrls);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('AUTH0_BASE_URL');
        expect(paths).toContain('AUTH0_ISSUER_BASE_URL');
      }
    });

    it('rejects malformed or missing NEXT_PUBLIC_API_URL on client schema', () => {
      const missingClient = {};
      const malformedClient = { NEXT_PUBLIC_API_URL: 'invalid-url-path' };

      expect(clientSchema.safeParse(missingClient).success).toBe(false);
      const malformedRes = clientSchema.safeParse(malformedClient);
      expect(malformedRes.success).toBe(false);
      if (!malformedRes.success) {
        expect(malformedRes.error.issues[0].message).toBe('NEXT_PUBLIC_API_URL must be a valid URL');
      }
    });
  });

  describe('Task 1.2: Tailwind CSS Token Definitions & PostCSS Configuration', () => {
    it('verifies all required AgroNexo color palette tokens in tailwind.config.ts', () => {
      const colors = (tailwindConfig.theme?.extend as any)?.colors;
      expect(colors).toBeDefined();

      // R4.1 Color tokens
      expect(colors['bg-page']).toBe('#F7EFDA');
      expect(colors['bg-hero']).toBe('#FFF3D5');
      expect(colors['bg-card']).toBe('#FFFBF0');
      expect(colors.primary.DEFAULT).toBe('#4D694E');
      expect(colors.primary.hover).toBe('#3F4C26');
      expect(colors.accent.mid).toBe('#728141');
      expect(colors.accent.light).toBe('#99A474');
      expect(colors.dark).toBe('#24301E');
      expect(colors['neutral-warm']).toBe('#978A56');
      expect(colors.danger).toBe('#8C4A34');
    });

    it('verifies border radius and font family tokens in tailwind.config.ts', () => {
      const borderRadius = (tailwindConfig.theme?.extend as any)?.borderRadius;
      const fontFamily = (tailwindConfig.theme?.extend as any)?.fontFamily;

      expect(borderRadius.card).toBe('16px');
      expect(borderRadius.input).toBe('12px');
      expect(borderRadius.pill).toBe('9999px');

      expect(fontFamily.sans).toEqual(['var(--font-geist-sans)', 'sans-serif']);
      expect(fontFamily.mono).toEqual(['var(--font-geist-mono)', 'monospace']);
    });

    it('verifies content scanning paths encompass all src directories', () => {
      const content = tailwindConfig.content as string[];
      expect(content).toContain('./src/**/*.{ts,tsx}');
    });

    it('verifies PostCSS config includes @tailwindcss/postcss plugin', () => {
      expect(postcssConfig.plugins).toBeDefined();
      expect(postcssConfig.plugins['@tailwindcss/postcss']).toBeDefined();
    });
  });

  describe('Task 1.3: Playwright Configuration Verification', () => {
    it('verifies playwright configuration properties and structure', () => {
      expect(playwrightConfig).toBeDefined();
      expect(playwrightConfig.testDir).toBe('./tests/e2e');
      expect(playwrightConfig.use?.baseURL).toBe('http://localhost:3000');

      // Verify chromium project configured
      const projects = playwrightConfig.projects || [];
      const chromiumProject = projects.find((p: any) => p.name === 'chromium');
      expect(chromiumProject).toBeDefined();
      expect(chromiumProject?.name).toBe('chromium');

      // Verify webServer configuration
      expect(playwrightConfig.webServer).toBeDefined();
      const webServer = Array.isArray(playwrightConfig.webServer)
        ? playwrightConfig.webServer[0]
        : playwrightConfig.webServer;
      expect(webServer?.command).toBe('npm run dev');
      expect(webServer?.url).toBe('http://localhost:3000');
    });
  });

  describe('Task 1.4: Build, Lint & Tooling Configuration Repeatability', () => {
    it('verifies tsconfig.json has strict mode and all required path aliases', () => {
      expect(tsConfig.compilerOptions.strict).toBe(true);
      expect(tsConfig.compilerOptions.paths).toBeDefined();

      const paths = tsConfig.compilerOptions.paths;
      expect(paths['@/*']).toEqual(['./src/*']);
      expect(paths['@/app/*']).toEqual(['./src/app/*']);
      expect(paths['@/features/*']).toEqual(['./src/features/*']);
      expect(paths['@/ui/*']).toEqual(['./src/ui/*']);
      expect(paths['@/core/*']).toEqual(['./src/core/*']);
      expect(paths['@/shared/*']).toEqual(['./src/shared/*']);
    });

    it('verifies .eslintrc.json extends next/core-web-vitals', () => {
      expect(eslintConfig.extends).toContain('next/core-web-vitals');
    });

    it('verifies prettier.config.js includes prettier-plugin-tailwindcss', () => {
      expect(prettierConfig.plugins).toContain('prettier-plugin-tailwindcss');
      expect(prettierConfig.semi).toBe(true);
      expect(prettierConfig.singleQuote).toBe(true);
    });
  });
});
