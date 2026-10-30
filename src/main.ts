
/**
 * main.ts
 *
 * Configuración principal de StudentWallet
 */

// Vue
import { createApp } from 'vue'

// Plugins de Vuetify
import { registerPlugins } from '@/plugins'

// Componente principal
import App from './App.vue'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import '@/styles/theme.css'

// Estilos
import 'unfonts.css'

// Crear aplicación
const app = createApp(App)

// Registrar plugins de Vuetify
registerPlugins(app)

// Montar aplicación
app.mount('#app')
