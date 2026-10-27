
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

const router = useRouter()
const finanzas = useFinanzasStore()
const categoriasIngresos = computed(() =>
  finanzas.categorias
    .filter(categoria => categoria.tipo === 'income')
    .map(categoria => ({
      title: categoria.nombre,
      value: categoria.nombre,
    }))
)
const form = ref(null)
const concepto = ref('')
const monto = ref(null)
const categoria = ref(null)
const fecha = ref(new Date().toLocaleDateString('en-CA'))
const descripcion = ref('')

const dialog = ref(false)
const snackbar = ref(false)
const mensaje = ref('')
const guardando = ref(false)
const busqueda = ref('')

const categorias = [
  'Beca estudiantil',
  'Salario',
  'Trabajo freelance',
  'Apoyo familiar',
  'Ventas',
  'Otros',
]

const ingresos = computed(() =>
  finanzas.movimientos
    .filter(m => m.type === 'income')
    .filter(m =>
      `${m.name} ${m.category}`
        .toLowerCase()
        .includes(busqueda.value.toLowerCase())
    )
)

const totalIngresos = computed(() => finanzas.ingresos)

const formatoDinero = (valor) =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)

const obligatorio = v => !!v || 'Este campo es obligatorio'
const montoValido = v =>
  (Number.isFinite(Number(v)) && Number(v) > 0) ||
  'Ingresa un monto mayor a cero'

function limpiarFormulario() {
  concepto.value = ''
  monto.value = null
  categoria.value = null
  fecha.value = new Date().toLocaleDateString('en-CA')
  descripcion.value = ''
  form.value?.resetValidation()
}

async function guardarIngreso() {
  const resultado = await form.value.validate()

  if (!resultado.valid) return

  guardando.value = true

  finanzas.agregarMovimiento({
    name: concepto.value.trim(),
    category: categoria.value,
    amount: Number(monto.value),
    type: 'income',
    date: fecha.value,
    description: descripcion.value,
    icon: 'mdi-cash-plus',
    color: 'success',
  })

  guardando.value = false
  dialog.value = false
  limpiarFormulario()

  mensaje.value = 'Ingreso registrado correctamente'
  snackbar.value = true
}
</script>

<template>
  <v-container fluid class="income-page pa-4 pa-md-8">
    <div class="page-header">
      <div>
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          color="primary"
          class="mb-3"
          @click="router.push('/dashboard')"
        >
          Volver al Dashboard
        </v-btn>

        <h1>Mis ingresos</h1>
        <p>Administra el dinero que recibes y controla tus finanzas.</p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        rounded="lg"
        @click="dialog = true"
      >
        Nuevo ingreso
      </v-btn>
    </div>

    <v-row class="mt-5">
      <v-col cols="12" md="6">
        <v-card class="summary-card gradient-card" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <span>Ingresos acumulados</span>
            <v-icon size="28">mdi-cash-multiple</v-icon>
          </div>

          <h2>{{ formatoDinero(totalIngresos) }}</h2>

          <div class="summary-footer">
            <v-icon size="18">mdi-trending-up</v-icon>
            Total de dinero recibido
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="summary-card" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <span>Ingresos registrados</span>

            <v-avatar color="success" variant="tonal">
              <v-icon>mdi-receipt-text-check-outline</v-icon>
            </v-avatar>
          </div>

          <h2>{{ ingresos.length }}</h2>

          <div class="summary-footer text-success">
            <v-icon size="18">mdi-check-circle-outline</v-icon>
            Movimientos encontrados
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="history-card mt-6" elevation="0">
      <div class="history-header">
        <div>
          <h3>Historial de ingresos</h3>
          <p>Todos los ingresos que has registrado.</p>
        </div>

        <v-text-field
          v-model="busqueda"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar ingresos..."
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          class="search-input"
        />
      </div>

      <v-table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th class="text-right">Monto</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="ingreso in ingresos" :key="ingreso.id">
            <td>
              <div class="income-name">
                <v-avatar color="success" variant="tonal" size="40">
                  <v-icon>mdi-arrow-down-left</v-icon>
                </v-avatar>
                <strong>{{ ingreso.name }}</strong>
              </div>
            </td>

            <td>
              <v-chip color="primary" variant="tonal" size="small">
                {{ ingreso.category }}
              </v-chip>
            </td>

            <td>{{ ingreso.date }}</td>

            <td class="text-right font-weight-bold text-success">
              +{{ formatoDinero(ingreso.amount) }}
            </td>
          </tr>

          <tr v-if="ingresos.length === 0">
            <td colspan="4">
              <div class="empty-state">
                <v-icon size="58" color="grey-lighten-1">
                  mdi-cash-remove
                </v-icon>
                <h3>No hay ingresos para mostrar</h3>
                <p>Registra tu primer ingreso o cambia la búsqueda.</p>

                <v-btn
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  @click="dialog = true"
                >
                  Agregar ingreso
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- FORMULARIO -->
    <v-dialog v-model="dialog" max-width="530">
      <v-card class="dialog-card" rounded="xl">
        <v-card-title class="dialog-title">
          <div>
            <h3>Registrar ingreso</h3>
            <p>Agrega una nueva entrada de dinero.</p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialog = false"
          />
        </v-card-title>

        <v-card-text>
          <v-form ref="form" @submit.prevent="guardarIngreso">
            <label>Concepto</label>
            <v-text-field
              v-model="concepto"
              placeholder="Ej. Pago de trabajo"
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

            <label>Categoría</label>
            <v-select
              v-model="categoria"
              :items="categoriasIngresos"
              placeholder="Selecciona una categoría"
              prepend-inner-icon="mdi-shape-outline"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio]"
              class="mt-2 mb-2"
            />

            <v-btn
  to="/categorias"
  variant="text"
  color="primary"
  size="small"
  prepend-icon="mdi-plus-circle-outline"
  class="mb-4"
>
  Administrar mis categorías
</v-btn>

            <label>Fecha</label>
            <v-text-field
              v-model="fecha"
              type="date"
              variant="outlined"
              rounded="lg"
              :rules="[obligatorio]"
              class="mt-2 mb-2"
            />

            <label>Descripción (opcional)</label>
            <v-textarea
              v-model="descripcion"
              placeholder="Agrega detalles sobre este ingreso..."
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
                Guardar ingreso
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar"
      color="success"
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
.income-page {
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

.summary-card {
  min-height: 190px;
  padding: 27px;
  border-radius: 20px;
  border: 1px solid #e9edf5;
  transition: transform 0.25s, box-shadow 0.25s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px #0f172a12;
}

.summary-card span {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.summary-card h2 {
  font-size: 36px;
  font-weight: 800;
  margin-top: 22px;
  color: #0f172a;
}

.summary-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: #64748b;
  font-size: 13px;
}

.gradient-card {
  background: linear-gradient(135deg, #2563eb, #4338ca, #7c3aed);
  border: none;
  color: white;
}

.gradient-card span,
.gradient-card h2,
.gradient-card .summary-footer {
  color: white;
}

.history-card {
  border: 1px solid #e9edf5;
  border-radius: 20px;
  overflow: hidden;
}

.history-header {
  padding: 26px;
}

.history-header h3 {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
}

.search-input {
  max-width: 270px;
}

.income-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.income-name strong {
  color: #334155;
  font-size: 13px;
}

.empty-state {
  padding: 55px 20px;
  text-align: center;
}

.empty-state h3 {
  margin-top: 15px;
  font-size: 18px;
  color: #334155;
}

.empty-state p {
  color: #94a3b8;
  margin: 10px 0 20px;
}

.dialog-card {
  padding: 12px;
}

.dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 25px;
  }

  .summary-card h2 {
    font-size: 29px;
  }

  .search-input {
    max-width: 100%;
  }
}
</style>
