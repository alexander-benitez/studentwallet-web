<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useFinanzasStore } from '@/stores/finanzas'

  const router = useRouter()
  const finanzas = useFinanzasStore()

  const formulario = ref(null)
  const guardando = ref(false)
  const snackbar = ref(false)
  const snackbarColor = ref('success')
  const mensaje = ref('')

  const datos = ref({
    nombre: '',
    apellido: '',
    correo: '',
    universidad: '',
    carrera: '',
  })

  function cargarPerfil () {
    datos.value = {
      nombre: finanzas?.perfil?.nombre || '',
      apellido: finanzas?.perfil?.apellido || '',
      correo: finanzas?.perfil?.correo || '',
      universidad: finanzas?.perfil?.universidad || '',
      carrera: finanzas?.perfil?.carrera || '',
    }
  }

  cargarPerfil()
  onMounted(() => {
    finanzas?.cargarPerfil()
  })

  const nombreVistaPrevia = computed(() => {
    return (
      `${datos.value.nombre} ${datos.value.apellido}`.trim()
      || 'Estudiante'
    )
  })

  const inicialesVistaPrevia = computed(() => {
    const nombre = datos.value.nombre.trim().charAt(0) || 'E'
    const apellido = datos.value.apellido.trim().charAt(0)
    return `${nombre}${apellido}`.toUpperCase()
  })

  function nombreObligatorio (v) {
    return !!String(v ?? '').trim() || 'Este campo es obligatorio'
  }

  function correoValido (v) {
    return !v
      || /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(v)
      || 'Ingresa un correo electrónico válido'
  }

  const hayCambios = computed(() =>
    ['nombre', 'apellido', 'universidad', 'carrera']
      .some(campo =>
        datos.value[campo] !== ((finanzas?.perfil || {})[campo] || ''),
      ),
  )

  watch(
    () => finanzas?.perfil,
    cargarPerfil,
    { deep: true },
  )

  async function guardarPerfil () {
    const resultado = await formulario.value.validate()
    if (!resultado.valid) return

    guardando.value = true

    try {
      const res = await finanzas?.actualizarPerfil(datos.value)
      if (res?.ok) {
        snackbarColor.value = 'success'
        mensaje.value = res.mensaje || 'Tu perfil se actualizó correctamente'
        snackbar.value = true
      } else {
        snackbarColor.value = 'error'
        mensaje.value = res?.mensaje || 'No se pudo actualizar tu perfil'
        snackbar.value = true
      }
    } finally {
      guardando.value = false
    }
  }

  function descartarCambios () {
    cargarPerfil()
    formulario.value?.resetValidation()
  }
</script>

<template>
  <v-container class="profile-page pa-4 pa-md-8" fluid>
    <!-- ENCABEZADO -->
    <div class="page-header">
      <div>
        <v-btn
          class="mb-3"
          color="primary"
          prepend-icon="mdi-arrow-left"
          variant="text"
          @click="router.push('/dashboard')"
        >
          Volver al Dashboard
        </v-btn>

        <h1>Mi perfil</h1>
        <p>Administra tu información personal en StudentWallet.</p>
      </div>

      <v-chip color="primary" size="large" variant="tonal">
        <v-icon start>mdi-account-circle-outline</v-icon>
        Perfil de estudiante
      </v-chip>
    </div>

    <v-row class="mt-5">
      <!-- TARJETA DEL PERFIL -->
      <v-col cols="12" md="4">
        <v-card class="profile-card" elevation="0">
          <div class="profile-banner" />

          <div class="profile-content">
            <v-avatar class="profile-avatar" size="108">
              <span>{{ inicialesVistaPrevia }}</span>
            </v-avatar>

            <h2>{{ nombreVistaPrevia }}</h2>

            <p class="profile-email">
              {{ datos.correo || 'Sin correo registrado' }}
            </p>

            <v-chip
              class="mt-3"
              color="primary"
              prepend-icon="mdi-school-outline"
              variant="tonal"
            >
              Estudiante
            </v-chip>

            <v-divider class="my-6" />

            <div class="profile-detail">
              <v-icon color="primary">
                mdi-school-outline
              </v-icon>

              <div>
                <span>Universidad</span>

                <strong>
                  {{ datos.universidad || 'No especificada' }}
                </strong>
              </div>
            </div>

            <div class="profile-detail">
              <v-icon color="primary">
                mdi-book-open-variant-outline
              </v-icon>

              <div>
                <span>Carrera</span>

                <strong>
                  {{ datos.carrera || 'No especificada' }}
                </strong>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- FORMULARIO -->
      <v-col cols="12" md="8">
        <v-card class="form-card" elevation="0">
          <div class="form-header">
            <div class="form-icon">
              <v-icon color="primary" size="26">
                mdi-account-edit-outline
              </v-icon>
            </div>

            <div>
              <h2>Información personal</h2>
              <p>Actualiza los datos que aparecen en tu perfil.</p>
            </div>
          </div>

          <v-divider class="my-6" />

          <v-form ref="formulario" @submit.prevent="guardarPerfil">
            <v-row>
              <v-col cols="12" sm="6">
                <label>Nombre</label>

                <v-text-field
                  v-model="datos.nombre"
                  class="mt-2"
                  placeholder="Tu nombre"
                  prepend-inner-icon="mdi-account-outline"
                  rounded="lg"
                  :rules="[nombreObligatorio]"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <label>Apellido</label>

                <v-text-field
                  v-model="datos.apellido"
                  class="mt-2"
                  placeholder="Tu apellido"
                  prepend-inner-icon="mdi-account-outline"
                  rounded="lg"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <label>Correo electrónico</label>

                <v-text-field
                  :model-value="datos.correo"
                  append-inner-icon="mdi-lock-outline"
                  class="mt-2"
                  disabled
                  hint="Correo vinculado a tu cuenta (no editable)"
                  persistent-hint
                  placeholder=""
                  prepend-inner-icon="mdi-email-outline"
                  readonly
                  rounded="lg"
                  type="email"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <label>Universidad o institución</label>

                <v-text-field
                  v-model="datos.universidad"
                  class="mt-2"
                  placeholder="Ej. ITCA-FEPADE"
                  prepend-inner-icon="mdi-school-outline"
                  rounded="lg"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <label>Carrera</label>

                <v-text-field
                  v-model="datos.carrera"
                  class="mt-2"
                  placeholder="Ej. Desarrollo de Software"
                  prepend-inner-icon="mdi-book-open-outline"
                  rounded="lg"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-alert
              v-if="hayCambios"
              class="mb-5"
              density="compact"
              type="warning"
              variant="tonal"
            >
              Tienes cambios sin guardar.
            </v-alert>

            <div class="form-actions">
              <v-btn
                color="secondary"
                :disabled="!hayCambios || guardando"
                rounded="lg"
                variant="outlined"
                @click="descartarCambios"
              >
                Descartar cambios
              </v-btn>

              <v-btn
                color="primary"
                :disabled="!hayCambios"
                :loading="guardando"
                prepend-icon="mdi-content-save-outline"
                rounded="lg"
                size="large"
                type="submit"
              >
                Guardar cambios
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- NOTIFICACIÓN -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="top right"
      rounded="lg"
      :timeout="3500"
    >
      <v-icon class="mr-2">
        {{ snackbarColor === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline' }}
      </v-icon>
      {{ mensaje }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>

.profile-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-background));
}

.page-header p {
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 7px;
  font-size: 14px;
}

.profile-card,
.form-card,
.info-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  overflow: hidden;
}

.profile-banner {
  height: 130px;
  background: linear-gradient(
    135deg,
    #2563eb,
    #4338ca,
    #7c3aed
  );
}

.profile-content {
  padding: 0 28px 30px;
  text-align: center;
}

.profile-avatar {
  margin-top: -54px;
  border: 5px solid rgb(var(--v-theme-surface));
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  box-shadow: 0 8px 25px #2563eb30;
}

.profile-avatar span {
  font-size: 35px;
  font-weight: 800;
}

.profile-content h2 {
  font-size: 23px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  margin-top: 18px;
}

.profile-email {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 7px;
  overflow-wrap: anywhere;
}

.profile-detail {
  display: flex;
  align-items: center;
  gap: 15px;
  text-align: left;
  margin-top: 22px;
}

.profile-detail div {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.profile-detail span {
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.profile-detail strong {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  overflow-wrap: anywhere;
}

.form-card {
  padding: 30px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-header h2 {
  font-size: 21px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.form-header p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 6px;
}

.form-card label {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 25px;
}

.info-card h3 {
  font-size: 16px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.info-card p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.7;
  margin-top: 7px;
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 25px;
  }

  .form-card {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .v-btn {
    width: 100%;
  }
}

</style>
