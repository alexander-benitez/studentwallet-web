
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
)

const theme = useTheme()

const resumenMensual = ref([])

const categorias = ref([])

const totalIngresos = computed(() =>
  resumenMensual.value.reduce(
    (total, item) => total + Number(item.ingresos || 0),
    0
  )
)

const totalGastos = computed(() =>
  resumenMensual.value.reduce(
    (total, item) => total + Number(item.gastos || 0),
    0
  )
)

const balance = computed(() =>
  totalIngresos.value - totalGastos.value
)

const porcentajeAhorro = computed(() =>
  totalIngresos.value > 0
    ? (balance.value / totalIngresos.value) * 100
    : 0
)

const graficoBarras = computed(() => ({
  labels: resumenMensual.value.map(item => item.mes),
  datasets: [
    {
      label: 'Ingresos',
      data: resumenMensual.value.map(item => item.ingresos),
      backgroundColor: '#2563EB',
      borderRadius: 7,
      maxBarThickness: 24,
    },
    {
      label: 'Gastos',
      data: resumenMensual.value.map(item => item.gastos),
      backgroundColor: '#7C3AED',
      borderRadius: 7,
      maxBarThickness: 24,
    },
  ],
}))

const graficoCategorias = computed(() => ({
  labels: categorias.value.map(item => item.name),
  datasets: [
    {
      data: categorias.value.map(item => item.amount),
      backgroundColor: categorias.value.map(item => item.color),
      borderColor: theme.current.value.dark ? '#111C2E' : '#FFFFFF',
      borderWidth: 2,
      hoverOffset: 8,
    },
  ],
}))

const opcionesBarras = computed(() => {
  const esOscuro = theme.current.value.dark
  const colorTexto = esOscuro ? '#CBD5E1' : '#64748B'
  const colorCuadricula = esOscuro ? '#263449' : '#E2E8F0'

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colorTexto,
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: esOscuro ? '#263449' : '#FFFFFF',
        titleColor: esOscuro ? '#F1F5F9' : '#111827',
        bodyColor: esOscuro ? '#CBD5E1' : '#64748B',
        borderColor: colorCuadricula,
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: colorTexto,
          callback: value => '$' + value.toLocaleString(),
        },
        grid: {
          color: colorCuadricula,
        },
      },
      x: {
        ticks: {
          color: colorTexto,
        },
        grid: {
          display: false,
        },
      },
    },
  }
})

const opcionesCategorias = computed(() => {
  const esOscuro = theme.current.value.dark
  const colorTexto = esOscuro ? '#CBD5E1' : '#64748B'

  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: colorTexto,
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: esOscuro ? '#263449' : '#FFFFFF',
        titleColor: esOscuro ? '#F1F5F9' : '#111827',
        bodyColor: esOscuro ? '#CBD5E1' : '#64748B',
      },
    },
  }
})

onMounted(async () => {
  try {
    const token = localStorage.getItem('auth_token')
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

    const response = await fetch(`${API_BASE}/admin/reports`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    const json = await response.json()

    if (response.ok && json.data) {
      resumenMensual.value = json.data.monthly ?? []
      categorias.value = json.data.categories ?? []
    }
  } catch (error) {
    console.error('Error al cargar finanzas administrativas:', error)
  }
})

function dinero(valor) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)
}
</script>


<template>
  <div class="finanzas-admin">
    <div class="page-header">
      <div>
        <v-chip color="primary" variant="tonal" class="mb-3">
          Administración
        </v-chip>

        <h1>Supervisión financiera</h1>

        <p>
          Visualiza indicadores financieros generales
          y tendencias de la plataforma.
        </p>
      </div>

      <v-chip color="info" variant="tonal">
        Módulo en integración con API (Sprint 4)
      </v-chip>
    </div>

    <!-- INDICADORES -->
    <v-row class="mt-5">
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon blue">
            <v-icon color="primary" size="26">
              mdi-trending-up
            </v-icon>
          </div>

          <p>Ingresos registrados</p>
          <h2>{{ dinero(totalIngresos) }}</h2>

          <span>Acumulado del período</span>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon purple">
            <v-icon color="#7C3AED" size="26">
              mdi-trending-down
            </v-icon>
          </div>

          <p>Gastos registrados</p>
          <h2>{{ dinero(totalGastos) }}</h2>

          <span>Acumulado del período</span>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon green">
            <v-icon color="success" size="26">
              mdi-wallet-outline
            </v-icon>
          </div>

          <p>Balance general</p>
          <h2>{{ dinero(balance) }}</h2>

          <span>Ingresos menos gastos</span>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon orange">
            <v-icon color="warning" size="26">
              mdi-piggy-bank-outline
            </v-icon>
          </div>

          <p>Tasa de ahorro estimada</p>
          <h2>{{ porcentajeAhorro.toFixed(1) }}%</h2>

          <span>Sobre los ingresos registrados</span>
        </v-card>
      </v-col>
    </v-row>

    <!-- GRÁFICOS -->
    <v-row class="mt-2">
      <v-col cols="12" lg="8">
        <v-card class="chart-card" elevation="0">
          <div class="section-heading">
            <div>
              <h2>Ingresos vs. gastos</h2>
              <p>Comparación mensual de datos agregados</p>
            </div>

            <v-icon color="primary">
              mdi-chart-bar
            </v-icon>
          </div>

          <div class="chart-area">
            <Bar
              :data="graficoBarras"
              :options="opcionesBarras"
            />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="chart-card" elevation="0">
          <div class="section-heading">
            <div>
              <h2>Gastos por categoría</h2>
              <p>Distribución de ejemplo</p>
            </div>

            <v-icon color="#7C3AED">
              mdi-chart-donut
            </v-icon>
          </div>

          <div class="chart-area">
            <Doughnut
              :data="graficoCategorias"
              :options="opcionesCategorias"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- RESUMEN MENSUAL -->
    <v-card class="table-card mt-5" elevation="0">
      <div class="section-heading">
        <div>
          <h2>Resumen financiero mensual</h2>
          <p>Indicadores en integración con API</p>
        </div>

        <v-icon color="primary">
          mdi-table-large
        </v-icon>
      </div>

      <v-table class="mt-4">
        <thead>
          <tr>
            <th>Mes</th>
            <th class="text-right">Ingresos</th>
            <th class="text-right">Gastos</th>
            <th class="text-right">Balance</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in resumenMensual"
            :key="item.mes"
          >
            <td>
              <strong>{{ item.mes }}</strong>
            </td>

            <td class="text-right positive">
              {{ dinero(item.ingresos) }}
            </td>

            <td class="text-right negative">
              {{ dinero(item.gastos) }}
            </td>

            <td class="text-right">
              <strong>
                {{ dinero(item.ingresos - item.gastos) }}
              </strong>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-alert
      class="mt-5"
      type="info"
      variant="tonal"
      rounded="lg"
    >
      Este panel utiliza información ficticia para demostrar
      cómo funcionaría la supervisión financiera.
      No muestra datos privados de estudiantes.
    </v-alert>
  </div>
</template>

<style scoped>

.finanzas-admin {
  min-height: 100vh;
  padding: 32px;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-background));
  letter-spacing: -1px;
}

.page-header p {
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 8px;
}

.stat-card,
.chart-card,
.table-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  border-radius: 18px;
  padding: 24px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.blue {
  background: rgba(var(--v-theme-primary), 0.14);
}

.purple {
  background: rgba(124, 58, 237, 0.14);
}

.green {
  background: rgba(var(--v-theme-success), 0.14);
}

.orange {
  background: rgba(var(--v-theme-warning), 0.16);
}

.stat-card p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.stat-card h2 {
  font-size: 25px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  margin-top: 9px;
}

.stat-card span {
  display: block;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 8px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-heading h2 {
  font-size: 18px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.section-heading p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 5px;
}

.chart-area {
  height: 320px;
  position: relative;
}

.positive {
  color: rgb(var(--v-theme-success));
}

.negative {
  color: rgb(var(--v-theme-error));
}

/* Tabla */
.table-card :deep(.v-table) {
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
}

.table-card :deep(th) {
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 700;
  white-space: nowrap;
}

.table-card :deep(td) {
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

.table-card :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

/* Alerta informativa */
.finanzas-admin :deep(.v-alert) {
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 600px) {
  .finanzas-admin {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .stat-card,
  .chart-card,
  .table-card {
    padding: 18px;
  }

  .chart-area {
    height: 270px;
  }
}

</style>
