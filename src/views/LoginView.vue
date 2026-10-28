
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tipoAcceso = ref('estudiante')
const formulario = ref(null)
const email = ref('')
const password = ref('')
const visible = ref(false)
const loading = ref(false)

const snackbar = ref(false)
const message = ref('')
const color = ref('error')

// VALIDACIONES

const required = (v) =>
  !!String(v ?? '').trim() ||
  'Este campo es obligatorio'

const validEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '').trim()) ||
  'Ingresa un correo electrónico válido'

// MENSAJES

function mostrarMensaje(texto, tipo = 'error') {
  message.value = texto
  color.value = tipo
  snackbar.value = true
}

// INICIO DE SESIÓN DEMOSTRATIVO

async function login() {
  if (loading.value) return

  const resultado = await formulario.value?.validate()

  if (!resultado?.valid) {
    mostrarMensaje('Revisa los campos señalados antes de continuar.')
    return
  }

  if (password.value.length < 6) {
    mostrarMensaje('La contraseña debe tener al menos 6 caracteres.')
    return
  }

  loading.value = true

  try {
    // Simulación de procesamiento.
    // Sustituiremos esto por una petición al backend.
    await new Promise((resolve) => setTimeout(resolve, 900))

    mostrarMensaje(
      'Acceso de demostración. No se han verificado credenciales reales.',
      'info'
    )

    const destino =
  tipoAcceso.value === 'administrador'
    ? '/admin'
    : '/dashboard'

await router.push(destino)
  } catch (error) {
    console.error('Error al navegar:', error)
    mostrarMensaje('No se pudo abrir el Dashboard.')
  } finally {
    loading.value = false
  }
}
</script>



<template>
  <v-container fluid class="login-page pa-0">
    <v-row no-gutters class="fill-height">

      <!-- PANEL IZQUIERDO -->
      <v-col cols="12" md="6" class="brand-panel">
        <div class="brand-content">
          <div class="logo">
            <v-icon size="34" color="white">mdi-wallet</v-icon>
            <span>StudentWallet</span>
          </div>

          <div class="hero">
            <v-chip color="white" variant="outlined" class="mb-6">
              Tu futuro financiero empieza aquí
            </v-chip>

            <h1>
              Controla tu dinero.
              <span>Construye tu futuro.</span>
            </h1>

            <p>
              Organiza tus ingresos, controla tus gastos y
              alcanza tus metas de ahorro desde un solo lugar.
            </p>

            <div class="features">
              <div>
                <v-icon>mdi-check-circle</v-icon>
                Control de ingresos y gastos
              </div>
              <div>
                <v-icon>mdi-check-circle</v-icon>
                Metas de ahorro inteligentes
              </div>
              <div>
                <v-icon>mdi-check-circle</v-icon>
                Estadísticas financieras
              </div>
            </div>
          </div>

          <p class="footer-brand">
            © 2026 StudentWallet
          </p>
        </div>

        <div class="glow glow-one"></div>
        <div class="glow glow-two"></div>
      </v-col>

      <!-- PANEL DERECHO -->
      <v-col cols="12" md="6" class="form-panel">
        <v-card class="login-card" elevation="0">
          <div class="welcome-icon">
            <v-icon size="30" color="primary">
              mdi-shield-account
            </v-icon>
          </div>

          <h2>Bienvenido de nuevo</h2>
          <p class="subtitle">
            Ingresa tus credenciales para continuar.
          </p>

          <v-form ref="formulario" @submit.prevent="login">
            <div class="mb-6">
  <label>Tipo de acceso</label>

  <v-item-group
    v-model="tipoAcceso"
    mandatory
    class="d-flex ga-3 mt-3"
  >
    <v-item
      v-slot="{ isSelected, toggle }"
      value="estudiante"
    >
      <v-card
        class="access-option"
        :class="{ 'access-selected': isSelected }"
        variant="outlined"
        rounded="lg"
        @click="toggle"
      >
        <v-icon
          size="27"
          color="primary"
          class="mb-2"
        >
          mdi-school-outline
        </v-icon>

        <strong>Estudiante</strong>
        <small>Mis finanzas</small>
      </v-card>
    </v-item>

    <v-item
      v-slot="{ isSelected, toggle }"
      value="administrador"
    >
      <v-card
        class="access-option"
        :class="{ 'access-selected': isSelected }"
        variant="outlined"
        rounded="lg"
        @click="toggle"
      >
        <v-icon
          size="27"
          color="#7C3AED"
          class="mb-2"
        >
          mdi-shield-account-outline
        </v-icon>

        <strong>Administrador</strong>
        <small>Panel de gestión</small>
      </v-card>
    </v-item>
  </v-item-group>
</div>
            <label>Correo electrónico</label>
                      <v-text-field
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="ejemplo@correo.com"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            rounded="lg"
            :rules="[required, validEmail]"
            :disabled="loading"
            class="mt-2 mb-3"
          />

            <label>Contraseña</label>
            <v-text-field
          v-model="password"
          placeholder="Ingresa tu contraseña"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
         autocomplete="current-password"
          variant="outlined"
          rounded="lg"
          :rules="[required]"
          :disabled="loading"
          class="mt-2"
          @click:append-inner="visible = !visible"
        />

            <div class="text-right mb-6">
              <a href="#" class="forgot" @click.prevent="
                message = 'La recuperación de contraseña estará disponible próximamente.';
                color = 'info';
                snackbar = true
              ">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <v-btn
              type="submit"
              color="primary"
              block
              size="x-large"
              rounded="lg"
              :loading="loading"
              class="login-btn"
              append-icon="mdi-arrow-right"
            >
              Iniciar sesión
            </v-btn>
          </v-form>

          <div class="register-text">
            ¿No tienes una cuenta?
            <router-link to="/registro">
  Regístrate gratis
</router-link>
          </div>

          <div class="security">
            <v-icon size="16">mdi-lock-check</v-icon>
            Tu información está protegida
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar"
      :color="color"
      location="top right"
      :timeout="3500"
      rounded="lg"
    >
      {{ message }}
      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.fill-height {
  min-height: 100vh;
}

.brand-panel {
  position: relative;
  overflow: hidden;
  background: linear-gradient(145deg, #1d4ed8, #4338ca 58%, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  padding: 55px;
}

.brand-content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 75vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.8px;
}

.hero {
  max-width: 530px;
  animation: slideUp 0.8s ease both;
}

.hero h1 {
  font-size: clamp(36px, 4vw, 58px);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -2px;
}

.hero h1 span {
  display: block;
  color: #a7f3d0;
}

.hero p {
  font-size: 17px;
  line-height: 1.8;
  margin-top: 25px;
  opacity: 0.88;
}

.features {
  margin-top: 35px;
  display: grid;
  gap: 16px;
}

.features div {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.features .v-icon {
  color: #6ee7b7;
}

.footer-brand {
  font-size: 13px;
  opacity: 0.65;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(15px);
  pointer-events: none;
}

.glow-one {
  width: 350px;
  height: 350px;
  background: #60a5fa;
  opacity: 0.14;
  top: -130px;
  right: -120px;
}

.glow-two {
  width: 280px;
  height: 280px;
  background: #a78bfa;
  opacity: 0.2;
  bottom: -130px;
  left: -100px;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 35px 24px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  padding: 28px;
  background: transparent !important;
  animation: slideUp 0.7s ease both;
}

.welcome-icon {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
}

.login-card h2 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
}

.subtitle {
  color: #64748b;
  margin-top: 8px;
  margin-bottom: 35px;
}

.login-card label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.forgot,
.register-text a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.forgot:hover,
.register-text a:hover {
  text-decoration: underline;
}

.login-btn {
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  transition: transform 0.25s, box-shadow 0.25s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px #2563eb40;
}

.register-text {
  text-align: center;
  margin-top: 30px;
  color: #64748b;
  font-size: 14px;
}

.security {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 12px;
  margin-top: 45px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .brand-panel {
    padding: 35px;
  }

  .brand-content {
    min-height: auto;
    gap: 35px;
  }

  .hero h1 {
    font-size: 36px;
  }

  .footer-brand {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero,
  .login-card {
    animation: none;
  }
}
.access-option {
  flex: 1;
  min-width: 0;
  padding: 18px 10px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.access-option strong {
  color: #0f172a;
  font-size: 14px;
}

.access-option small {
  color: #64748b;
  font-size: 12px;
}

.access-option:hover {
  background: #f8faff;
  border-color: #93c5fd;
}

.access-selected {
  background: #eff6ff !important;
  border: 2px solid #2563eb !important;
}
</style>
