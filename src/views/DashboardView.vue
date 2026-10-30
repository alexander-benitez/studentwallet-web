<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

const router = useRouter()
const finanzas = useFinanzasStore()
const search = ref('')

const transactions = computed(() => finanzas.movimientos)
const income = computed(() => finanzas.ingresos)
const expenses = computed(() => finanzas.gastos)
const balance = computed(() => finanzas.saldo)

const filteredTransactions = computed(() =>
  transactions.value.filter((t) =>
    `${t.name || ''} ${t.category || ''}`
      .toLowerCase()
      .includes(search.value.toLowerCase())
  )
)

const money = (value) =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0)
</script>

<template>
  <div class="dashboard-content">
    <!-- BIENVENIDA -->
    <div class="welcome-section">
      <div>
        <div class="welcome-badge">
          <v-icon size="16">mdi-sparkles</v-icon>
          Tu espacio financiero
        </div>
        <h1>¡Hola, {{ finanzas.nombreCompleto }}! 👋</h1>
        <p>
          Aquí tienes un resumen de tus finanzas.
          Sigue avanzando hacia tus metas.
        </p>
      </div>
      <v-btn
        color="primary"
        rounded="lg"
        size="large"
        prepend-icon="mdi-plus"
        elevation="0"
        @click="router.push('/ingresos')"
      >
        Nuevo ingreso
      </v-btn>
    </div>

    <!-- TARJETAS FINANCIERAS -->
    <v-row class="mt-5">
      <v-col cols="12" md="4">
        <v-card class="finance-card balance-card" elevation="0">
          <div class="card-top">
            <span>Saldo disponible</span>
            <v-icon>mdi-wallet-outline</v-icon>
          </div>
          <h2>{{ money(balance) }}</h2>
          <div class="card-footer">
            <v-icon size="16">mdi-check-circle</v-icon>
            Balance actual
          </div>
          <div class="card-decoration"></div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="finance-card" elevation="0">
          <div class="card-top">
            <span>Ingresos totales</span>
            <div class="stat-icon income-icon">
              <v-icon>mdi-arrow-down-left</v-icon>
            </div>
          </div>
          <h2>{{ money(income) }}</h2>
          <div class="card-footer text-success">
            <v-icon size="16">mdi-trending-up</v-icon>
            Dinero recibido
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="finance-card" elevation="0">
          <div class="card-top">
            <span>Gastos totales</span>
            <div class="stat-icon expense-icon">
              <v-icon>mdi-arrow-up-right</v-icon>
            </div>
          </div>
          <h2>{{ money(expenses) }}</h2>
          <div class="card-footer text-error">
            <v-icon size="16">mdi-trending-down</v-icon>
            Dinero utilizado
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- MOVIMIENTOS -->
    <v-card class="transactions-card mt-7" elevation="0">
      <div class="section-header">
        <div>
          <h3>Movimientos recientes</h3>
          <p>Consulta tus últimas transacciones.</p>
        </div>
        <v-text-field
          v-model="search"
          placeholder="Buscar movimiento..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          rounded="lg"
          class="search-field"
        />
      </div>

      <v-table class="transactions-table">
        <thead>
          <tr>
            <th>Movimiento</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th class="text-right">Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
          >
            <td>
              <div class="transaction-name">
                <v-avatar
                  :color="transaction.type === 'income' ? 'success' : 'error'"
                  variant="tonal"
                  size="42"
                >
                  <v-icon>
                    {{ transaction.type === 'income' ? 'mdi-arrow-down-left' : 'mdi-arrow-up-right' }}
                  </v-icon>
                </v-avatar>
                <strong>{{ transaction.name }}</strong>
              </div>
            </td>
            <td>
              <v-chip size="small" variant="tonal">
                {{ transaction.category }}
              </v-chip>
            </td>
            <td>{{ transaction.date }}</td>
            <td
              class="text-right font-weight-bold"
              :class="transaction.type === 'income' ? 'text-success' : 'text-error'"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ money(transaction.amount) }}
            </td>
          </tr>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="4" class="text-center py-8">
              No se encontraron movimientos.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<style scoped>

/* =========================================
   ESTRUCTURA GENERAL
========================================= */

.dashboard-content {
  max-width: 1450px;
  margin: auto;
  padding: 35px;
  color: rgb(var(--v-theme-on-background));
}

/* =========================================
   BIENVENIDA
========================================= */

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.welcome-section h1 {
  font-size: 29px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-background));
  letter-spacing: -1px;
  margin-top: 12px;
}

.welcome-section p {
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 8px;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  background: rgba(var(--v-theme-primary), 0.13);
  color: rgb(var(--v-theme-primary));
  border-radius: 30px;
  font-size: 12px;
  font-weight: 700;
}

/* =========================================
   TARJETAS FINANCIERAS
========================================= */

.finance-card {
  position: relative;
  padding: 25px;
  min-height: 180px;
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  transition: transform 0.25s, box-shadow 0.25s;
  overflow: hidden;
}

.finance-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
  font-weight: 600;
}

.finance-card h2 {
  font-size: 32px;
  font-weight: 800;
  margin-top: 23px;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -1px;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  margin-top: 16px;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* =========================================
   TARJETA DE SALDO
   Conserva el degradado original
========================================= */

.balance-card {
  background: linear-gradient(
    135deg,
    #2563eb,
    #4338ca,
    #7c3aed
  );
  color: white;
  border: none;
}

.balance-card .card-top,
.balance-card h2,
.balance-card .card-footer {
  color: white;
}

.card-decoration {
  position: absolute;
  width: 180px;
  height: 180px;
  right: -70px;
  bottom: -100px;
  border: 30px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

/* =========================================
   ICONOS DE INGRESOS Y GASTOS
========================================= */

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.income-icon {
  background: rgba(var(--v-theme-success), 0.15);
  color: rgb(var(--v-theme-success));
}

.expense-icon {
  background: rgba(var(--v-theme-error), 0.15);
  color: rgb(var(--v-theme-error));
}

/* =========================================
   TARJETA DE MOVIMIENTOS
========================================= */

.transactions-card {
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
}

.section-header {
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.section-header p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 5px;
}

.search-field {
  max-width: 260px;
}

/* =========================================
   TABLA DE MOVIMIENTOS
========================================= */

.transactions-table {
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
}

.transactions-table :deep(table) {
  background: transparent;
}

.transactions-table th {
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 700;
  white-space: nowrap;
}

.transactions-table td {
  padding-top: 13px !important;
  padding-bottom: 13px !important;
  color: rgb(var(--v-theme-on-surface-variant));
}

.transactions-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.06);
}

.transaction-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.transaction-name strong {
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 600px) {
  .dashboard-content {
    padding: 18px;
  }

  .welcome-section h1 {
    font-size: 24px;
  }

  .finance-card h2 {
    font-size: 27px;
  }

  .search-field {
    max-width: 100%;
    width: 100%;
  }

  .section-header {
    padding: 20px;
  }

  .transactions-card {
    overflow-x: auto;
  }

  .transactions-table {
    min-width: 600px;
  }
}

/* =========================================
   MOVIMIENTO REDUCIDO
========================================= */

@media (prefers-reduced-motion: reduce) {
  .finance-card {
    transition: none;
  }
}

</style>
