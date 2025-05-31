import { beforeAll } from 'vitest';
// Replace your-framework with the framework you are using, e.g. sveltekit or svelte-vite
import { setProjectAnnotations } from '@storybook/sveltekit';
import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([previewAnnotations]);

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll);
