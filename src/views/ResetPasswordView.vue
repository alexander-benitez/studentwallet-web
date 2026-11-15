<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute()
  const router = useRouter()

  const form = ref(null)
  const email = ref('')
  const code = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const loading = ref(false)

  const snackbar = ref(false)
  const message = ref('')
  const alertColor = ref('info')

  function required (v) {
    return !!String(v ?? '').trim() || 'Este campo es obligatorio'
  }

  function emailRule (v) {
    return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(String(v ?? '').trim())
      || 'Ingresa un correo electrónico válido'
  }

  function codeRule (v) {
    return /^\d{6}$/.test(String(v ?? '').trim()) || 'Ingresa el código de 6 dígitos'
  }

  function passwordRule (v) {
    return String(v ?? '').length >= 8 || 'La contraseña debe tener al menos 8 caracteres'
  }

  function confirmRule (v) {
    return String(v ?? '') === password.value || 'Las contraseñas no coinciden'
  }

  function avisar (texto, tipo = 'error') {
    message.value = texto
    alertColor.value = tipo
    snackbar.value = true
  }

  async function resetPassword () {
    if (loading.value) return
    const result = await form.value?.validate()
    if (!result?.valid) {
      avisar('Revisa los campos señalados antes de continuar.')
      return
    }

    loading.value = true
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
      const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.value.trim(),
          code: code.value.trim(),
          password: password.value.trim(),
          password_confirmation: confirmPassword.value.trim(),
        }),
      })

      const res = await response.json().catch(() => ({}))

      if (response.ok) {
        avisar('Contraseña actualizada. Redirigiendo al inicio de sesión...', 'success')
        setTimeout(() => router.push('/'), 1200)
      } else {
        avisar(res.message || 'No se pudo restablecer la contraseña.', 'error')
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error)
      avisar('No se pudo conectar con el servidor backend.', 'error')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    const queryEmail = route.query.email
    if (typeof queryEmail === 'string') {
      email.value = queryEmail
    }
  })
</script>

<template>
  <v-container class="reset-page pa-0" fluid>
    <v-row class="fill-height" no-gutters>
      <v-col class="brand-panel" cols="12" md="5">
        <div class="brand-content">
          <div class="logo">
            <v-icon size="34">mdi-wallet</v-icon>
            <span>StudentWallet</span>
          </div>
          <div class="hero">
            <h1>Restablece tu acceso</h1>
            <p>Ingresa el código que recibiste en tu correo y define una nueva contraseña.</p>
          </div>
          <p class="footer-brand">© 2026 StudentWallet</p>
        </div>
        <div class="glow glow-one" />
        <div class="glow glow-two" />
      </v-col>

      <v-col class="form-panel" cols="12" md="7">
        <v-card class="reset-card" elevation="0">
          <div class="welcome-icon">
            <v-icon color="primary" size="30">mdi-lock-reset</v-icon>
          </div>
          <h2>Restablecer contraseña</h2>
          <p class="subtitle">Completa los datos para actualizar tu contraseña.</p>

          <v-form ref="form" @submit.prevent="resetPassword">
            <label>Correo electrónico</label>
            <v-text-field
              v-model="email"
              autocomplete="email"
              class="mt-2 mb-2"
              :disabled="loading"
              placeholder="ejemplo@gmail.com"
              prepend-inner-icon="mdi-email-outline"
              rounded="lg"
              :rules="[required, emailRule]"
              type="email"
              variant="outlined"
            />

            <label>Código de 6 dígitos</label>
            <v-text-field
              v-model="code"
              class="mt-2 mb-2"
              :disabled="loading"
              maxlength="6"
              placeholder="123456"
              prepend-inner-icon="mdi-numeric"
              rounded="lg"
              :rules="[required, codeRule]"
              variant="outlined"
            />

            <label>Nueva contraseña</label>
            <v-text-field
              v-model="password"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              autocomplete="new-password"
              class="mt-2 mb-2"
              :disabled="loading"
              placeholder="Mínimo 8 caracteres"
              prepend-inner-icon="mdi-lock-outline"
              rounded="lg"
              :rules="[required, passwordRule]"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              @click:append-inner="showPassword = !showPassword"
            />

            <label>Confirmar contraseña</label>
            <v-text-field
              v-model="confirmPassword"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              autocomplete="new-password"
              class="mt-2 mb-4"
              :disabled="loading"
              placeholder="Repite tu contraseña"
              prepend-inner-icon="mdi-shield-lock-outline"
              rounded="lg"
              :rules="[required, confirmRule]"
              :type="showConfirmPassword ? 'text' : 'password'"
              variant="outlined"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            />

            <v-btn
              block
              class="reset-btn"
              color="primary"
              :loading="loading"
              rounded="lg"
              size="x-large"
              type="submit"
            >
              Actualizar contraseña
            </v-btn>
          </v-form>

          <div class="login-link">
            ¿Recordaste tu contraseña?
            <router-link to="/">Volver al inicio de sesión</router-link>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" :color="alertColor" location="top right" rounded="lg" :timeout="3500">
      {{ message }}
      <template #actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.reset-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
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
  padding: 48px;
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
}
.hero h1 {
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.15;
  font-weight: 800;
  margin-bottom: 16px;
}
.hero p {
  font-size: 16px;
  line-height: 1.7;
  opacity: 0.9;
  max-width: 420px;
}
.footer-brand {
  font-size: 13px;
  opacity: 0.7;
}
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(15px);
  pointer-events: none;
}
.glow-one {
  width: 320px;
  height: 320px;
  background: #60a5fa;
  opacity: 0.14;
  top: -120px;
  right: -100px;
}
.glow-two {
  width: 260px;
  height: 260px;
  background: #a78bfa;
  opacity: 0.2;
  bottom: -120px;
  left: -90px;
}
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px 24px;
}
.reset-card {
  width: 100%;
  max-width: 460px;
  padding: 28px 24px;
  color: rgb(var(--v-theme-on-surface));
  background: transparent !important;
}
.welcome-icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: rgba(var(--v-theme-primary), 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.reset-card h2 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1px;
}
.subtitle {
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 8px 0 22px;
}
.reset-card label {
  display: block;
  font-size: 14px;
  font-weight: 600;
}
.reset-btn {
  font-weight: 700;
  text-transform: none;
}
.login-link {
  text-align: center;
  margin-top: 22px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
}
.login-link a {
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  text-decoration: none;
}
@media (max-width: 960px) {
  .brand-panel {
    padding: 32px;
  }
  .brand-content {
    min-height: auto;
    gap: 28px;
  }
  .form-panel {
    min-height: auto;
  }
}
</style>
