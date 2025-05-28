import type { Config } from 'tailwindcss';

const config = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
		'*.{js,ts,jsx,tsx,mdx}',
		// Add your new components library path here if it's separate
		'./node_modules/@spookcord/ui-components/src/**/*.{svelte,ts}'
	],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Core UI colors - these define the overall theme
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},

				// Semantic Colors based on your components' usage
				// Primary is now the dominant action color (e.g., the "orange" from JoinServerPopup)
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))' // Should be text color on primary
				},
				// Accent is often used for highlights or secondary important actions,
				// if it's different from primary. Given your current usage, it seems
				// 'accent' was already the main orange/highlight.
				// Let's ensure 'accent' and 'primary' are distinct if needed, or point to the same base.
				// For now, I'll assume 'accent' is still the main "orange" if 'primary' shifts to another base.
				// If the orange IS primary, then accent might be a lighter/darker shade or an entirely different highlight.
				// Based on your component code, `accent` is definitely the orange. Let's map `primary` to `accent`.
				accent: {
					DEFAULT: 'hsl(var(--accent))', // This is your bright orange/main highlight
					foreground: 'hsl(var(--accent-foreground))' // Should be text color on accent
				},
				// Secondary can be for less prominent actions or elements
				secondary: {
					DEFAULT: 'hsl(var(--secondary))', // This seems to be a purple/blue from the JoinServerPopup icon
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},

				// Component-specific or utility colors derived from the above or custom
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				'input-bg': 'hsl(var(--input-bg))', // For input background
				ring: 'hsl(var(--ring))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				tooltip: 'hsl(var(--tooltip))',

				// Specific UI section backgrounds - consider if these should be more generic like `surface-1`, `surface-2`
				// or just derive from `background` with opacities
				sidebar: 'hsl(var(--sidebar))',
				'channel-list': 'hsl(var(--channel-list))',
				'chat-area': 'hsl(var(--chat-area))',
				'members-list': 'hsl(var(--members-list))',
				'user-panel': 'hsl(var(--user-panel))',

				// Specific element colors
				separator: 'hsl(var(--separator))',
				button: 'hsl(var(--button))', // Base for default button background
				'button-hover': 'hsl(var(--button-hover))', // Base for default button hover background
				'message-hover': 'hsl(var(--message-hover))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				flicker: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
					'50%': { opacity: '0.8', transform: 'scale(1.05)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				flicker: 'flicker 3s ease-in-out infinite',
				float: 'float 6s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require('tailwindcss-animate')]
} satisfies Config;

export default config;
