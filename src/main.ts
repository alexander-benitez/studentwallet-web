
/**
 * main.ts
 *
 * Configuración principal de StudentWallet
 */

// Vue
import { createApp } from 'vue'

// Plugins de Vuetify
import { registerPlugins } from '@/plugins'

// Pinia
import { createPinia } from 'pinia'

// Componente principal
import App from './App.vue'

// Estilos
import 'unfonts.css'

// Crear aplicación
const app = createApp(App)

// Registrar plugins de Vuetify
registerPlugins(app)

// Registrar Pinia
app.use(createPinia())

// Montar aplicación
app.mount('#app')
