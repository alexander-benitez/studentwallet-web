

<script setup>
import { ref, computed } from 'vue'

const form = ref(null)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const snackbar = ref(false)
const message = ref('')
const alertColor = ref('info')

const required = (v) => !!String(v ?? '').trim() || 'Este campo es obligatorio'
const emailRule = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '').trim()) ||
  'Ingresa un correo electrónico válido'
const passwordRule = (v) =>
  String(v ?? '').length >= 8 || 'La contraseña debe tener al menos 8 caracteres'
const confirmRule = (v) =>
  v === password.value || 'Las contraseñas no coinciden'

const strength = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score += 25
  if (/[A-Z]/.test(p)) score += 25
  if (/[0-9]/.test(p)) score += 25
  if (/[^A-Za-z0-9]/.test(p)) score += 25
  return score
})
const strengthColor = computed(() => {
  if (strength.value <= 25) return 'error'
  if (strength.value <= 50) return 'warning'
  if (strength.value <= 75) return 'info'
  return 'success'
})
const strengthLabel = computed(() => {
  if (!password.value) return 'Sin contraseña'
  if (strength.value <= 25) return 'Débil'
  if (strength.value <= 50) return 'Regular'
  if (strength.value <= 75) return 'Buena'
  return 'Muy segura'
})

function avisar(texto, tipo = 'error') {
  message.value = texto
  alertColor.value = tipo
  snackbar.value = true
}

async function register() {
  if (loading.value) return
  const result = await form.value?.validate()
  if (!result?.valid) {
    avisar('Revisa los campos señalados antes de continuar.')
    return
  }
  loading.value = true
  try {
    // Demostración visual: todavía no se envían datos a un backend.
    await new Promise((resolve) => setTimeout(resolve, 900))
    avisar('Formulario validado. El registro real estará disponible al conectar el backend.', 'info')
  } catch (error) {
    console.error(error)
    avisar('Ocurrió un problema al procesar el formulario.')
  } finally {
    loading.value = false
  }
}
</script>



<template>

  <v-container fluid class="register-page pa-0">

    <v-row no-gutters class="fill-height">



      <!-- PANEL IZQUIERDO -->

      <v-col cols="12" md="6" class="brand-panel">

        <div class="brand-content">

          <div class="logo">

            <v-icon size="34">mdi-wallet</v-icon>

            <span>StudentWallet</span>

          </div>



          <div class="hero">

            <v-chip

              variant="outlined"

              color="white"

              class="mb-6"

            >

              Empieza a construir tu futuro

            </v-chip>



            <h1>

              Tu dinero.

              <span>Tus metas.</span>

              Tu futuro.

            </h1>



            <p>

              Crea tu cuenta y comienza a administrar

              tus finanzas de forma inteligente.

              Cada pequeño ahorro cuenta.

            </p>



            <div class="benefits">

              <div>

                <v-icon color="#6EE7B7">

                  mdi-check-circle

                </v-icon>

                Controla tus ingresos y gastos

              </div>



              <div>

                <v-icon color="#6EE7B7">

                  mdi-check-circle

                </v-icon>

                Organiza tus presupuestos

              </div>



              <div>

                <v-icon color="#6EE7B7">

                  mdi-check-circle

                </v-icon>

                Alcanza tus metas de ahorro

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

        <v-card class="register-card" elevation="0">



          <div class="welcome-icon">

            <v-icon size="30" color="primary">

              mdi-account-plus-outline

            </v-icon>

          </div>



          <h2>Crea tu cuenta</h2>

          <p class="subtitle">

            Completa tus datos para comenzar.

          </p>



          <v-form ref="form" @submit.prevent="register">



            <label>Nombre completo</label>

            <v-text-field

              v-model="name"
                autocomplete="name"
                :disabled="loading"

              placeholder="Tu nombre completo"

              prepend-inner-icon="mdi-account-outline"

              variant="outlined"

              rounded="lg"

              :rules="[required]"

              class="mt-2 mb-2"

            />



            <label>Correo electrónico</label>

            <v-text-field

              v-model="email"
                autocomplete="email"
                :disabled="loading"

              type="email"

              placeholder="ejemplo@correo.com"

              prepend-inner-icon="mdi-email-outline"

              variant="outlined"

              rounded="lg"

              :rules="[required, emailRule]"

              class="mt-2 mb-2"

            />



            <label>Contraseña</label>

            <v-text-field

              v-model="password"
                autocomplete="new-password"
                :disabled="loading"

              :type="showPassword ? 'text' : 'password'"

              :append-inner-icon="

                showPassword ? 'mdi-eye-off' : 'mdi-eye'

              "

              prepend-inner-icon="mdi-lock-outline"

              placeholder="Mínimo 8 caracteres"

              variant="outlined"

              rounded="lg"

              :rules="[required, passwordRule]"

              class="mt-2"

              @click:append-inner="showPassword = !showPassword"

            />



            <!-- SEGURIDAD DE CONTRASEÑA -->

            <div class="password-strength">

              <div class="d-flex justify-space-between mb-2">

                <span>Seguridad de contraseña</span>

                <span :class="'text-' + strengthColor">

                  {{ strengthLabel }}

                </span>

              </div>



              <v-progress-linear

                :model-value="strength"

                :color="strengthColor"

                height="6"

                rounded

              />

            </div>



            <label>Confirmar contraseña</label>

            <v-text-field

              v-model="confirmPassword"
                autocomplete="new-password"
                :disabled="loading"

              :type="showConfirm ? 'text' : 'password'"

              :append-inner-icon="

                showConfirm ? 'mdi-eye-off' : 'mdi-eye'

              "

              prepend-inner-icon="mdi-shield-lock-outline"

              placeholder="Repite tu contraseña"

              variant="outlined"

              rounded="lg"

              :rules="[required, confirmRule]"

              class="mt-2 mb-4"

              @click:append-inner="showConfirm = !showConfirm"

            />



            <v-btn

              type="submit"

              color="primary"

              size="x-large"

              rounded="lg"

              block

              :loading="loading"
                :disabled="loading"

              append-icon="mdi-arrow-right"

              class="register-btn"

            >

              Crear mi cuenta

            </v-btn>



          </v-form>



          <div class="login-link">

            ¿Ya tienes una cuenta?

            <router-link to="/">

              Inicia sesión

            </router-link>

          </div>



          <div class="security">

            <v-icon size="16">mdi-shield-check</v-icon>

            Demostración de registro · Sin envío de datos

          </div>



        </v-card>

      </v-col>

    </v-row>



    <!-- NOTIFICACIONES -->

    <v-snackbar

      v-model="snackbar"

      :color="alertColor"

      location="top right"

      :timeout="3500"

      rounded="lg"

    >

      {{ message }}



      <template #actions>

        <v-btn

          icon="mdi-close"

          variant="text"

          @click="snackbar = false"

        />

      </template>

    </v-snackbar>

  </v-container>

</template>



<style scoped>

.register-page {

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



.benefits {

  margin-top: 35px;

  display: grid;

  gap: 16px;

}



.benefits div {

  display: flex;

  align-items: center;

  gap: 12px;

  font-size: 15px;

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



.register-card {

  width: 100%;

  max-width: 440px;

  padding: 24px;

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

  margin-bottom: 20px;

}



.register-card h2 {

  font-size: 30px;

  font-weight: 800;

  color: #0f172a;

  letter-spacing: -1px;

}



.subtitle {

  color: #64748b;

  margin-top: 8px;

  margin-bottom: 24px;

}



.register-card label {

  font-size: 14px;

  font-weight: 600;

  color: #334155;

}



.password-strength {

  margin: -4px 0 22px;

  font-size: 12px;

  color: #64748b;

}



.register-btn {

  font-weight: 700;

  text-transform: none;

  letter-spacing: 0;

  transition: transform 0.25s, box-shadow 0.25s;

}



.register-btn:hover {

  transform: translateY(-2px);

  box-shadow: 0 10px 25px #2563eb40;

}



.login-link {

  text-align: center;

  margin-top: 25px;

  color: #64748b;

  font-size: 14px;

}



.login-link a {

  color: #2563eb;

  font-weight: 700;

  text-decoration: none;

}



.login-link a:hover {

  text-decoration: underline;

}



.security {

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 8px;

  color: #94a3b8;

  font-size: 12px;

  margin-top: 30px;

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

  .register-card {

    animation: none;

  }

}

</style>
