// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           50: '#fef7f0',
//           100: '#feeee0',
//           200: '#fcdbc1',
//           300: '#f9c296',
//           400: '#f5a169',
//           500: '#f18544',
//           600: '#e36d2c',
//           700: '#bd5724',
//           800: '#974725',
//           900: '#7a3d22',
//           950: '#421d0f',
//         },
//         secondary: {
//           50: '#f8f9ff',
//           100: '#f1f3fe',
//           200: '#e6eafe',
//           300: '#d0d9fc',
//           400: '#b3c1f8',
//           500: '#94a6f2',
//           600: '#7684ea',
//           700: '#646dd8',
//           800: '#525bb5',
//           900: '#464d91',
//           950: '#2d3055',
//         },
//         gold: {
//           50: '#fffdf7',
//           100: '#fff9e8',
//           200: '#fff2c5',
//           300: '#ffe797',
//           400: '#ffd558',
//           500: '#ffc72a',
//           600: '#f0a500',
//           700: '#cc7d00',
//           800: '#a36307',
//           900: '#85510e',
//           950: '#4f2b03',
//         }
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif'],
//         serif: ['Playfair Display', 'serif'],
//       },
//       animation: {
//         'fade-in': 'fadeIn 0.5s ease-in-out',
//         'slide-up': 'slideUp 0.5s ease-out',
//         'slide-down': 'slideDown 0.5s ease-out',
//         'scale-in': 'scaleIn 0.3s ease-out',
//         'bounce-subtle': 'bounceSubtle 2s infinite',
//       },
//       keyframes: {
//         fadeIn: {
//           '0%': { opacity: '0' },
//           '100%': { opacity: '1' },
//         },
//         slideUp: {
//           '0%': { transform: 'translateY(20px)', opacity: '0' },
//           '100%': { transform: 'translateY(0)', opacity: '1' },
//         },
//         slideDown: {
//           '0%': { transform: 'translateY(-20px)', opacity: '0' },
//           '100%': { transform: 'translateY(0)', opacity: '1' },
//         },
//         scaleIn: {
//           '0%': { transform: 'scale(0.95)', opacity: '0' },
//           '100%': { transform: 'scale(1)', opacity: '1' },
//         },
//         bounceSubtle: {
//           '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
//           '40%': { transform: 'translateY(-10px)' },
//           '60%': { transform: 'translateY(-5px)' },
//         }
//       },
//       boxShadow: {
//         'elegant': '0 4px 20px rgba(0, 0, 0, 0.08)',
//         'elegant-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
//         'gold': '0 4px 20px rgba(240, 165, 0, 0.2)',
//       },
//       backdropBlur: {
//         xs: '2px',
//       },
//       screens: {
//         'xs': '475px',
//       }
//     },
//   },
//   plugins: [
//     require('@tailwindcss/forms'),
//     require('@tailwindcss/aspect-ratio'),
//   ],
// }


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f0',
          100: '#feeee0',
          200: '#fcdbc1',
          300: '#f9c296',
          400: '#f5a169',
          500: '#f18544',
          600: '#e36d2c',
          700: '#bd5724',
          800: '#974725',
          900: '#7a3d22',
          950: '#421d0f',
        },
        secondary: {
          50: '#f8f9ff',
          100: '#f1f3fe',
          200: '#e6eafe',
          300: '#d0d9fc',
          400: '#b3c1f8',
          500: '#94a6f2',
          600: '#7684ea',
          700: '#646dd8',
          800: '#525bb5',
          900: '#464d91',
          950: '#2d3055',
        },
        gold: {
          50: '#fffdf7',
          100: '#fff9e8',
          200: '#fff2c5',
          300: '#ffe797',
          400: '#ffd558',
          500: '#ffc72a',
          600: '#f0a500',
          700: '#cc7d00',
          800: '#a36307',
          900: '#85510e',
          950: '#4f2b03',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        }
      },
      boxShadow: {
        'elegant': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'elegant-lg': '0 8px 40px rgba(0, 0, 0, 0.12)',
        'gold': '0 4px 20px rgba(240, 165, 0, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}