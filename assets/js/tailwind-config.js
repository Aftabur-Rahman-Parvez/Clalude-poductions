    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              black: '#000000',
              dark: '#000000',
              deep: '#050505',
              card: '#0C0C0C',
              cardBorder: '#272727',
              cardBorderHover: '#434343',
              panel: '#141414',
              white: '#FFFFFF',
              offwhite: '#D8D8D8',
              lightgray: '#C8C8C8',
              muted: '#888888',
              line: '#2F323B',
              // Cloud Production brand palette, matched to the logo gradient
              cyan: '#06B6D4',
              cyanLight: '#67E8F9',
              emerald: '#14B8A6',
              mint: '#5EEAD4',
              ocean: '#3B82F6',
              navy: '#0C0C0C'
            }
          },
          fontFamily: {
            sans: ['"Inter"', 'sans-serif'],
            display: ['"Familjen Grotesk"', 'sans-serif'],
            mono: ['"Martian Mono"', 'monospace'],
            editorial: ['"Instrument Serif"', '"PP Editorial New"', 'serif']
          },
          animation: {
            'spin-slow': 'spin 20s linear infinite',
            'float': 'float 4s ease-in-out infinite',
            'float-delayed': 'float 4s ease-in-out 2s infinite',
            'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
            'shimmer': 'shimmer 2.5s ease-in-out infinite',
          },
          keyframes: {
            float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-8px)' }
            },
            pulseGlow: {
              '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
              '50%': { opacity: '0.85', transform: 'scale(1.04)' }
            },
            shimmer: {
              '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(0,210,211,0.4))' },
              '50%': { filter: 'drop-shadow(0 0 25px rgba(29,209,161,0.8))' }
            }
          }
        }
      }
    }
