
/**
 * plugins/vuetify.ts
 *
 * Configuración de Vuetify y temas de StudentWallet
 */

// Composables
import { createVuetify } from 'vuetify'

// Estilos
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'system',

    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F6F8FC',
          surface: '#FFFFFF',
          'surface-variant': '#E9EDF5',

          primary: '#2563EB',
          secondary: '#7C3AED',

          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#2563EB',

          'on-background': '#111827',
          'on-surface': '#111827',
          'on-surface-variant': '#64748B',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-success': '#FFFFFF',
          'on-warning': '#111827',
          'on-error': '#FFFFFF',
          'on-info': '#FFFFFF',
        },
      },

      dark: {
        dark: true,
        colors: {
          background: '#0B1220',
          surface: '#111C2E',
          'surface-variant': '#263449',

          primary: '#60A5FA',
          secondary: '#A78BFA',

          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
          info: '#60A5FA',

          'on-background': '#F1F5F9',
          'on-surface': '#F1F5F9',
          'on-surface-variant': '#CBD5E1',
          'on-primary': '#0B1220',
          'on-secondary': '#0B1220',
          'on-success': '#0B1220',
          'on-warning': '#111827',
          'on-error': '#111827',
          'on-info': '#0B1220',
        },
      },
    },
  },
})
