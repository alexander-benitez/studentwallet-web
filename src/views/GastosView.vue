
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

const router = useRouter()
const finanzas = useFinanzasStore()

const categoriasGastos = computed(() =>
  finanzas.categorias
    .filter(categoria => categoria.tipo === 'expense')
    .map(categoria => ({
      title: categoria.nombre,
      value: categoria.nombre,
    }))
)

const dialog = ref(false)
const form = ref(null)
const guardando = ref(false)
const snackbar = ref(false)
const busqueda = ref('')

const concepto = ref('')
const monto = ref(null)
const categoria = ref(null)
const fecha = ref(new Date().toLocaleDateString('en-CA'))
const descripcion = ref('')

const gastos = computed(() =>
  finanzas.movimientos
    .filter(m => m.type === 'expense')
    .filter(m =>
      `${m.name} ${m.category}`
        .toLowerCase()
        .includes(busqueda.value.toLowerCase())
    )
)

const dinero = valor =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)

const obligatorio = v =>
  !!String(v ?? '').trim() || 'Este campo es obligatorio'

const montoValido = v =>
  (Number.isFinite(Number(v)) && Number(v) > 0) ||
  'Ingresa un monto válido mayor a cero'

async function guardarGasto() {
  const resultado = await form.value.validate()

  if (!resultado.valid) return

  guardando.value = true

  finanzas.agregarMovimiento({
    name: concepto.value.trim(),
    amount: Number(monto.value),
    category: categoria.value,
    date: fecha.value,
    description: descripcion.value,
    type: 'expense',
    icon: 'mdi-cash-minus',
    color: 'error',
  })

  guardando.value = false
  dialog.value = false

  concepto.value = ''
  monto.value = null
  categoria.value = null
  descripcion.value = ''

  form.value.resetValidation()

  snackbar.value = true
}
</script>

<template>
  <v-container fluid class="expenses-page pa-4 pa-md-8">

    <!-- ENCABEZADO -->
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

        <h1>Mis gastos</h1>
        <p>Controla tus gastos y toma mejores decisiones financieras.</p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        rounded="lg"
        @click="dialog = true"
      >
        Nuevo gasto
      </v-btn>
    </div>

    <!-- RESUMEN -->
    <v-row class="mt-5">
      <v-col cols="12" md="6">
        <v-card class="summary-card gradient-card" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <span>Gastos acumulados</span>
            <v-icon size="28">mdi-cash-minus</v-icon>
          </div>

          <h2>{{ dinero(finanzas.gastos) }}</h2>

          <div class="summary-footer">
            <v-icon size="18">mdi-trending-down</v-icon>
            Total de dinero utilizado
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="summary-card" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <span>Saldo disponible</span>

            <v-avatar color="success" variant="tonal">
              <v-icon>mdi-wallet-outline</v-icon>
            </v-avatar>
          </div>

          <h2>{{ dinero(finanzas.saldo) }}</h2>

          <div class="summary-footer">
            Balance actual de tus finanzas
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- HISTORIAL -->
    <v-card class="history-card mt-6" elevation="0">
      <div class="history-header">
        <div>
          <h3>Historial de gastos</h3>
          <p>Consulta todos tus gastos registrados.</p>
        </div>

        <v-text-field
          v-model="busqueda"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar gastos..."
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          class="search-input"
        />
      </div>

      <v-table class="expenses-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th class="text-right">Monto</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="gasto in gastos" :key="gasto.id">
            <td>
              <div class="expense-name">
                <v-avatar color="error" variant="tonal" size="40">
                  <v-icon>mdi-arrow-up-right</v-icon>
                </v-avatar>

                <strong>{{ gasto.name }}</strong>
              </div>
            </td>

            <td>
              <v-chip color="error" variant="tonal" size="small">
                {{ gasto.category }}
              </v-chip>
            </td>

            <td>{{ gasto.date }}</td>

            <td class="text-right font-weight-bold text-error">
              -{{ dinero(gasto.amount) }}
            </td>
          </tr>

          <tr v-if="gastos.length === 0">
            <td colspan="4">
              <div class="empty-state">
                <v-icon size="58" color="grey-lighten-1">
                  mdi-receipt-text-outline
                </v-icon>

                <h3>No hay gastos para mostrar</h3>
                <p>Registra tu primer gasto o cambia la búsqueda.</p>

                <v-btn
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  @click="dialog = true"
                >
                  Agregar gasto
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- FORMULARIO DE GASTOS -->
    <v-dialog v-model="dialog" max-width="530">
      <v-card class="dialog-card" rounded="xl">
        <v-card-title class="dialog-title">
          <div>
            <h3>Registrar gasto</h3>
            <p>Agrega una nueva salida de dinero.</p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialog = false"
          />
        </v-card-title>

        <v-card-text>
          <v-form ref="form" @submit.prevent="guardarGasto">

            <label>Concepto</label>

            <v-text-field
              v-model="concepto"
              placeholder="Ej. Almuerzo universitario"
              prepend-inner-icon="mdi-text-box-outline"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio]"
              class="mt-2 mb-2"
            />

            <label>Monto (USD)</label>

            <v-text-field
              v-model="monto"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              prepend-inner-icon="mdi-currency-usd"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio, montoValido]"
              class="mt-2 mb-2"
            />

<!-- CATEGORÍA -->
<div class="form-field">
  <label>Categoría</label>

  <v-select
    v-model="categoria"
    :items="categoriasGastos"
    placeholder="Selecciona una categoría"
    prepend-inner-icon="mdi-shape-outline"
    variant="outlined"
    rounded="lg"
    :rules="[obligatorio]"
    class="mt-2"
  />

  <v-btn
    to="/categorias"
    variant="text"
    color="primary"
    size="small"
    prepend-icon="mdi-plus-circle-outline"
    class="category-button"
  >
    Administrar mis categorías
  </v-btn>
</div>

<!-- FECHA -->
<div class="form-field">
  <label>Fecha</label>

  <v-text-field
    v-model="fecha"
    type="date"
    variant="outlined"
    rounded="lg"
    :rules="[obligatorio]"
    class="mt-2"
  />
</div>

            <label>Descripción (opcional)</label>

            <v-textarea
              v-model="descripcion"
              placeholder="Detalles adicionales..."
              variant="outlined"
              rounded="lg"
              rows="2"
              class="mt-2"
            />

            <div class="dialog-actions">
              <v-btn
                variant="outlined"
                rounded="lg"
                @click="dialog = false"
              >
                Cancelar
              </v-btn>

              <v-btn
                type="submit"
                color="primary"
                rounded="lg"
                prepend-icon="mdi-content-save-outline"
                :loading="guardando"
              >
                Guardar gasto
              </v-btn>
            </div>

          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- NOTIFICACIÓN -->
    <v-snackbar
      v-model="snackbar"
      color="success"
      location="top right"
      rounded="lg"
      :timeout="3500"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      Gasto registrado correctamente
    </v-snackbar>

  </v-container>
</template>

<style scoped>
/* CONTENEDOR PRINCIPAL */

.expenses-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* ENCABEZADOS */

.page-header,
.history-header {
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

.page-header p,
.history-header p {
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 7px;
  font-size: 14px;
}

/* TARJETAS DE RESUMEN */

.summary-card {
  min-height: 190px;
  padding: 27px;
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  transition: transform 0.25s, box-shadow 0.25s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
}

.summary-card span {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
  font-weight: 600;
}

.summary-card h2 {
  font-size: 36px;
  font-weight: 800;
  margin-top: 22px;
  color: rgb(var(--v-theme-on-surface));
}

.summary-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 13px;
}

/* TARJETA DE GRADIENTE */

.gradient-card {
  background: linear-gradient(135deg, #2563eb, #4338ca, #7c3aed);
  border: none;
  color: white;
}

.gradient-card span,
.gradient-card h2,
.gradient-card .summary-footer {
  color: white !important;
}

/* HISTORIAL */

.history-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 20px;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.history-header {
  padding: 26px;
}

.history-header h3 {
  font-size: 19px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.search-input {
  max-width: 270px;
}

/* TABLA */

.expenses-table {
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
}

.expenses-table :deep(th) {
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 700;
  white-space: nowrap;
}

.expenses-table :deep(td) {
  color: rgb(var(--v-theme-on-surface));
}

.expenses-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.04);
}

.expense-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expense-name strong {
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
}

/* ESTADO VACÍO */

.empty-state {
  padding: 55px 20px;
  text-align: center;
}

.empty-state h3 {
  margin-top: 15px;
  font-size: 18px;
  color: rgb(var(--v-theme-on-surface));
}

.empty-state p {
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 10px 0 20px;
}

/* DIÁLOGO */

.dialog-card {
  padding: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px;
  color: rgb(var(--v-theme-on-surface));
}

.dialog-title h3 {
  font-size: 21px;
  font-weight: 800;
}

.dialog-title p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 5px;
}

.dialog-card label {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

/* ACCIONES DEL FORMULARIO */

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
}

/* RESPONSIVE */

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 25px;
  }

  .summary-card h2 {
    font-size: 29px;
  }

  .search-input {
    max-width: 100%;
    width: 100%;
  }

  .history-header {
    padding: 20px;
  }

  .dialog-actions {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .summary-card {
    transition: none;
  }

  .summary-card:hover {
    transform: none;
  }
  /* ORGANIZACIÓN DE CAMPOS DEL FORMULARIO */

.form-field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.form-field label {
  display: block;
  width: 100%;
  text-align: left;
}

.category-button {
  align-self: flex-start;
  margin-top: -8px;
  margin-bottom: 18px;
  padding-left: 0;
}
}
</style>
