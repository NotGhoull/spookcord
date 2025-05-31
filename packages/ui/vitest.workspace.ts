import { defineWorkspace } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'node:path';

export default defineWorkspace([
	// If you want to keep running your existing tests in Node.js, uncomment the next line.
	// 'vite.config.ts',
	{
		extends: 'vite.config.ts',
		plugins: [
			storybookTest({
				configDir: path.join(__dirname, '.storybook')
			})
		],
		test: {
			browser: {
				enabled: true,
				provider: 'playwright',
				// https://vitest.dev/guide/browser/playwright
				headless: false,
				instances: [{ browser: 'chromium' }]
			},
			setupFiles: ['./.storybook/vitest.setup.ts']
		}
	}
]);
