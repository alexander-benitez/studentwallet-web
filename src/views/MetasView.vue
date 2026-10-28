
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

const router = useRouter()
const finanzas = useFinanzasStore()

const dialogMeta = ref(false)
const dialogAhorro = ref(false)
const dialogEliminar = ref(false)

const formMeta = ref(null)
const formAhorro = ref(null)

const nombre = ref('')
const objetivo = ref(null)
const fechaLimite = ref('')
const icono = ref('mdi-bullseye-arrow')

const metaSeleccionada = ref(null)
const cantidadAhorro = ref(null)

const snackbar = ref(false)
const mensaje = ref('')
const colorMensaje = ref('success')

const iconos = [
  { title: 'Objetivo general', value: 'mdi-bullseye-arrow' },
  { title: 'Laptop', value: 'mdi-laptop' },
  { title: 'Universidad', value: 'mdi-school' },
  { title: 'Viaje', value: 'mdi-airplane' },
  { title: 'Celular', value: 'mdi-cellphone' },
  { title: 'Emergencias', value: 'mdi-shield-check' },
  { title: 'Compras', value: 'mdi-shopping-outline' },
]

const dinero = valor =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)

const obligatorio = v =>
  !!String(v ?? '').trim() || 'Este campo es obligatorio'

const montoValido = v =>
  (Number.isFinite(Number(v)) && Number(v) > 0) ||
  'Ingresa una cantidad mayor que cero'

const metas = computed(() =>
  finanzas.metas.map(meta => ({
    ...meta,
    porcentaje: meta.target > 0
      ? Math.min((meta.saved / meta.target) * 100, 100)
      : 0,
    restante: Math.max(meta.target - meta.saved, 0),
    completada: meta.saved >= meta.target,
  }))
)

const metasCompletadas = computed(() =>
  metas.value.filter(m => m.completada).length
)

const objetivoTotal = computed(() =>
  metas.value.reduce((total, m) => total + Number(m.target), 0)
)

function notificar(texto, color = 'success') {
  mensaje.value = texto
  colorMensaje.value = color
  snackbar.value = true
}

function abrirMeta() {
  nombre.value = ''
  objetivo.value = null
  fechaLimite.value = ''
  icono.value = 'mdi-bullseye-arrow'
  dialogMeta.value = true
}

async function guardarMeta() {
  const resultado = await formMeta.value.validate()
  if (!resultado.valid) return

  const guardada = finanzas.agregarMeta({
    name: nombre.value.trim(),
    target: Number(objetivo.value),
    deadline: fechaLimite.value,
    icon: icono.value,
  })

  if (!guardada) {
    notificar('No se pudo crear la meta', 'error')
    return
  }

  dialogMeta.value = false
  notificar('Meta de ahorro creada correctamente')
}

function abrirAhorro(meta) {
  metaSeleccionada.value = meta
  cantidadAhorro.value = null
  dialogAhorro.value = true
}

async function guardarAhorro() {
  const resultado = await formAhorro.value.validate()
  if (!resultado.valid || !metaSeleccionada.value) return

  const guardado = finanzas.agregarAhorro(
    metaSeleccionada.value.id,
    Number(cantidadAhorro.value)
  )

  if (!guardado) {
    notificar(
      'El monto debe ser positivo y no superar lo que falta por ahorrar',
      'error'
    )
    return
  }

  dialogAhorro.value = false
  notificar('Ahorro agregado correctamente')
}

function confirmarEliminar(meta) {
  metaSeleccionada.value = meta
  dialogEliminar.value = true
}

function eliminarMeta() {
  if (!metaSeleccionada.value) return

  finanzas.eliminarMeta(metaSeleccionada.value.id)
  dialogEliminar.value = false
  metaSeleccionada.value = null
  notificar('Meta eliminada correctamente')
}

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha límite'

  const [anio, mes, dia] = fecha.split('-').map(Number)
  if (!anio || !mes || !dia) return fecha

  return new Date(anio, mes - 1, dia).toLocaleDateString('es-SV', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <v-container fluid class="goals-page pa-4 pa-md-8">
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

        <h1>Mis metas de ahorro</h1>
        <p>Convierte tus sueños en objetivos financieros alcanzables.</p>
      </div>

      <v-btn
        color="primary"
        size="large"
        rounded="lg"
        prepend-icon="mdi-plus"
        @click="abrirMeta"
      >
        Nueva meta
      </v-btn>
    </div>

    <!-- ESTADÍSTICAS -->
    <v-row class="mt-5">
      <v-col cols="12" md="4">
        <v-card class="stat-card gradient-card" elevation="0">
          <div class="stat-heading">
            <span>Total ahorrado</span>
            <v-icon>mdi-piggy-bank-outline</v-icon>
          </div>
          <h2>{{ dinero(finanzas.totalAhorrado) }}</h2>
          <p>Acumulado en todas tus metas</p>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-heading">
            <span>Objetivo total</span>
            <v-icon color="primary">mdi-target</v-icon>
          </div>
          <h2>{{ dinero(objetivoTotal) }}</h2>
          <p>Dinero que deseas ahorrar</p>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-heading">
            <span>Metas completadas</span>
            <v-icon color="success">mdi-check-decagram</v-icon>
          </div>
          <h2>{{ metasCompletadas }} / {{ metas.length }}</h2>
          <p>Objetivos que has alcanzado</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- METAS -->
    <div class="section-heading">
      <div>
        <h2>Tus objetivos</h2>
        <p>Visualiza el progreso de cada meta de ahorro.</p>
      </div>

      <v-chip color="primary" variant="tonal">
        {{ metas.length }} metas
      </v-chip>
    </div>

    <v-row v-if="metas.length">
      <v-col
        v-for="meta in metas"
        :key="meta.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="goal-card" elevation="0">
          <div class="goal-top">
            <div class="goal-icon">
              <v-icon size="28" color="primary">
                {{ meta.icon }}
              </v-icon>
            </div>

            <v-btn
              icon="mdi-delete-outline"
              color="error"
              variant="text"
              size="small"
              @click="confirmarEliminar(meta)"
            />
          </div>

          <h3 class="goal-name">{{ meta.name }}</h3>

          <div class="goal-date">
            <v-icon size="16">mdi-calendar-outline</v-icon>
            {{ formatearFecha(meta.deadline) }}
          </div>

          <div class="goal-amount">
            <h2>{{ dinero(meta.saved) }}</h2>
            <span>de {{ dinero(meta.target) }}</span>
          </div>

          <v-progress-linear
            :model-value="meta.porcentaje"
            :color="meta.completada ? 'success' : 'primary'"
            height="11"
            rounded
            class="mt-4"
          />

          <div class="progress-details">
            <span>{{ meta.porcentaje.toFixed(0) }}% completado</span>
            <span>{{ dinero(meta.restante) }} restantes</span>
          </div>

          <v-alert
            v-if="meta.completada"
            type="success"
            variant="tonal"
            density="compact"
            class="mt-5"
          >
            ¡Felicidades! Has alcanzado tu meta.
          </v-alert>

          <v-btn
            v-else
            block
            color="primary"
            rounded="lg"
            prepend-icon="mdi-plus-circle-outline"
            class="mt-5"
            @click="abrirAhorro(meta)"
          >
            Agregar ahorro
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- ESTADO VACÍO -->
    <v-card v-else class="empty-state" elevation="0">
      <v-icon size="70" color="grey-lighten-1">
        mdi-piggy-bank-outline
      </v-icon>

      <h3>Empieza a cumplir tus metas</h3>
      <p>
        Crea un objetivo, registra tus ahorros y observa cómo avanzas.
      </p>

      <v-btn
        color="primary"
        rounded="lg"
        prepend-icon="mdi-plus"
        @click="abrirMeta"
      >
        Crear mi primera meta
      </v-btn>
    </v-card>

    <!-- FORMULARIO NUEVA META -->
    <v-dialog v-model="dialogMeta" max-width="500">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="dialog-header">
          <div>
            <h3>Nueva meta de ahorro</h3>
            <p>Define qué deseas conseguir.</p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogMeta = false"
          />
        </v-card-title>

        <v-card-text>
          <v-form ref="formMeta" @submit.prevent="guardarMeta">
            <label>Nombre de la meta</label>
            <v-text-field
              v-model="nombre"
              placeholder="Ej. Comprar una laptop"
              prepend-inner-icon="mdi-pencil-outline"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio]"
              class="mt-2 mb-2"
            />

            <label>Cantidad objetivo (USD)</label>
            <v-text-field
              v-model="objetivo"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ej. 600"
              prepend-inner-icon="mdi-currency-usd"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio, montoValido]"
              class="mt-2 mb-2"
            />

            <label>Fecha objetivo (opcional)</label>
            <v-text-field
              v-model="fechaLimite"
              type="date"
              variant="outlined"
              rounded="lg"
              class="mt-2 mb-2"
            />

            <label>Ícono de la meta</label>
            <v-select
              v-model="icono"
              :items="iconos"
              item-title="title"
              item-value="value"
              variant="outlined"
              rounded="lg"
              class="mt-2 mb-4"
            >
              <template #selection="{ item }">
                <v-icon class="mr-2">{{ item.raw.value }}</v-icon>
                {{ item.raw.title }}
              </template>

              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon>{{ item.raw.value }}</v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              rounded="lg"
              prepend-icon="mdi-content-save-outline"
            >
              Crear meta
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- FORMULARIO AGREGAR AHORRO -->
    <v-dialog v-model="dialogAhorro" max-width="440">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="dialog-header">
          <div>
            <h3>Agregar ahorro</h3>
            <p>{{ metaSeleccionada?.name }}</p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogAhorro = false"
          />
        </v-card-title>

        <v-card-text>
          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="mb-5"
          >
            Te faltan
            {{ dinero(metaSeleccionada?.restante || 0) }}
            para alcanzar tu objetivo.
          </v-alert>

          <v-form ref="formAhorro" @submit.prevent="guardarAhorro">
            <label>Cantidad a ahorrar (USD)</label>
            <v-text-field
              v-model="cantidadAhorro"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ej. 25"
              prepend-inner-icon="mdi-currency-usd"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio, montoValido]"
              class="mt-2 mb-4"
            />

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              rounded="lg"
              prepend-icon="mdi-piggy-bank-outline"
            >
              Guardar ahorro
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- CONFIRMACIÓN DE ELIMINACIÓN -->
    <v-dialog v-model="dialogEliminar" max-width="420">
      <v-card rounded="xl" class="delete-dialog">
        <v-icon size="48" color="error">
          mdi-delete-alert-outline
        </v-icon>

        <h3>¿Eliminar esta meta?</h3>

        <p>
          Se eliminará
          <strong>{{ metaSeleccionada?.name }}</strong>
          y su progreso registrado. Esta acción no se puede deshacer.
        </p>

        <div class="delete-actions">
          <v-btn
            variant="outlined"
            rounded="lg"
            @click="dialogEliminar = false"
          >
            Cancelar
          </v-btn>

          <v-btn color="error" rounded="lg" @click="eliminarMeta">
            Eliminar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- NOTIFICACIONES -->
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
.goals-page {
  min-height: 100vh;
  background: #f6f8fc;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-header,
.stat-heading,
.goal-top,
.progress-details,
.dialog-header,
.delete-actions,
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header {
  flex-wrap: wrap;
}

.page-header h1 {
  color: #0f172a;
  font-size: 30px;
  font-weight: 800;
}

.page-header p,
.section-heading p {
  color: #64748b;
  font-size: 14px;
  margin-top: 7px;
}

.stat-card {
  min-height: 175px;
  padding: 26px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
  transition: transform 0.25s, box-shadow 0.25s;
}

.stat-card:hover,
.goal-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px #0f172a12;
}

.stat-heading {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.stat-card h2 {
  font-size: 31px;
  font-weight: 800;
  margin-top: 25px;
}

.stat-card p {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 10px;
}

.gradient-card {
  background: linear-gradient(135deg, #2563eb, #4338ca, #7c3aed);
  color: white;
  border: none;
}

.gradient-card .stat-heading,
.gradient-card p {
  color: white;
}

.section-heading {
  margin: 35px 0 20px;
}

.section-heading h2 {
  font-size: 21px;
  font-weight: 800;
  color: #0f172a;
}

.goal-card {
  padding: 25px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
  transition: transform 0.25s, box-shadow 0.25s;
}

.goal-icon {
  width: 56px;
  height: 56px;
  border-radius: 17px;
  background: #ede9fe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goal-name {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 22px;
}

.goal-date {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #94a3b8;
  font-size: 13px;
  margin-top: 8px;
}

.goal-amount {
  margin-top: 28px;
  display: flex;
  align-items: baseline;
  gap: 9px;
  flex-wrap: wrap;
}

.goal-amount h2 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}

.goal-amount span {
  color: #94a3b8;
  font-size: 13px;
}

.progress-details {
  margin-top: 13px;
  color: #64748b;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 70px 20px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
}

.empty-state h3 {
  font-size: 21px;
  font-weight: 800;
  margin-top: 15px;
  color: #334155;
}

.empty-state p {
  color: #94a3b8;
  margin: 12px 0 25px;
}

.dialog-card {
  padding: 12px;
}

.dialog-header {
  padding: 20px 20px 10px;
}

.dialog-header h3 {
  font-size: 21px;
  font-weight: 800;
}

.dialog-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 5px;
}

.dialog-card label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.delete-dialog {
  padding: 30px;
  text-align: center;
}

.delete-dialog h3 {
  font-size: 21px;
  font-weight: 800;
  margin-top: 15px;
}

.delete-dialog p {
  color: #64748b;
  line-height: 1.7;
  margin-top: 12px;
}

.delete-actions {
  justify-content: center;
  margin-top: 25px;
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 25px;
  }

  .stat-card h2 {
    font-size: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .goal-card {
    transition: none;
  }
}
</style>
