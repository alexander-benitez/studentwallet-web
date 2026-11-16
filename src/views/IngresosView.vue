<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useFinanzasStore } from '@/stores/finanzas'

  const route = useRoute()
  const router = useRouter()
  const finanzas = useFinanzasStore()

  onMounted(async () => {
    await Promise.all([
      finanzas?.cargarCategorias(),
      finanzas?.cargarMovimientos(),
      finanzas?.cargarBalance(),
    ])
    if (route.query.nuevo === '1') {
      dialog.value = true
    }
  })

  const tipoMovimiento = ref('ingreso')

  const categoriasMovimiento = computed(() =>
    (finanzas?.categorias || [])
      .filter(categoria => (categoria.type ?? categoria.tipo) === tipoMovimiento.value)
      .map(categoria => ({
        title: categoria.name ?? categoria.nombre,
        value: categoria.id,
      })),
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

  const ingresos = computed(() =>
    (finanzas?.movimientos || [])
      .filter(m => m.type === 'ingreso')
      .filter(m =>
        `${m.description} ${m.category?.name}`
          .toLowerCase()
          .includes(busqueda.value.toLowerCase()),
      ),
  )

  const totalIngresos = computed(() => finanzas?.ingresos)

  function formatoDinero (valor) {
    return new Intl.NumberFormat('es-SV', {
      style: 'currency',
      currency: 'USD',
    }).format(valor)
  }

  function obligatorio (v) {
    return !!String(v ?? '').trim() || 'Este campo es obligatorio'
  }

  function montoValido (v) {
    return (Number.isFinite(Number(v)) && Number(v) > 0)
      || 'Ingresa un monto mayor a cero'
  }

  function limpiarFormulario () {
    concepto.value = ''
    monto.value = null
    categoria.value = null
    fecha.value = new Date().toLocaleDateString('en-CA')
    descripcion.value = ''
    form.value?.resetValidation()
  }

  async function guardarMovimiento () {
    const resultado = await form.value.validate()

    if (!resultado.valid) return

    guardando.value = true

    const res = await finanzas?.agregarMovimiento({
      amount: Number(monto.value),
      type: tipoMovimiento.value,
      category_id: categoria.value,
      description: concepto.value.trim(),
      date: fecha.value,
    })

    guardando.value = false

    if (!res?.ok) {
      mensaje.value = res?.message || 'No se pudo guardar el movimiento.'
      snackbar.value = true
      return
    }

    dialog.value = false
    limpiarFormulario()

    mensaje.value = tipoMovimiento.value === 'ingreso'
      ? 'Ingreso registrado correctamente'
      : 'Gasto registrado correctamente'
    snackbar.value = true
  }
</script>

<template>
  <v-container class="income-page pa-4 pa-md-8" fluid>

    <!-- ENCABEZADO -->
    <div class="page-header">
      <div>
        <v-btn
          class="mb-3"
          color="primary"
          prepend-icon="mdi-arrow-left"
          variant="text"
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
        rounded="lg"
        size="large"
        @click="dialog = true"
      >
        Nuevo ingreso
      </v-btn>
    </div>

    <!-- RESUMEN FINANCIERO -->
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

    <!-- HISTORIAL DE INGRESOS -->
    <v-card class="history-card mt-6" elevation="0">
      <div class="history-header">
        <div>
          <h3>Historial de ingresos</h3>
          <p>Todos los ingresos que has registrado.</p>
        </div>

        <v-text-field
          v-model="busqueda"
          class="search-input"
          density="compact"
          hide-details
          placeholder="Buscar ingresos..."
          prepend-inner-icon="mdi-magnify"
          rounded="lg"
          variant="outlined"
        />
      </div>

      <v-table class="income-table">
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
                <v-avatar color="success" size="40" variant="tonal">
                  <v-icon>mdi-arrow-down-left</v-icon>
                </v-avatar>

                <strong>{{ ingreso.description }}</strong>
              </div>
            </td>

            <td>
              <v-chip color="primary" size="small" variant="tonal">
                {{ ingreso.category?.name }}
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
                <v-icon color="grey-lighten-1" size="58">
                  mdi-cash-remove
                </v-icon>

                <h3>No hay ingresos para mostrar</h3>
                <p>Registra tu primer ingreso o cambia la búsqueda.</p>

                <v-btn
                  color="primary"
                  rounded="lg"
                  variant="tonal"
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
          <h3>Nuevo ingreso</h3>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" @submit.prevent="guardarMovimiento">

            <v-text-field
              v-model="concepto"
              class="mb-3"
              placeholder="Ej. Pago de trabajo"
              prepend-inner-icon="mdi-text-box-outline"
              rounded="lg"
              :rules="[obligatorio]"
              variant="outlined"
            />

            <label>Monto (USD)</label>

            <v-text-field
              v-model="monto"
              class="mt-2 mb-3"
              min="0.01"
              placeholder="0.00"
              prepend-inner-icon="mdi-currency-usd"
              rounded="lg"
              :rules="[obligatorio, montoValido]"
              step="0.01"
              type="number"
              variant="outlined"
            />

            <!-- CATEGORÍA -->
            <div class="form-field mb-3">
              <label>Categoría</label>

              <v-select
                v-model="categoria"
                class="mt-2"
                item-title="title"
                item-value="value"
                :items="categoriasMovimiento"
                :menu-props="{ maxHeight: 300 }"
                placeholder="Selecciona una categoría"
                prepend-inner-icon="mdi-shape-outline"
                rounded="lg"
                :rules="[obligatorio]"
                variant="outlined"
              />

              <v-btn
                v-if="categoriasMovimiento.length === 0"
                class="category-button"
                color="primary"
                prepend-icon="mdi-plus-circle-outline"
                size="small"
                to="/categorias"
                variant="text"
              >
                Administrar mis categorías
              </v-btn>
            </div>

            <!-- FECHA -->
            <div class="form-field mb-3">
              <label>Fecha</label>

              <v-text-field
                v-model="fecha"
                class="mt-2"
                rounded="lg"
                :rules="[obligatorio]"
                type="date"
                variant="outlined"
              />
            </div>

            <label>Descripción (opcional)</label>

            <v-textarea
              v-model="descripcion"
              class="mt-2 mb-2"
              placeholder="Agrega detalles sobre este ingreso..."
              rounded="lg"
              rows="2"
              variant="outlined"
            />

            <div class="dialog-actions">
              <v-btn
                rounded="lg"
                variant="outlined"
                @click="dialog = false"
              >
                Cancelar
              </v-btn>

              <v-btn
                color="primary"
                :loading="guardando"
                prepend-icon="mdi-content-save-outline"
                rounded="lg"
                type="submit"
              >
                Guardar ingreso
              </v-btn>
            </div>

          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- NOTIFICACIÓN -->
    <v-snackbar
      v-model="snackbar"
      :color="mensaje.includes('No se pudo') ? 'error' : 'success'"
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
/* CONTENEDOR PRINCIPAL */

.income-page {
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

/* TARJETA CON GRADIENTE */

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

.income-table {
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
}

.income-table :deep(th) {
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 700;
  white-space: nowrap;
}

.income-table :deep(td) {
  color: rgb(var(--v-theme-on-surface));
}

.income-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.04);
}

.income-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.income-name strong {
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

/* ACCESIBILIDAD */

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
