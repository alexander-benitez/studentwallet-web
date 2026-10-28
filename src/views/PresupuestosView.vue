
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

const router = useRouter()
const finanzas = useFinanzasStore()

const dialog = ref(false)
const dialogEliminar = ref(false)
const presupuestoEliminar = ref(null)
const form = ref(null)

const categoria = ref(null)
const limite = ref(null)
const mes = ref(new Date().toLocaleDateString('en-CA').slice(0, 7))
const mesSeleccionado = ref(new Date().toLocaleDateString('en-CA').slice(0, 7))

const snackbar = ref(false)
const mensaje = ref('')
const colorAlerta = ref('success')

const categorias = [
  { title: 'Alimentación', icon: 'mdi-food', color: '#F59E0B' },
  { title: 'Transporte', icon: 'mdi-bus', color: '#2563EB' },
  { title: 'Educación', icon: 'mdi-school', color: '#7C3AED' },
  { title: 'Entretenimiento', icon: 'mdi-gamepad-variant', color: '#EC4899' },
  { title: 'Salud', icon: 'mdi-medical-bag', color: '#10B981' },
  { title: 'Compras', icon: 'mdi-shopping', color: '#06B6D4' },
  { title: 'Otros', icon: 'mdi-dots-horizontal-circle', color: '#64748B' },
]

const presupuestosMes = computed(() =>
  finanzas.presupuestos
    .filter(p => p.month === mesSeleccionado.value)
    .map(p => {
      const gastado = finanzas.movimientos
        .filter(m =>
          m.type === 'expense' &&
          m.category === p.category &&
          m.date?.startsWith(p.month)
        )
        .reduce((total, m) => total + Number(m.amount), 0)

      const porcentaje = p.limit > 0
        ? (gastado / p.limit) * 100
        : 0

      const info = categorias.find(c => c.title === p.category)

      return {
        ...p,
        gastado,
        disponible: Math.max(0, p.limit - gastado),
        porcentaje,
        icon: info?.icon || 'mdi-wallet',
        color: info?.color || '#2563EB',
      }
    })
)

const totalPresupuestado = computed(() =>
  presupuestosMes.value.reduce((total, p) => total + Number(p.limit), 0)
)

const totalGastado = computed(() =>
  presupuestosMes.value.reduce((total, p) => total + p.gastado, 0)
)

const disponibles = computed(() =>
  Math.max(0, totalPresupuestado.value - totalGastado.value)
)

const dinero = valor =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)

const obligatorio = v =>
  !!v || 'Este campo es obligatorio'

const limiteValido = v =>
  (Number.isFinite(Number(v)) && Number(v) > 0) ||
  'Ingresa un límite mayor a cero'

function colorProgreso(porcentaje) {
  if (porcentaje >= 100) return 'error'
  if (porcentaje >= 80) return 'warning'
  return 'success'
}

function estadoPresupuesto(porcentaje) {
  if (porcentaje >= 100) return 'Límite superado'
  if (porcentaje >= 80) return 'Cerca del límite'
  return 'Bajo control'
}

function abrirFormulario() {
  categoria.value = null
  limite.value = null
  mes.value = mesSeleccionado.value
  dialog.value = true
}

async function guardar() {
  const resultado = await form.value.validate()
  if (!resultado.valid) return

  finanzas.guardarPresupuesto({
    category: categoria.value,
    month: mes.value,
    limit: Number(limite.value),
  })

  mesSeleccionado.value = mes.value
  dialog.value = false

  mensaje.value = 'Presupuesto guardado correctamente'
  colorAlerta.value = 'success'
  snackbar.value = true
}

function confirmarEliminar(presupuesto) {
  presupuestoEliminar.value = presupuesto
  dialogEliminar.value = true
}

function eliminar() {
  if (!presupuestoEliminar.value) return

  finanzas.eliminarPresupuesto(
    presupuestoEliminar.value.category,
    presupuestoEliminar.value.month
  )

  dialogEliminar.value = false
  presupuestoEliminar.value = null

  mensaje.value = 'Presupuesto eliminado correctamente'
  colorAlerta.value = 'success'
  snackbar.value = true
}
</script>

<template>
  <v-container fluid class="budgets-page pa-4 pa-md-8">
    <div class="page-header">
      <div>
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          color="primary"
          class="mb-3"
          @click="router.push('/dashboard')"
        >
          Volver al Dashboard
        </v-btn>

        <h1>Mis presupuestos</h1>
        <p>Organiza tus gastos y mantén el control de tu dinero.</p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        rounded="lg"
        @click="abrirFormulario"
      >
        Nuevo presupuesto
      </v-btn>
    </div>

    <div class="month-filter">
      <v-icon color="primary">mdi-calendar-month-outline</v-icon>
      <span>Seleccionar mes</span>
      <input v-model="mesSeleccionado" type="month" />
    </div>

    <!-- RESUMEN -->
    <v-row class="mt-5">
      <v-col cols="12" md="4">
        <v-card class="summary-card gradient-card" elevation="0">
          <div class="summary-heading">
            <span>Total presupuestado</span>
            <v-icon>mdi-wallet-outline</v-icon>
          </div>

          <h2>{{ dinero(totalPresupuestado) }}</h2>
          <p>Planificado para este mes</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="summary-card" elevation="0">
          <div class="summary-heading">
            <span>Total gastado</span>
            <v-icon color="error">mdi-trending-down</v-icon>
          </div>

          <h2>{{ dinero(totalGastado) }}</h2>
          <p>Gastos en categorías presupuestadas</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="summary-card" elevation="0">
          <div class="summary-heading">
            <span>Presupuesto disponible</span>
            <v-icon color="success">mdi-check-circle-outline</v-icon>
          </div>

          <h2 class="text-success">{{ dinero(disponibles) }}</h2>
          <p>Dinero restante de tus límites</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- LISTA DE PRESUPUESTOS -->
    <div class="section-heading">
      <div>
        <h2>Presupuestos por categoría</h2>
        <p>
          {{ presupuestosMes.length }}
          categorías configuradas para este mes
        </p>
      </div>
    </div>

    <v-row v-if="presupuestosMes.length">
      <v-col
        v-for="presupuesto in presupuestosMes"
        :key="presupuesto.category"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="budget-card" elevation="0">
          <div class="budget-top">
            <div class="category-info">
              <div
                class="category-icon"
                :style="{ background: presupuesto.color + '18' }"
              >
                <v-icon :color="presupuesto.color">
                  {{ presupuesto.icon }}
                </v-icon>
              </div>

              <div>
                <h3>{{ presupuesto.category }}</h3>
                <span>Presupuesto mensual</span>
              </div>
            </div>

            <v-btn
              icon="mdi-delete-outline"
              color="error"
              variant="text"
              size="small"
              @click="confirmarEliminar(presupuesto)"
            />
          </div>

          <div class="budget-amounts">
            <div>
              <span>Gastado</span>
              <h3>{{ dinero(presupuesto.gastado) }}</h3>
            </div>

            <div class="text-right">
              <span>Límite</span>
              <h3>{{ dinero(presupuesto.limit) }}</h3>
            </div>
          </div>

          <v-progress-linear
            :model-value="Math.min(presupuesto.porcentaje, 100)"
            :color="colorProgreso(presupuesto.porcentaje)"
            height="10"
            rounded
            class="mt-4"
          />

          <div class="progress-info">
            <span>
              {{ presupuesto.porcentaje.toFixed(0) }}% utilizado
            </span>

            <v-chip
              :color="colorProgreso(presupuesto.porcentaje)"
              size="small"
              variant="tonal"
            >
              {{ estadoPresupuesto(presupuesto.porcentaje) }}
            </v-chip>
          </div>

          <v-alert
            v-if="presupuesto.porcentaje >= 100"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            Has superado tu presupuesto por
            {{ dinero(presupuesto.gastado - presupuesto.limit) }}.
          </v-alert>

          <v-alert
            v-else-if="presupuesto.porcentaje >= 80"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            Estás cerca de alcanzar tu límite de gasto.
          </v-alert>

          <div class="budget-footer">
            <v-icon size="18" color="success">
              mdi-wallet-outline
            </v-icon>
            Disponible: {{ dinero(presupuesto.disponible) }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else class="empty-state" elevation="0">
      <v-icon size="65" color="grey-lighten-1">
        mdi-chart-donut
      </v-icon>

      <h3>Todavía no tienes presupuestos</h3>
      <p>
        Crea tu primer presupuesto y empieza a controlar tus gastos.
      </p>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        rounded="lg"
        @click="abrirFormulario"
      >
        Crear presupuesto
      </v-btn>
    </v-card>

    <!-- FORMULARIO -->
    <v-dialog v-model="dialog" max-width="490">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="dialog-title">
          <div>
            <h3>Nuevo presupuesto</h3>
            <p>Establece un límite mensual de gasto.</p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialog = false"
          />
        </v-card-title>

        <v-card-text>
          <v-form ref="form" @submit.prevent="guardar">
            <label>Categoría</label>
            <v-select
              v-model="categoria"
              :items="categorias"
              item-title="title"
              item-value="title"
              placeholder="Selecciona una categoría"
              prepend-inner-icon="mdi-shape-outline"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio]"
              class="mt-2 mb-2"
            />

            <label>Límite mensual (USD)</label>
            <v-text-field
              v-model="limite"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ej. 100"
              prepend-inner-icon="mdi-currency-usd"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio, limiteValido]"
              class="mt-2 mb-2"
            />

            <label>Mes</label>
            <v-text-field
              v-model="mes"
              type="month"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio]"
              class="mt-2 mb-3"
            />

            <v-alert
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-5"
            >
              Si ya existe un presupuesto para esta categoría
              y mes, se actualizará su límite.
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              rounded="lg"
              prepend-icon="mdi-content-save-outline"
            >
              Guardar presupuesto
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ELIMINAR -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card rounded="xl" class="delete-dialog">
        <v-icon size="48" color="error">
          mdi-delete-alert-outline
        </v-icon>

        <h3>¿Eliminar presupuesto?</h3>
        <p>
          Se eliminará el presupuesto de
          <strong>{{ presupuestoEliminar?.category }}</strong>.
          Tus gastos registrados no se eliminarán.
        </p>

        <div class="delete-actions">
          <v-btn
            variant="outlined"
            rounded="lg"
            @click="dialogEliminar = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            rounded="lg"
            @click="eliminar"
          >
            Eliminar
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- NOTIFICACIÓN -->
    <v-snackbar
      v-model="snackbar"
      :color="colorAlerta"
      location="top right"
      rounded="lg"
      :timeout="3500"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ mensaje }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.budgets-page {
  min-height: 100vh;
  background: #f6f8fc;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-header,
.summary-heading,
.budget-top,
.budget-amounts,
.progress-info,
.dialog-title,
.delete-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.page-header {
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
}

.page-header p,
.section-heading p {
  color: #64748b;
  margin-top: 7px;
  font-size: 14px;
}

.month-filter {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 1px solid #e9edf5;
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 28px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.month-filter input {
  border: none;
  outline: none;
  font: inherit;
  color: #2563eb;
}

.summary-card {
  padding: 26px;
  min-height: 170px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
  transition: transform 0.25s, box-shadow 0.25s;
}

.summary-card:hover,
.budget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 35px #0f172a12;
}

.summary-heading {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.summary-card h2 {
  font-size: 31px;
  font-weight: 800;
  margin-top: 24px;
  letter-spacing: -1px;
}

.summary-card p {
  margin-top: 10px;
  color: #94a3b8;
  font-size: 12px;
}

.gradient-card {
  background: linear-gradient(135deg, #2563eb, #4338ca, #7c3aed);
  color: white;
  border: none;
}

.gradient-card .summary-heading,
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

.budget-card {
  padding: 24px;
  border: 1px solid #e9edf5;
  border-radius: 20px;
  transition: transform 0.25s, box-shadow 0.25s;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-info h3 {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.category-info span,
.budget-amounts span {
  color: #94a3b8;
  font-size: 12px;
}

.budget-amounts {
  margin-top: 30px;
}

.budget-amounts h3 {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 5px;
}

.progress-info {
  margin-top: 13px;
  color: #64748b;
  font-size: 12px;
}

.budget-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #e9edf5;
  padding-top: 17px;
  margin-top: 20px;
  color: #64748b;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 65px 20px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
}

.empty-state h3 {
  font-size: 20px;
  margin-top: 15px;
  color: #334155;
}

.empty-state p {
  color: #94a3b8;
  margin: 10px 0 22px;
}

.dialog-card {
  padding: 12px;
}

.dialog-title {
  padding: 20px 20px 10px;
}

.dialog-title h3 {
  font-size: 21px;
  font-weight: 800;
}

.dialog-title p {
  font-size: 13px;
  color: #64748b;
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

  .summary-card h2 {
    font-size: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .summary-card,
  .budget-card {
    transition: none;
  }
}
</style>
