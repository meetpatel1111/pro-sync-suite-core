
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				prosync: {
					50: '#f0f5ff',
					100: '#e0ebff',
					200: '#c1d7ff',
					300: '#92baff',
					400: '#5b94ff',
					500: '#3370ff',
					600: '#1a51f6',
					700: '#1240e3',
					800: '#1536b8',
					900: '#163293',
					950: '#111e54',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				// Enhanced animations
				'fadeInUp': {
					'0%': { opacity: '0', transform: 'translateY(40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fadeInDown': {
					'0%': { opacity: '0', transform: 'translateY(-40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fadeInLeft': {
					'0%': { opacity: '0', transform: 'translateX(-40px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'fadeInRight': {
					'0%': { opacity: '0', transform: 'translateX(40px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scaleIn': {
					'0%': { opacity: '0', transform: 'scale(0.8)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'scaleOut': {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'100%': { opacity: '0', transform: 'scale(0.8)' }
				},
				'slideInUp': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slideInDown': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slideInLeft': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slideInRight': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'zoomIn': {
					'0%': { opacity: '0', transform: 'scale(0.3)' },
					'50%': { opacity: '1' },
					'100%': { transform: 'scale(1)' }
				},
				'zoomOut': {
					'0%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '1' },
					'100%': { opacity: '0', transform: 'scale(0.3)' }
				},
				'rotateIn': {
					'0%': { opacity: '0', transform: 'rotate(-200deg)' },
					'100%': { opacity: '1', transform: 'rotate(0)' }
				},
				'flip': {
					'0%': { transform: 'perspective(400px) rotateY(-90deg)', opacity: '0' },
					'40%': { transform: 'perspective(400px) rotateY(-20deg)' },
					'60%': { transform: 'perspective(400px) rotateY(10deg)', opacity: '1' },
					'80%': { transform: 'perspective(400px) rotateY(-5deg)' },
					'100%': { transform: 'perspective(400px)' }
				},
				'wiggle': {
					'0%, 7%': { transform: 'rotateZ(0)' },
					'15%': { transform: 'rotateZ(-15deg)' },
					'20%': { transform: 'rotateZ(10deg)' },
					'25%': { transform: 'rotateZ(-10deg)' },
					'30%': { transform: 'rotateZ(6deg)' },
					'35%': { transform: 'rotateZ(-4deg)' },
					'40%, 100%': { transform: 'rotateZ(0)' }
				},
				'heartbeat': {
					'0%': { transform: 'scale(1)' },
					'14%': { transform: 'scale(1.3)' },
					'28%': { transform: 'scale(1)' },
					'42%': { transform: 'scale(1.3)' },
					'70%': { transform: 'scale(1)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'glow': {
					'0%': { boxShadow: '0 0 20px -10px currentColor' },
					'100%': { boxShadow: '0 0 20px 10px currentColor' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(10px)' }
				},
				'tada': {
					'0%': { transform: 'scale3d(1, 1, 1)' },
					'10%, 20%': { transform: 'scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg)' },
					'30%, 50%, 70%, 90%': { transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg)' },
					'40%, 60%, 80%': { transform: 'scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg)' },
					'100%': { transform: 'scale3d(1, 1, 1)' }
				},
				'bounce': {
					'0%, 20%, 53%, 80%, 100%': { 
						animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
						transform: 'translate3d(0,0,0)' 
					},
					'40%, 43%': { 
						animationTimingFunction: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
						transform: 'translate3d(0, -30px, 0)' 
					},
					'70%': { 
						animationTimingFunction: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
						transform: 'translate3d(0, -15px, 0)' 
					},
					'90%': { transform: 'translate3d(0,-4px,0)' }
				},
				'rubber-band': {
					'0%': { transform: 'scale3d(1, 1, 1)' },
					'30%': { transform: 'scale3d(1.25, 0.75, 1)' },
					'40%': { transform: 'scale3d(0.75, 1.25, 1)' },
					'50%': { transform: 'scale3d(1.15, 0.85, 1)' },
					'65%': { transform: 'scale3d(.95, 1.05, 1)' },
					'75%': { transform: 'scale3d(1.05, .95, 1)' },
					'100%': { transform: 'scale3d(1, 1, 1)' }
				},
				'jello': {
					'0%, 11.1%, 100%': { transform: 'none' },
					'22.2%': { transform: 'skewX(-12.5deg) skewY(-12.5deg)' },
					'33.3%': { transform: 'skewX(6.25deg) skewY(6.25deg)' },
					'44.4%': { transform: 'skewX(-3.125deg) skewY(-3.125deg)' },
					'55.5%': { transform: 'skewX(1.5625deg) skewY(1.5625deg)' },
					'66.6%': { transform: 'skewX(-0.78125deg) skewY(-0.78125deg)' },
					'77.7%': { transform: 'skewX(0.390625deg) skewY(0.390625deg)' },
					'88.8%': { transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)' }
				},
				'swing': {
					'20%': { transform: 'rotate3d(0, 0, 1, 15deg)' },
					'40%': { transform: 'rotate3d(0, 0, 1, -10deg)' },
					'60%': { transform: 'rotate3d(0, 0, 1, 5deg)' },
					'80%': { transform: 'rotate3d(0, 0, 1, -5deg)' },
					'100%': { transform: 'rotate3d(0, 0, 1, 0deg)' }
				},
				'flash': {
					'0%, 50%, 100%': { opacity: '1' },
					'25%, 75%': { opacity: '0' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'border-morph': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'typewriter': {
					'0%': { width: '0' },
					'100%': { width: '100%' }
				},
				'blur-in': {
					'0%': { filter: 'blur(20px)', opacity: '0' },
					'100%': { filter: 'blur(0)', opacity: '1' }
				},
				'neon-glow': {
					'0%': { textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
					'100%': { textShadow: '0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor' }
				},
				'pulse-ring': {
					'0%': { transform: 'scale(0.8)', opacity: '1' },
					'100%': { transform: 'scale(2)', opacity: '0' }
				},
				'bounce-x': {
					'0%, 20%, 53%, 80%, 100%': { 
						animationTimingFunction: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
						transform: 'translate3d(0,0,0)' 
					},
					'40%, 43%': { 
						animationTimingFunction: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
						transform: 'translate3d(-30px, 0, 0)' 
					},
					'70%': { 
						animationTimingFunction: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
						transform: 'translate3d(-15px, 0, 0)' 
					},
					'90%': { transform: 'translate3d(-4px, 0, 0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				
				// Enhanced animations
				'fade-in': 'fadeInUp 0.6s ease-out',
				'fade-in-up': 'fadeInUp 0.6s ease-out',
				'fade-in-down': 'fadeInDown 0.6s ease-out',
				'fade-in-left': 'fadeInLeft 0.6s ease-out',
				'fade-in-right': 'fadeInRight 0.6s ease-out',
				'scale-in': 'scaleIn 0.5s ease-out',
				'scale-out': 'scaleOut 0.5s ease-out',
				'slide-in-up': 'slideInUp 0.5s ease-out',
				'slide-in-down': 'slideInDown 0.5s ease-out',
				'slide-in-left': 'slideInLeft 0.5s ease-out',
				'slide-in-right': 'slideInRight 0.5s ease-out',
				'zoom-in': 'zoomIn 0.3s ease-out',
				'zoom-out': 'zoomOut 0.3s ease-out',
				'rotate-in': 'rotateIn 0.5s ease-out',
				'flip': 'flip 0.6s ease-in-out',
				'wiggle': 'wiggle 0.5s ease-in-out',
				'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'spin-slow': 'spin 3s linear infinite',
				'bounce-x': 'bounce-x 1s infinite',
				'shake': 'shake 0.5s ease-in-out',
				'tada': 'tada 1s ease-in-out',
				'bounce-soft': 'bounce 2s infinite',
				'rubber-band': 'rubber-band 1s ease-out',
				'jello': 'jello 1s ease-out',
				'swing': 'swing 1s ease-in-out',
				'flash': 'flash 1s ease-in-out',
				'shimmer': 'shimmer 2s linear infinite',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
				'border-morph': 'border-morph 4s ease-in-out infinite',
				'typewriter': 'typewriter 2s steps(20) forwards',
				'blur-in': 'blur-in 0.8s ease-out forwards',
				'neon-glow': 'neon-glow 1.5s ease-in-out infinite alternate',
				'pulse-ring': 'pulse-ring 2s ease-out infinite',
				
				// Combined animations
				'enter': 'fadeInUp 0.6s ease-out, scaleIn 0.5s ease-out',
				'exit': 'fadeInUp 0.3s ease-in reverse, scaleOut 0.2s ease-in',
				'page-enter': 'fadeInUp 0.8s ease-out',
				'modal-enter': 'fadeInUp 0.4s ease-out, scaleIn 0.3s ease-out',
				'dropdown-enter': 'scaleIn 0.2s ease-out',
				'tooltip-enter': 'zoomIn 0.2s ease-out',
				'notification-enter': 'slideInRight 0.5s ease-out',
				'sidebar-enter': 'slideInLeft 0.4s ease-out',
				'tab-enter': 'fadeInRight 0.3s ease-out'
			},
			transitionTimingFunction: {
				'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
			},
			transitionDuration: {
				'250': '250ms',
				'350': '350ms',
				'400': '400ms',
				'600': '600ms',
				'800': '800ms',
				'900': '900ms',
				'1200': '1200ms',
				'1500': '1500ms',
				'2000': '2000ms'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
