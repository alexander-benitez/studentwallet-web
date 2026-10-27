
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

const router = useRouter()
const finanzas = useFinanzasStore()

const busqueda = ref('')
const filtroTipo = ref('todos')
const filtroCategoria = ref('Todas')
const dialogEliminar = ref(false)
const movimientoSeleccionado = ref(null)
const snackbar = ref(false)

const tipos = [
  { title: 'Todos los movimientos', value: 'todos' },
  { title: 'Solo ingresos', value: 'income' },
  { title: 'Solo gastos', value: 'expense' },
]

const categorias = computed(() => [
  'Todas',
  ...new Set(
    finanzas.movimientos
      .map(m => m.category)
      .filter(Boolean)
  ),
])

const movimientosFiltrados = computed(() => {
  return finanzas.movimientos
    .filter(m => {
      const texto = `${m.name} ${m.category}`.toLowerCase()

      const coincideBusqueda = texto.includes(
        busqueda.value.toLowerCase()
      )

      const coincideTipo =
        filtroTipo.value === 'todos' ||
        m.type === filtroTipo.value

      const coincideCategoria =
        filtroCategoria.value === 'Todas' ||
        m.category === filtroCategoria.value

      return coincideBusqueda &&
        coincideTipo &&
        coincideCategoria
    })
    .sort((a, b) => b.date.localeCompare(a.date))
})

const dinero = valor =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)

function confirmarEliminar(movimiento) {
  movimientoSeleccionado.value = movimiento
  dialogEliminar.value = true
}

function eliminar() {
  if (!movimientoSeleccionado.value) return

  finanzas.eliminarMovimiento(
    movimientoSeleccionado.value.id
  )

  dialogEliminar.value = false
  movimientoSeleccionado.value = null
  snackbar.value = true
}
</script>

<template>
  <v-container fluid class="movements-page pa-4 pa-md-8">
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

        <h1>Mis movimientos</h1>
        <p>
          Consulta y administra todas tus transacciones financieras.
        </p>
      </div>

      <v-btn
        color="primary"
        rounded="lg"
        prepend-icon="mdi-view-dashboard-outline"
        @click="router.push('/dashboard')"
      >
        Dashboard
      </v-btn>
    </div>

    <!-- RESUMEN -->
    <v-row class="mt-5">
      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card balance-card" elevation="0">
          <div class="stat-heading">
            <span>Saldo disponible</span>
            <v-icon>mdi-wallet-outline</v-icon>
          </div>

          <h2>{{ dinero(finanzas.saldo) }}</h2>
          <p>Balance de tus movimientos</p>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-heading">
            <span>Total ingresos</span>
            <v-icon color="success">mdi-trending-up</v-icon>
          </div>

          <h2 class="text-success">
            {{ dinero(finanzas.ingresos) }}
          </h2>

          <p>Dinero recibido</p>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-heading">
            <span>Total gastos</span>
            <v-icon color="error">mdi-trending-down</v-icon>
          </div>

          <h2 class="text-error">
            {{ dinero(finanzas.gastos) }}
          </h2>

          <p>Dinero utilizado</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- HISTORIAL -->
    <v-card class="history-card mt-6" elevation="0">
      <div class="history-header">
        <div>
          <h3>Historial de transacciones</h3>
          <p>
            {{ movimientosFiltrados.length }}
            movimientos encontrados
          </p>
        </div>

        <v-chip color="primary" variant="tonal">
          <v-icon start>mdi-swap-horizontal</v-icon>
          {{ finanzas.movimientos.length }} registrados
        </v-chip>
      </div>

      <!-- FILTROS -->
      <div class="filters">
        <v-text-field
          v-model="busqueda"
          placeholder="Buscar por concepto o categoría..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details
          class="search-field"
          clearable
        />

        <v-select
          v-model="filtroTipo"
          :items="tipos"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details
          class="filter-field"
        />

        <v-select
          v-model="filtroCategoria"
          :items="categorias"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details
          class="filter-field"
        />
      </div>

      <!-- TABLA -->
      <v-table class="movements-table">
        <thead>
          <tr>
            <th>Movimiento</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th class="text-right">Monto</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="movimiento in movimientosFiltrados"
            :key="movimiento.id"
          >
            <td>
              <div class="movement-name">
                <v-avatar
                  :color="
                    movimiento.type === 'income'
                      ? 'success'
                      : 'error'
                  "
                  variant="tonal"
                  size="42"
                >
                  <v-icon>
                    {{
                      movimiento.type === 'income'
                        ? 'mdi-arrow-down-left'
                        : 'mdi-arrow-up-right'
                    }}
                  </v-icon>
                </v-avatar>

                <strong>{{ movimiento.name }}</strong>
              </div>
            </td>

            <td>
              <v-chip
                :color="
                  movimiento.type === 'income'
                    ? 'success'
                    : 'error'
                "
                variant="tonal"
                size="small"
              >
                {{
                  movimiento.type === 'income'
                    ? 'Ingreso'
                    : 'Gasto'
                }}
              </v-chip>
            </td>

            <td>{{ movimiento.category }}</td>

            <td>{{ movimiento.date }}</td>

            <td
              class="text-right font-weight-bold"
              :class="
                movimiento.type === 'income'
                  ? 'text-success'
                  : 'text-error'
              "
            >
              {{ movimiento.type === 'income' ? '+' : '-' }}
              {{ dinero(movimiento.amount) }}
            </td>

            <td class="text-center">
              <v-tooltip text="Eliminar movimiento">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-delete-outline"
                    color="error"
                    variant="text"
                    size="small"
                    @click="confirmarEliminar(movimiento)"
                  />
                </template>
              </v-tooltip>
            </td>
          </tr>

          <tr v-if="movimientosFiltrados.length === 0">
            <td colspan="6">
              <div class="empty-state">
                <v-icon size="60" color="grey-lighten-1">
                  mdi-text-box-search-outline
                </v-icon>

                <h3>No se encontraron movimientos</h3>
                <p>
                  Prueba con otros filtros o registra una transacción.
                </p>

                <v-btn
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  @click="router.push('/ingresos')"
                >
                  Registrar ingreso
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- CONFIRMACIÓN -->
    <v-dialog v-model="dialogEliminar" max-width="420">
      <v-card rounded="xl" class="delete-dialog">
        <div class="delete-icon">
          <v-icon size="32" color="error">
            mdi-delete-alert-outline
          </v-icon>
        </div>

        <h3>¿Eliminar movimiento?</h3>

        <p>
          Estás a punto de eliminar
          <strong>{{ movimientoSeleccionado?.name }}</strong>.
          Esta acción no se puede deshacer.
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
            prepend-icon="mdi-delete-outline"
            @click="eliminar"
          >
            Sí, eliminar
          </v-btn>
        </div>
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
      Movimiento eliminado correctamente
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.movements-page {
  min-height: 100vh;
  background: #f6f8fc;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

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
  color: #0f172a;
}

.page-header p,
.history-header p {
  color: #64748b;
  margin-top: 7px;
  font-size: 14px;
}

.stat-card {
  min-height: 180px;
  padding: 27px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
  transition: transform 0.25s, box-shadow 0.25s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px #0f172a12;
}

.stat-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.stat-card h2 {
  font-size: 32px;
  font-weight: 800;
  margin-top: 22px;
  letter-spacing: -1px;
}

.stat-card p {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 12px;
}

.balance-card {
  background: linear-gradient(135deg, #2563eb, #4338ca, #7c3aed);
  border: none;
  color: white;
}

.balance-card .stat-heading,
.balance-card p {
  color: white;
}

.history-card {
  border-radius: 20px;
  border: 1px solid #e9edf5;
  overflow: hidden;
}

.history-header {
  padding: 25px 25px 15px;
}

.history-header h3 {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 15px 25px 25px;
}

.search-field {
  flex: 2;
  min-width: 220px;
}

.filter-field {
  flex: 1;
  min-width: 170px;
}

.movement-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.movement-name strong {
  font-size: 13px;
  color: #334155;
}

.movements-table th {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}

.movements-table td {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

.empty-state {
  padding: 55px 20px;
  text-align: center;
}

.empty-state h3 {
  margin-top: 15px;
  color: #334155;
  font-size: 18px;
}

.empty-state p {
  margin: 10px 0 20px;
  color: #94a3b8;
}

.delete-dialog {
  padding: 30px;
  text-align: center;
}

.delete-icon {
  width: 70px;
  height: 70px;
  background: #fee2e2;
  border-radius: 20px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-dialog h3 {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.delete-dialog p {
  margin-top: 12px;
  color: #64748b;
  line-height: 1.7;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 25px;
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 25px;
  }

  .stat-card h2 {
    font-size: 27px;
  }

  .filters {
    flex-direction: column;
  }

  .search-field,
  .filter-field {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
}
</style>
