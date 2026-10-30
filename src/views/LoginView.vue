
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

/* =========================================
   ESTRUCTURA GENERAL
========================================= */

.login-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.login-page > .v-row {
  min-height: 100vh;
}

/* =========================================
   PANEL IZQUIERDO - IDENTIDAD STUDENTWALLET
========================================= */

.brand-panel {
  position: relative;
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  color: #FFFFFF;
  background: linear-gradient(
    135deg,
    #14213D 0%,
    #1E3A8A 55%,
    #4338CA 100%
  );
}

.brand-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  min-height: 100vh;
  padding: 38px 48px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #FFFFFF;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.hero {
  max-width: 560px;
  margin: auto 0;
  padding: 55px 0;
}

.hero h1 {
  margin: 20px 0;
  color: #FFFFFF;
  font-size: clamp(30px, 3vw, 43px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -1px;
}

.hero h1 span {
  display: block;
  color: #93C5FD;
}

.hero p {
  max-width: 540px;
  margin-bottom: 24px;
  color: #DBEAFE;
  font-size: 16px;
  line-height: 1.8;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 13px;
  color: #FFFFFF;
  font-size: 15px;
}

.features div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.features .v-icon {
  color: #86EFAC;
}

.footer-brand {
  margin: 0;
  color: #CBD5E1;
  font-size: 13px;
}

.glow {
  position: absolute;
  z-index: 1;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.15);
  filter: blur(65px);
  pointer-events: none;
}

.glow-one {
  top: -100px;
  right: -80px;
}

.glow-two {
  bottom: -130px;
  left: -100px;
  background: rgba(124, 58, 237, 0.2);
}

/* =========================================
   PANEL DERECHO - FORMULARIO
========================================= */

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 35px;
  background: rgb(var(--v-theme-background));
}

.login-card {
  width: 100%;
  max-width: none;
  padding: 30px 45px;
  overflow: visible;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 20px;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 22px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.12);
}

.login-card h2 {
  margin-bottom: 9px;
  color: rgb(var(--v-theme-on-surface));
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.subtitle {
  margin-bottom: 28px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
  line-height: 1.6;
}

.login-card label {
  display: block;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
  font-weight: 600;
}

/* =========================================
   CAMPOS DE TEXTO
========================================= */

.login-card :deep(.v-field) {
  color: rgb(var(--v-theme-on-surface));
}

.login-card :deep(.v-field__input input),
.login-card :deep(.v-field__input textarea) {
  color: rgb(var(--v-theme-on-surface)) !important;
  -webkit-text-fill-color: rgb(var(--v-theme-on-surface)) !important;
  opacity: 1 !important;
  caret-color: rgb(var(--v-theme-primary)) !important;
}

.login-card :deep(.v-field__input input::placeholder),
.login-card :deep(.v-field__input textarea::placeholder) {
  color: rgb(var(--v-theme-on-surface-variant)) !important;
  -webkit-text-fill-color: rgb(var(--v-theme-on-surface-variant)) !important;
  opacity: 0.8 !important;
}

.login-card :deep(.v-field__prepend-inner .v-icon),
.login-card :deep(.v-field__append-inner .v-icon) {
  color: rgb(var(--v-theme-on-surface-variant)) !important;
}

.login-card :deep(.v-field--variant-outlined .v-field__outline) {
  color: rgba(var(--v-theme-on-surface), 0.25);
}

.login-card :deep(.v-field--focused .v-field__outline) {
  color: rgb(var(--v-theme-primary)) !important;
}

.login-card :deep(.v-messages) {
  color: rgb(var(--v-theme-on-surface-variant));
}

/* =========================================
   TIPO DE ACCESO
========================================= */

.access-option {
  flex: 1;
  min-width: 0;
  padding: 15px 12px;
  text-align: center;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
  transition: 0.2s ease;
}

.access-option strong {
  display: block;
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
  font-weight: 700;
}

.access-option small {
  display: block;
  margin-top: 4px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 11px;
}

.access-option:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgb(var(--v-theme-primary));
}

.access-selected {
  background: rgba(var(--v-theme-primary), 0.12) !important;
  border: 2px solid rgb(var(--v-theme-primary)) !important;
}

/* =========================================
   ENLACES Y BOTÓN
========================================= */

.forgot {
  color: rgb(var(--v-theme-primary));
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.forgot:hover,
.register-text a:hover {
  text-decoration: underline;
}

.login-btn {
  min-height: 54px;
  margin-top: 5px;
  font-weight: 700;
  letter-spacing: 0;
}

.register-text {
  margin-top: 22px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 13px;
  text-align: center;
}

.register-text a {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  text-decoration: none;
}

.security {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 18px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 12px;
}

/* =========================================
   AUTOCOMPLETADO DEL NAVEGADOR
========================================= */

.login-card :deep(input:-webkit-autofill),
.login-card :deep(input:-webkit-autofill:hover),
.login-card :deep(input:-webkit-autofill:focus) {
  -webkit-text-fill-color: rgb(var(--v-theme-on-surface)) !important;
  caret-color: rgb(var(--v-theme-primary));
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 960px) {
  .brand-panel {
    min-height: 420px;
  }

  .brand-content {
    min-height: 420px;
    padding: 30px;
  }

  .hero {
    padding: 35px 0;
  }

  .hero h1 {
    font-size: 32px;
  }

  .form-panel {
    min-height: auto;
    padding: 40px 24px;
  }
}

@media (max-width: 600px) {
  .brand-panel {
    min-height: 350px;
  }

  .brand-content {
    min-height: 350px;
    padding: 24px;
  }

  .hero {
    padding: 25px 0;
  }

  .hero h1 {
    font-size: 28px;
  }

  .hero p {
    font-size: 14px;
  }

  .features {
    font-size: 13px;
  }

  .form-panel {
    padding: 25px 16px;
  }

  .login-card {
    padding: 22px 18px;
  }
}

</style>
