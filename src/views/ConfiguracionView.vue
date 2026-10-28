
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

const router = useRouter()
const finanzas = useFinanzasStore()

const dialogRestablecer = ref(false)
const snackbar = ref(false)
const mensaje = ref('')
const colorMensaje = ref('success')

const preferencias = computed(() => finanzas.configuracion)

const dinero = valor =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)

function actualizarPreferencia(campo, valor) {
  finanzas.actualizarConfiguracion({
    [campo]: valor,
  })

  notificar('Preferencia guardada correctamente')
}

function notificar(texto, color = 'success') {
  mensaje.value = texto
  colorMensaje.value = color
  snackbar.value = true
}

function restablecerPreferencias() {
  finanzas.restablecerConfiguracion()
  dialogRestablecer.value = false
  notificar('Configuración restablecida correctamente')
}

function exportarDatos() {
  try {
    const respaldo = {
      aplicacion: 'StudentWallet',
      version: '1.0',
      fechaExportacion: new Date().toISOString(),
      perfil: finanzas.perfil,
      movimientos: finanzas.movimientos,
      presupuestos: finanzas.presupuestos,
      metas: finanzas.metas,
      configuracion: finanzas.configuracion,
    }

    const contenido = JSON.stringify(respaldo, null, 2)
    const blob = new Blob([contenido], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download =
      `studentwallet-respaldo-${new Date().toISOString().slice(0, 10)}.json`

    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()

    setTimeout(() => URL.revokeObjectURL(url), 1000)

    notificar('Respaldo descargado correctamente')
  } catch (error) {
    console.error('Error al exportar:', error)
    notificar('No se pudo exportar el respaldo', 'error')
  }
}

const resumen = computed(() => ({
  movimientos: finanzas.movimientos.length,
  presupuestos: finanzas.presupuestos.length,
  metas: finanzas.metas.length,
}))
</script>

<template>
  <v-container fluid class="settings-page pa-4 pa-md-8">
    <!-- ENCABEZADO -->
    <div class="page-header">
      <div>
        <v-btn
          color="primary"
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="mb-3"
          @click="router.push('/dashboard')"
        >
          Volver al Dashboard
        </v-btn>

        <h1>Configuración</h1>
        <p>Personaliza tu experiencia en StudentWallet.</p>
      </div>

      <v-chip color="primary" variant="tonal" size="large">
        <v-icon start>mdi-cog-outline</v-icon>
        Preferencias
      </v-chip>
    </div>

    <v-row class="mt-5">
      <!-- COLUMNA PRINCIPAL -->
      <v-col cols="12" lg="8">
        <!-- PREFERENCIAS -->
        <v-card class="settings-card" elevation="0">
          <div class="card-heading">
            <div class="heading-icon blue-icon">
              <v-icon color="primary">mdi-tune-variant</v-icon>
            </div>

            <div>
              <h2>Preferencias generales</h2>
              <p>Configura las opciones de tu aplicación.</p>
            </div>
          </div>

          <v-divider class="my-5" />

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-icon">
                <v-icon color="primary">
                  mdi-currency-usd
                </v-icon>
              </div>

              <div>
                <h3>Moneda principal</h3>
                <p>Moneda utilizada en tus registros financieros.</p>
              </div>
            </div>

            <v-chip color="primary" variant="tonal">
              USD ($)
            </v-chip>
          </div>

          <v-divider class="my-4" />

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-icon">
                <v-icon color="primary">
                  mdi-bell-outline
                </v-icon>
              </div>

              <div>
                <h3>Notificaciones</h3>
                <p>
                  Preferencia general para avisos dentro de la aplicación.
                </p>
              </div>
            </div>

            <v-switch
              :model-value="preferencias.notificaciones"
              color="primary"
              hide-details
              inset
              @update:model-value="
                actualizarPreferencia('notificaciones', $event)
              "
            />
          </div>

          <v-divider class="my-4" />

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-icon">
                <v-icon color="warning">
                  mdi-alert-circle-outline
                </v-icon>
              </div>

              <div>
                <h3>Alertas de presupuesto</h3>
                <p>
                  Preferencia para avisos al acercarte a tus límites.
                </p>
              </div>
            </div>

            <v-switch
              :model-value="preferencias.alertasPresupuesto"
              color="primary"
              hide-details
              inset
              @update:model-value="
                actualizarPreferencia('alertasPresupuesto', $event)
              "
            />
          </div>

          <v-divider class="my-4" />

          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-icon">
                <v-icon color="success">
                  mdi-lightbulb-outline
                </v-icon>
              </div>

              <div>
                <h3>Consejos financieros</h3>
                <p>
                  Preferencia para mostrar recomendaciones de ahorro.
                </p>
              </div>
            </div>

            <v-switch
              :model-value="preferencias.mostrarConsejos"
              color="primary"
              hide-details
              inset
              @update:model-value="
                actualizarPreferencia('mostrarConsejos', $event)
              "
            />
          </div>
        </v-card>

        <!-- RESPALDO -->
        <v-card class="settings-card mt-5" elevation="0">
          <div class="card-heading">
            <div class="heading-icon green-icon">
              <v-icon color="success">
                mdi-database-export-outline
              </v-icon>
            </div>

            <div>
              <h2>Respaldo de información</h2>
              <p>Guarda una copia de tus datos de StudentWallet.</p>
            </div>
          </div>

          <v-divider class="my-5" />

          <p class="section-description">
            Descarga un archivo JSON con tu perfil, movimientos,
            presupuestos, metas de ahorro y preferencias.
          </p>

          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="my-5"
          >
            Guarda el archivo en un lugar seguro. El respaldo
            puede contener información personal y financiera.
          </v-alert>

          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="mdi-download-outline"
            size="large"
            @click="exportarDatos"
          >
            Exportar mis datos
          </v-btn>
        </v-card>

        <!-- RESTABLECER -->
        <v-card class="settings-card mt-5" elevation="0">
          <div class="card-heading">
            <div class="heading-icon orange-icon">
              <v-icon color="warning">
                mdi-restore
              </v-icon>
            </div>

            <div>
              <h2>Restablecer preferencias</h2>
              <p>Recupera la configuración predeterminada.</p>
            </div>
          </div>

          <v-divider class="my-5" />

          <p class="section-description">
            Esta acción restablece las preferencias de
            notificaciones, alertas y consejos financieros.
            No elimina tus ingresos, gastos, presupuestos ni metas.
          </p>

          <v-btn
            color="warning"
            variant="outlined"
            rounded="lg"
            prepend-icon="mdi-restore"
            class="mt-5"
            @click="dialogRestablecer = true"
          >
            Restablecer configuración
          </v-btn>
        </v-card>
      </v-col>

      <!-- COLUMNA LATERAL -->
      <v-col cols="12" lg="4">
        <v-card class="overview-card" elevation="0">
          <div class="overview-banner">
            <v-icon size="35">mdi-wallet-outline</v-icon>
            <h2>StudentWallet</h2>
            <p>Tu compañero financiero estudiantil</p>
          </div>

          <div class="overview-content">
            <h3>Resumen de tus datos</h3>

            <div class="overview-item">
              <span>
                <v-icon size="19" color="primary">
                  mdi-swap-horizontal
                </v-icon>
                Movimientos
              </span>
              <strong>{{ resumen.movimientos }}</strong>
            </div>

            <div class="overview-item">
              <span>
                <v-icon size="19" color="primary">
                  mdi-chart-donut
                </v-icon>
                Presupuestos
              </span>
              <strong>{{ resumen.presupuestos }}</strong>
            </div>

            <div class="overview-item">
              <span>
                <v-icon size="19" color="primary">
                  mdi-piggy-bank-outline
                </v-icon>
                Metas de ahorro
              </span>
              <strong>{{ resumen.metas }}</strong>
            </div>

            <v-divider class="my-5" />

            <div class="balance-label">Saldo actual</div>
            <h2 class="balance-value">
              {{ dinero(finanzas.saldo) }}
            </h2>

            <v-btn
              block
              color="primary"
              variant="tonal"
              rounded="lg"
              class="mt-5"
              @click="router.push('/perfil')"
            >
              <v-icon start>mdi-account-circle-outline</v-icon>
              Administrar mi perfil
            </v-btn>
          </div>
        </v-card>

        <v-alert
          type="info"
          variant="tonal"
          class="mt-5"
          rounded="lg"
        >
          <strong>Almacenamiento local</strong>
          <p class="mt-2">
            Tus datos se guardan en este navegador.
            Si borras sus datos o cambias de dispositivo,
            podrías perder la información.
          </p>
        </v-alert>
      </v-col>
    </v-row>

    <!-- CONFIRMACIÓN -->
    <v-dialog v-model="dialogRestablecer" max-width="420">
      <v-card class="confirm-dialog" rounded="xl">
        <v-icon size="50" color="warning">
          mdi-alert-circle-outline
        </v-icon>

        <h3>¿Restablecer configuración?</h3>

        <p>
          Las preferencias volverán a sus valores iniciales.
          Tus registros financieros permanecerán intactos.
        </p>

        <div class="dialog-actions">
          <v-btn
            variant="outlined"
            rounded="lg"
            @click="dialogRestablecer = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            rounded="lg"
            @click="restablecerPreferencias"
          >
            Confirmar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- NOTIFICACIÓN -->
    <v-snackbar
      v-model="snackbar"
      :color="colorMensaje"
      location="top right"
      rounded="lg"
      :timeout="3500"
    >
      <v-icon class="mr-2">mdi-check-circle-outline</v-icon>
      {{ mensaje }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f6f8fc;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-header,
.card-heading,
.setting-row,
.setting-info,
.overview-item,
.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header {
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
}

.page-header p {
  color: #64748b;
  font-size: 14px;
  margin-top: 7px;
}

.settings-card {
  padding: 28px;
  border: 1px solid #e9edf5;
  border-radius: 20px;
}

.card-heading {
  justify-content: flex-start;
}

.heading-icon,
.setting-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 14px;
}

.heading-icon {
  width: 52px;
  height: 52px;
}

.blue-icon {
  background: #eff6ff;
}

.green-icon {
  background: #ecfdf5;
}

.orange-icon {
  background: #fffbeb;
}

.card-heading h2 {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
}

.card-heading p,
.section-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.7;
  margin-top: 6px;
}

.setting-info {
  justify-content: flex-start;
  flex: 1;
  min-width: 0;
}

.setting-icon {
  width: 43px;
  height: 43px;
  background: #f8fafc;
}

.setting-info h3 {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.setting-info p {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 5px;
  line-height: 1.5;
}

.overview-card {
  border: 1px solid #e9edf5;
  border-radius: 20px;
  overflow: hidden;
}

.overview-banner {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  padding: 32px 25px;
  text-align: center;
}

.overview-banner h2 {
  font-size: 23px;
  font-weight: 800;
  margin-top: 10px;
}

.overview-banner p {
  font-size: 12px;
  margin-top: 6px;
  opacity: 0.9;
}

.overview-content {
  padding: 25px;
}

.overview-content h3 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 22px;
}

.overview-item {
  margin-top: 18px;
  font-size: 13px;
  color: #64748b;
}

.overview-item span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.overview-item strong {
  color: #0f172a;
  font-size: 16px;
}

.balance-label {
  color: #64748b;
  font-size: 13px;
}

.balance-value {
  font-size: 30px;
  font-weight: 800;
  color: #2563eb;
  margin-top: 8px;
}

.confirm-dialog {
  padding: 30px;
  text-align: center;
}

.confirm-dialog h3 {
  font-size: 21px;
  font-weight: 800;
  margin-top: 15px;
  color: #0f172a;
}

.confirm-dialog p {
  color: #64748b;
  line-height: 1.7;
  margin-top: 12px;
}

.dialog-actions {
  justify-content: center;
  margin-top: 25px;
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 25px;
  }

  .settings-card {
    padding: 20px;
  }

  .setting-row {
    align-items: flex-start;
  }

  .setting-info {
    align-items: flex-start;
  }
}
</style>
