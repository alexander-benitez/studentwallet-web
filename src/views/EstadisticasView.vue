

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

import { Bar, Doughnut } from 'vue-chartjs'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
)

const router = useRouter()
const finanzas = useFinanzasStore()

const anioSeleccionado = ref(new Date().getFullYear())

const nombresMeses = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

const dinero = valor =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)

// GRÁFICO: INGRESOS VS GASTOS
const datosBarras = computed(() => {
  const ingresos = Array(12).fill(0)
  const gastos = Array(12).fill(0)

  finanzas.movimientos.forEach(m => {
    if (!m.date) return

    const partes = m.date.split('-')
    const anio = Number(partes[0])
    const mes = Number(partes[1]) - 1
    const monto = Number(m.amount)

    if (
      anio !== anioSeleccionado.value ||
      mes < 0 ||
      mes > 11 ||
      !Number.isFinite(monto)
    ) return

    if (m.type === 'income') ingresos[mes] += monto
    if (m.type === 'expense') gastos[mes] += monto
  })

  return {
    labels: nombresMeses,
    datasets: [
      {
        label: 'Ingresos',
        data: ingresos,
        backgroundColor: '#10B981',
        borderRadius: 8,
        maxBarThickness: 35,
      },
      {
        label: 'Gastos',
        data: gastos,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        maxBarThickness: 35,
      },
    ],
  }
})

// GRÁFICO: GASTOS POR CATEGORÍA
const datosCategorias = computed(() => {
  const totales = {}

  finanzas.movimientos.forEach(m => {
    if (
      m.type !== 'expense' ||
      !m.date?.startsWith(String(anioSeleccionado.value))
    ) return

    const categoria = m.category || 'Otros'
    const monto = Number(m.amount)

    if (!Number.isFinite(monto)) return

    totales[categoria] = (totales[categoria] || 0) + monto
  })

  return {
    labels: Object.keys(totales),
    datasets: [
      {
        data: Object.values(totales),
        backgroundColor: [
          '#2563EB',
          '#7C3AED',
          '#10B981',
          '#F59E0B',
          '#EC4899',
          '#06B6D4',
          '#64748B',
        ],
        borderWidth: 3,
        borderColor: '#FFFFFF',
        hoverOffset: 10,
      },
    ],
  }
})

const opcionesBarras = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: context =>
          `${context.dataset.label}: ${dinero(context.parsed.y)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: valor => `$${valor}`,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

const opcionesCategorias = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom',
    },
    tooltip: {
      callbacks: {
        label: context =>
          `${context.label}: ${dinero(context.parsed)}`,
      },
    },
  },
}

const hayGastos = computed(() =>
  datosCategorias.value.datasets[0].data.some(valor => valor > 0)
)
</script>


<template>
  <v-container fluid class="statistics-page pa-4 pa-md-8">
    <v-btn
      color="primary"
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      @click="router.push('/dashboard')"
    >
      Volver al Dashboard
    </v-btn>

    <h1>Estadísticas financieras</h1>
    <p class="subtitle">
      Analiza tus ingresos, gastos y hábitos financieros.
    </p>

    <v-row class="mt-5">
      <v-col cols="12" md="4">
        <v-card class="stat-card" elevation="0">
          <v-icon color="success" size="30">
            mdi-trending-up
          </v-icon>
          <p>Total de ingresos</p>
          <h2 class="text-success">
            {{ dinero(finanzas.ingresos) }}
          </h2>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="stat-card" elevation="0">
          <v-icon color="error" size="30">
            mdi-trending-down
          </v-icon>
          <p>Total de gastos</p>
          <h2 class="text-error">
            {{ dinero(finanzas.gastos) }}
          </h2>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="stat-card balance-card" elevation="0">
          <v-icon size="30">mdi-wallet-outline</v-icon>
          <p>Balance disponible</p>
          <h2>{{ dinero(finanzas.saldo) }}</h2>
        </v-card>
      </v-col>
    </v-row>

    
<!-- FILTRO POR AÑO -->
<div class="charts-header">
  <div>
    <h2>Análisis de movimientos</h2>
    <p>Visualiza cómo evolucionan tus finanzas.</p>
  </div>

  <div class="year-selector">
    <v-icon color="primary">mdi-calendar</v-icon>
    <input
      v-model.number="anioSeleccionado"
      type="number"
      min="2000"
      max="2100"
    />
  </div>
</div>

<!-- GRÁFICOS -->
<v-row class="mt-2">
  <v-col cols="12" lg="8">
    <v-card class="chart-card" elevation="0">
      <div class="chart-heading">
        <div>
          <h3>Ingresos vs. gastos</h3>
          <p>Comparación mensual de tus movimientos</p>
        </div>

        <v-icon color="primary" size="28">
          mdi-chart-bar
        </v-icon>
      </div>

      <div class="chart-container">
        <Bar
          :data="datosBarras"
          :options="opcionesBarras"
        />
      </div>
    </v-card>
  </v-col>

  <v-col cols="12" lg="4">
    <v-card class="chart-card" elevation="0">
      <div class="chart-heading">
        <div>
          <h3>Gastos por categoría</h3>
          <p>Distribución de tu dinero</p>
        </div>

        <v-icon color="primary" size="28">
          mdi-chart-donut
        </v-icon>
      </div>

      <div v-if="hayGastos" class="chart-container">
        <Doughnut
          :data="datosCategorias"
          :options="opcionesCategorias"
        />
      </div>

      <div v-else class="chart-empty">
        <v-icon size="55" color="grey-lighten-1">
          mdi-chart-donut
        </v-icon>
        <p>No hay gastos registrados para este año.</p>
      </div>
    </v-card>
  </v-col>
</v-row>

  </v-container>
</template>

<style scoped>
.statistics-page {
  min-height: 100vh;
  background: #f6f8fc;
}

.statistics-page h1 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
}

.subtitle {
  color: #64748b;
  margin-top: 8px;
}

.stat-card {
  padding: 26px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
  min-height: 170px;
}

.stat-card p {
  color: #64748b;
  margin-top: 18px;
  font-size: 14px;
}

.stat-card h2 {
  margin-top: 8px;
  font-size: 30px;
  font-weight: 800;
}

.balance-card {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  border: none;
}

.balance-card p {
  color: white;
}

.placeholder-card {
  border-radius: 20px;
  padding: 60px 20px;
  text-align: center;
  border: 1px solid #e9edf5;
}

.placeholder-card h3 {
  margin-top: 15px;
  font-size: 21px;
  color: #0f172a;
}

.placeholder-card p {
  color: #64748b;
  margin-top: 10px;
}

@media (max-width: 600px) {
  .statistics-page h1 {
    font-size: 25px;
  }

  .stat-card h2 {
    font-size: 26px;
  }
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 35px;
}

.charts-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.charts-header p {
  font-size: 14px;
  color: #64748b;
  margin-top: 7px;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: white;
  border: 1px solid #e9edf5;
  border-radius: 12px;
}

.year-selector input {
  width: 75px;
  border: none;
  outline: none;
  color: #2563eb;
  font-weight: 700;
}

.chart-card {
  padding: 26px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
  height: 100%;
}

.chart-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
}

.chart-heading h3 {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.chart-heading p {
  font-size: 13px;
  color: #64748b;
  margin-top: 7px;
}

.chart-container {
  height: 350px;
  position: relative;
}

.chart-empty {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #94a3b8;
  text-align: center;
}

@media (max-width: 600px) {
  .chart-card {
    padding: 18px;
  }

  .chart-container {
    height: 300px;
  }
}

</style>
