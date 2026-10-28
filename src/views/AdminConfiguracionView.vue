
<script setup>
import { ref, watch } from 'vue'

const valoresIniciales = {
  nombrePlataforma: 'StudentWallet',
  correoSoporte: 'soporte@studentwallet.demo',
  moneda: 'USD',
  registroUsuarios: true,
  permitirSugerencias: true,
  notificaciones: true,
  modoMantenimiento: false,
}

function cargarConfiguracion() {
  try {
    const datos = localStorage.getItem('studentwallet_admin_config')

    if (!datos) return { ...valoresIniciales }

    const guardado = JSON.parse(datos)

    return {
      ...valoresIniciales,
      ...(guardado && typeof guardado === 'object' && !Array.isArray(guardado)
        ? guardado
        : {}),
    }
  } catch {
    return { ...valoresIniciales }
  }
}

const configuracion = ref(cargarConfiguracion())
const snackbar = ref(false)
const mensaje = ref('')
const colorMensaje = ref('success')
const dialogoRestablecer = ref(false)

const reglas = {
  requerido: v => !!String(v ?? '').trim() || 'Campo obligatorio',
  correo: v =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? '')) ||
    'Ingresa un correo válido',
}

const formulario = ref(null)

async function guardarConfiguracion() {
  const resultado = await formulario.value.validate()

  if (!resultado.valid) return

  try {
    localStorage.setItem(
      'studentwallet_admin_config',
      JSON.stringify(configuracion.value)
    )

    mensaje.value = 'Configuración guardada correctamente.'
    colorMensaje.value = 'success'
    snackbar.value = true
  } catch {
    mensaje.value = 'No se pudo guardar la configuración.'
    colorMensaje.value = 'error'
    snackbar.value = true
  }
}

function restablecerConfiguracion() {
  configuracion.value = { ...valoresIniciales }

  try {
    localStorage.setItem(
      'studentwallet_admin_config',
      JSON.stringify(configuracion.value)
    )

    mensaje.value = 'Configuración restablecida correctamente.'
    colorMensaje.value = 'success'
  } catch {
    mensaje.value = 'No se pudo restablecer la configuración.'
    colorMensaje.value = 'error'
  }

  dialogoRestablecer.value = false
  snackbar.value = true
}
</script>

<template>
  <div class="config-page">
    <div class="page-header">
      <div>
        <v-chip color="primary" variant="tonal" class="mb-3">
          Administración
        </v-chip>

        <h1>Configuración general</h1>

        <p>
          Personaliza las preferencias administrativas
          y los parámetros de StudentWallet.
        </p>
      </div>

      <v-chip color="info" variant="tonal">
        Modo demostración
      </v-chip>
    </div>

    <v-form ref="formulario" @submit.prevent="guardarConfiguracion">
      <v-row class="mt-5">
        <!-- INFORMACIÓN GENERAL -->
        <v-col cols="12" lg="7">
          <v-card class="config-card" elevation="0">
            <div class="section-heading">
              <div class="section-icon blue">
                <v-icon color="primary">
                  mdi-cog-outline
                </v-icon>
              </div>

              <div>
                <h2>Información de la plataforma</h2>
                <p>Datos generales de StudentWallet</p>
              </div>
            </div>

            <v-text-field
              v-model="configuracion.nombrePlataforma"
              label="Nombre de la plataforma"
              prepend-inner-icon="mdi-web"
              variant="outlined"
              rounded="lg"
              :rules="[reglas.requerido]"
              class="mt-5"
            />

            <v-text-field
              v-model="configuracion.correoSoporte"
              label="Correo de soporte"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              rounded="lg"
              :rules="[reglas.requerido, reglas.correo]"
            />

            <v-select
              v-model="configuracion.moneda"
              label="Moneda predeterminada"
              :items="[
                { title: 'Dólar estadounidense (USD)', value: 'USD' },
              ]"
              prepend-inner-icon="mdi-currency-usd"
              variant="outlined"
              rounded="lg"
            />

            <v-alert type="info" variant="tonal" density="comfortable">
              Por ahora StudentWallet trabaja únicamente con dólares
              estadounidenses.
            </v-alert>
          </v-card>

          <!-- FUNCIONES -->
          <v-card class="config-card mt-5" elevation="0">
            <div class="section-heading">
              <div class="section-icon purple">
                <v-icon color="#7C3AED">
                  mdi-tune-variant
                </v-icon>
              </div>

              <div>
                <h2>Funciones de la plataforma</h2>
                <p>Preferencias administrativas de demostración</p>
              </div>
            </div>

            <div class="setting-row">
              <div>
                <strong>Registro de estudiantes</strong>
                <p>Preferencia para permitir nuevas cuentas</p>
              </div>

              <v-switch
                v-model="configuracion.registroUsuarios"
                color="primary"
                hide-details
                inset
              />
            </div>

            <v-divider />

            <div class="setting-row">
              <div>
                <strong>Comentarios y sugerencias</strong>
                <p>Preferencia para recibir opiniones de estudiantes</p>
              </div>

              <v-switch
                v-model="configuracion.permitirSugerencias"
                color="primary"
                hide-details
                inset
              />
            </div>

            <v-divider />

            <div class="setting-row">
              <div>
                <strong>Notificaciones generales</strong>
                <p>Preferencia para avisos de la plataforma</p>
              </div>

              <v-switch
                v-model="configuracion.notificaciones"
                color="primary"
                hide-details
                inset
              />
            </div>

            <v-divider />

            <div class="setting-row">
              <div>
                <strong>Modo mantenimiento</strong>
                <p>Preferencia para suspender temporalmente el servicio</p>
              </div>

              <v-switch
                v-model="configuracion.modoMantenimiento"
                color="warning"
                hide-details
                inset
              />
            </div>

            <v-alert
              v-if="configuracion.modoMantenimiento"
              type="warning"
              variant="tonal"
              class="mt-4"
            >
              El modo mantenimiento está seleccionado, pero todavía
              no bloquea el acceso a la plataforma.
            </v-alert>
          </v-card>
        </v-col>

        <!-- PANEL DERECHO -->
        <v-col cols="12" lg="5">
          <v-card class="config-card" elevation="0">
            <div class="section-heading">
              <div class="section-icon green">
                <v-icon color="success">
                  mdi-check-decagram-outline
                </v-icon>
              </div>

              <div>
                <h2>Estado de los módulos</h2>
                <p>Secciones desarrolladas</p>
              </div>
            </div>

            <div
              v-for="modulo in [
                'Dashboard administrativo',
                'Gestión de usuarios',
                'Supervisión financiera',
                'Comentarios y sugerencias',
                'Reportes PDF y Excel',
                'Configuración',
              ]"
              :key="modulo"
              class="module-row"
            >
              <span>{{ modulo }}</span>

              <v-chip color="success" size="small" variant="tonal">
                Demo
              </v-chip>
            </div>
          </v-card>

          <v-card class="config-card mt-5" elevation="0">
            <div class="section-heading">
              <div class="section-icon orange">
                <v-icon color="warning">
                  mdi-restore
                </v-icon>
              </div>

              <div>
                <h2>Restablecer preferencias</h2>
                <p>Recupera la configuración inicial</p>
              </div>
            </div>

            <p class="restore-description">
              Esta acción restablecerá únicamente las preferencias
              administrativas. No eliminará usuarios, movimientos
              ni comentarios.
            </p>

            <v-btn
              color="warning"
              variant="tonal"
              block
              rounded="lg"
              prepend-icon="mdi-restore"
              @click="dialogoRestablecer = true"
            >
              Restablecer configuración
            </v-btn>
          </v-card>

          <v-alert
            type="info"
            variant="tonal"
            rounded="lg"
            class="mt-5"
          >
            Las preferencias se almacenan en este navegador.
            Todavía no controlan el funcionamiento real de
            los módulos ni se sincronizan entre usuarios.
          </v-alert>
        </v-col>
      </v-row>

      <div class="save-actions">
        <v-btn
          color="primary"
          size="large"
          rounded="lg"
          prepend-icon="mdi-content-save-outline"
          type="submit"
        >
          Guardar configuración
        </v-btn>
      </div>
    </v-form>

    <!-- CONFIRMACIÓN -->
    <v-dialog v-model="dialogoRestablecer" max-width="420">
      <v-card rounded="xl" class="pa-4">
        <v-card-title>
          Restablecer configuración
        </v-card-title>

        <v-card-text>
          ¿Deseas recuperar los valores iniciales de las
          preferencias administrativas?
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            @click="dialogoRestablecer = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="warning"
            variant="flat"
            @click="restablecerConfiguracion"
          >
            Restablecer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
      :color="colorMensaje"
      location="top right"
      :timeout="3000"
    >
      {{ mensaje }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.config-page {
  min-height: 100vh;
  padding: 32px;
  background: #f6f8fc;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
}

.page-header p {
  margin-top: 8px;
  color: #64748b;
}

.config-card {
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 18px;
  padding: 24px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.section-heading h2 {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.section-heading p {
  color: #64748b;
  font-size: 13px;
  margin-top: 5px;
}

.section-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.blue {
  background: #dbeafe;
}

.purple {
  background: #ede9fe;
}

.green {
  background: #d1fae5;
}

.orange {
  background: #fef3c7;
}

.setting-row,
.module-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 15px 0;
}

.setting-row strong {
  font-size: 14px;
  color: #0f172a;
}

.setting-row p {
  color: #64748b;
  font-size: 12px;
  margin-top: 5px;
}

.module-row {
  font-size: 13px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.restore-description {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 20px;
}

.save-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 600px) {
  .config-page {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .config-card {
    padding: 18px;
  }

  .save-actions :deep(.v-btn) {
    width: 100%;
  }
}
</style>
