<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useFinanzasStore } from '@/stores/finanzas'

  const router = useRouter()
  const finanzas = useFinanzasStore()

  const dialog = ref(false)
  const dialogEliminar = ref(false)
  const presupuestoEliminar = ref(null)
  const form = ref(null)

  const categoriaId = ref(null)
  const limite = ref(null)
  const mes = ref(new Date().toLocaleDateString('en-CA').slice(0, 7))
  const mesSeleccionado = ref(new Date().toLocaleDateString('en-CA').slice(0, 7))

  const menuMes = ref(false)
  const menuMesFormulario = ref(false)

  const anioSelector = ref(Number(mesSeleccionado.value.slice(0, 4)))
  const anioFormulario = ref(Number(mes.value.slice(0, 4)))

  const meses = [
    { nombre: 'Enero', valor: '01' },
    { nombre: 'Febrero', valor: '02' },
    { nombre: 'Marzo', valor: '03' },
    { nombre: 'Abril', valor: '04' },
    { nombre: 'Mayo', valor: '05' },
    { nombre: 'Junio', valor: '06' },
    { nombre: 'Julio', valor: '07' },
    { nombre: 'Agosto', valor: '08' },
    { nombre: 'Septiembre', valor: '09' },
    { nombre: 'Octubre', valor: '10' },
    { nombre: 'Noviembre', valor: '11' },
    { nombre: 'Diciembre', valor: '12' },
  ]

  const snackbar = ref(false)
  const mensaje = ref('')
  const colorAlerta = ref('success')

  async function cargarDatosPresupuestos () {
    const [year, month] = mesSeleccionado.value.split('-').map(Number)
    await Promise.all([
      finanzas?.cargarCategorias(),
      finanzas?.cargarMovimientos(),
      finanzas?.cargarPresupuestos(month, year),
    ])
  }

  onMounted(async () => {
    await cargarDatosPresupuestos()
  })

  watch(mesSeleccionado, async () => {
    await cargarDatosPresupuestos()
  })

  function nombreMes (valor) {
    if (!valor) return 'Seleccionar mes'
    const [anio, numeroMes] = valor.split('-')
    const mesEncontrado = meses.find(m => m.valor === numeroMes)
    return mesEncontrado ? `${mesEncontrado.nombre} ${anio}` : valor
  }

  function seleccionarMes (valor) {
    mesSeleccionado.value = `${anioSelector.value}-${valor}`
    menuMes.value = false
  }

  function seleccionarMesFormulario (valor) {
    mes.value = `${anioFormulario.value}-${valor}`
    menuMesFormulario.value = false
  }

  const categorias = computed(() =>
    (finanzas?.categorias || []).map(c => ({
      title: c.name ?? c.nombre,
      value: c.id,
      icon: c.icono ?? c.icon ?? 'mdi-wallet',
      color: c.color ?? '#2563EB',
      type: c.type ?? c.tipo,
    })),
  )

  const presupuestosMes = computed(() => {
    const [anioSel, mesSel] = mesSeleccionado.value.split('-')
    return (finanzas?.presupuestos || []).map(p => {
      const limit = Number(p.amount ?? p.limit ?? 0)
      const spentApi = p.spent != null ? Number(p.spent) : null
      const catId = Number(p.category_id ?? p.category?.id)
      const catName = p.category?.name ?? p.category?.nombre ?? categorias.value.find(c => c.value === catId)?.title ?? 'Categoría'
      const catInfo = categorias.value.find(c => c.value === catId)
      const gastado = spentApi != null
        ? spentApi
        : (finanzas?.movimientos || [])
            .filter(m => (m.type === 'gasto' || m.type === 'expense') && Number(m.category?.id ?? m.category_id) === catId && String(m.date || '').startsWith(`${anioSel}-${mesSel}`))
            .reduce((total, m) => total + Math.abs(Number(m.amount)), 0)
      const porcentaje = limit > 0 ? (gastado / limit) * 100 : 0
      return {
        id: p.id,
        categoryId: catId,
        category: catName,
        month: `${p.year}-${String(p.month).padStart(2, '0')}`,
        limit,
        gastado,
        disponible: Math.max(0, limit - gastado),
        porcentaje,
        icon: catInfo?.icon || p.category?.icon || 'mdi-wallet',
        color: catInfo?.color || p.category?.color || '#2563EB',
      }
    })
  })

  const totalPresupuestado = computed(() => presupuestosMes.value.reduce((total, p) => total + Number(p.limit), 0))
  const totalGastado = computed(() => presupuestosMes.value.reduce((total, p) => total + p.gastado, 0))
  const disponibles = computed(() => Math.max(0, totalPresupuestado.value - totalGastado.value))

  function dinero (valor) {
    return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(Number(valor) || 0)
  }

  function obligatorio (v) {
    return (v !== null && v !== undefined && v !== '') || 'Este campo es obligatorio'
  }

  function limiteValido (v) {
    return (Number.isFinite(Number(v)) && Number(v) > 0) || 'Ingresa un límite mayor a cero'
  }

  function colorProgreso (porcentaje) {
    if (porcentaje >= 100) return 'error'
    if (porcentaje >= 80) return 'warning'
    return 'success'
  }

  function estadoPresupuesto (porcentaje) {
    if (porcentaje >= 100) return 'Límite superado'
    if (porcentaje >= 80) return 'Cerca del límite'
    return 'Bajo control'
  }

  function abrirFormulario () {
    categoriaId.value = null
    limite.value = null
    mes.value = mesSeleccionado.value
    anioFormulario.value = Number(mes.value.slice(0, 4))
    dialog.value = true
  }

  async function guardar () {
    const resultado = await form.value.validate()
    if (!resultado.valid) return

    const [year, month] = mes.value.split('-').map(Number)
    const res = await finanzas?.guardarPresupuesto({
      category_id: Number(categoriaId.value),
      amount: Number(limite.value),
      month,
      year,
    })

    if (!res?.ok) {
      mensaje.value = res?.mensaje || 'No se pudo guardar el presupuesto'
      colorAlerta.value = 'error'
      snackbar.value = true
      return
    }

    mesSeleccionado.value = mes.value
    dialog.value = false
    await cargarDatosPresupuestos()

    mensaje.value = res?.mensaje || 'Presupuesto guardado correctamente'
    colorAlerta.value = 'success'
    snackbar.value = true
  }

  function confirmarEliminar (presupuesto) {
    presupuestoEliminar.value = presupuesto
    dialogEliminar.value = true
  }

  async function eliminar () {
    if (!presupuestoEliminar.value?.id) return

    const res = await finanzas?.eliminarPresupuesto(presupuestoEliminar.value.id)

    dialogEliminar.value = false
    presupuestoEliminar.value = null

    if (!res?.ok) {
      mensaje.value = res?.mensaje || 'No se pudo eliminar el presupuesto'
      colorAlerta.value = 'error'
      snackbar.value = true
      return
    }

    await cargarDatosPresupuestos()
    mensaje.value = res?.mensaje || 'Presupuesto eliminado correctamente'
    colorAlerta.value = 'success'
    snackbar.value = true
  }
</script>

<template>
  <v-container class="budgets-page pa-4 pa-md-8" fluid>
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

        <h1>Mis presupuestos</h1>
        <p>Organiza tus gastos y mantén el control de tu dinero.</p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        rounded="lg"
        size="large"
        @click="abrirFormulario"
      >
        Nuevo presupuesto
      </v-btn>
    </div>

    <div class="month-filter">
      <v-icon color="primary">mdi-calendar-month-outline</v-icon>

      <span>Seleccionar mes</span>

      <v-menu
        v-model="menuMes"
        :close-on-content-click="false"
        location="bottom start"
        @update:model-value="valor => {
          if (valor) {
            anioSelector = Number(mesSeleccionado.slice(0, 4))
          }
        }"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            append-icon="mdi-chevron-down"
            color="primary"
            rounded="lg"
            variant="tonal"
          >
            {{ nombreMes(mesSeleccionado) }}
          </v-btn>
        </template>

        <v-card class="month-picker-card" elevation="8">
          <div class="month-picker-header">
            <v-btn
              icon="mdi-chevron-left"
              size="small"
              variant="text"
              @click="anioSelector--"
            />

            <strong>{{ anioSelector }}</strong>

            <v-btn
              icon="mdi-chevron-right"
              size="small"
              variant="text"
              @click="anioSelector++"
            />
          </div>

          <v-divider />

          <v-row class="month-grid" dense>
            <v-col
              v-for="item in meses"
              :key="item.valor"
              cols="4"
            >
              <v-btn
                block
                :color="
                  mesSeleccionado === `${anioSelector}-${item.valor}`
                    ? 'primary'
                    : undefined
                "
                rounded="lg"
                size="small"
                :variant="
                  mesSeleccionado === `${anioSelector}-${item.valor}`
                    ? 'flat'
                    : 'text'
                "
                @click="seleccionarMes(item.valor)"
              >
                {{ item.nombre.slice(0, 3) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-menu>
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

    <v-row v-if="presupuestosMes.length > 0">
      <v-col
        v-for="presupuesto in presupuestosMes"
        :key="presupuesto.id"
        cols="12"
        lg="4"
        md="6"
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
              color="error"
              icon="mdi-delete-outline"
              size="small"
              variant="text"
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
            class="mt-4"
            :color="colorProgreso(presupuesto.porcentaje)"
            height="10"
            :model-value="Math.min(presupuesto.porcentaje, 100)"
            rounded
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
            class="mt-4"
            density="compact"
            type="error"
            variant="tonal"
          >
            Has superado tu presupuesto por
            {{ dinero(presupuesto.gastado - presupuesto.limit) }}.
          </v-alert>

          <v-alert
            v-else-if="presupuesto.porcentaje >= 80"
            class="mt-4"
            density="compact"
            type="warning"
            variant="tonal"
          >
            Estás cerca de alcanzar tu límite de gasto.
          </v-alert>

          <div class="budget-footer">
            <v-icon color="success" size="18">
              mdi-wallet-outline
            </v-icon>
            Disponible: {{ dinero(presupuesto.disponible) }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else class="empty-state" elevation="0">
      <v-icon color="grey-lighten-1" size="65">
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
      <v-card class="dialog-card" rounded="xl">
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
              v-model="categoriaId"
              class="mt-2 mb-2"
              item-title="title"
              item-value="value"
              :items="categorias"
              placeholder="Selecciona una categoría"
              prepend-inner-icon="mdi-shape-outline"
              rounded="lg"
              :rules="[obligatorio]"
              variant="outlined"
            />

            <label>Límite mensual (USD)</label>

            <v-text-field
              v-model="limite"
              class="mt-2 mb-2"
              min="0.01"
              placeholder="Ej. 100"
              prepend-inner-icon="mdi-currency-usd"
              rounded="lg"
              :rules="[obligatorio, limiteValido]"
              step="0.01"
              type="number"
              variant="outlined"
            />

            <label>Mes</label>

            <v-menu
              v-model="menuMesFormulario"
              :close-on-content-click="false"
              location="bottom start"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  append-icon="mdi-chevron-down"
                  block
                  class="month-form-button mt-2 mb-3"
                  color="primary"
                  prepend-icon="mdi-calendar-month-outline"
                  rounded="lg"
                  variant="outlined"
                >
                  {{ nombreMes(mes) }}
                </v-btn>
              </template>

              <v-card class="month-picker-card" elevation="8">
                <div class="month-picker-header">
                  <v-btn
                    icon="mdi-chevron-left"
                    size="small"
                    variant="text"
                    @click="anioFormulario--"
                  />

                  <strong>{{ anioFormulario }}</strong>

                  <v-btn
                    icon="mdi-chevron-right"
                    size="small"
                    variant="text"
                    @click="anioFormulario++"
                  />
                </div>

                <v-divider />

                <v-row class="month-grid" dense>
                  <v-col
                    v-for="item in meses"
                    :key="item.valor"
                    cols="4"
                  >
                    <v-btn
                      block
                      :color="
                        mes === `${anioFormulario}-${item.valor}`
                          ? 'primary'
                          : undefined
                      "
                      rounded="lg"
                      size="small"
                      :variant="
                        mes === `${anioFormulario}-${item.valor}`
                          ? 'flat'
                          : 'text'
                      "
                      @click="seleccionarMesFormulario(item.valor)"
                    >
                      {{ item.nombre.slice(0, 3) }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-menu>

            <v-alert
              class="mb-5"
              density="comfortable"
              type="info"
              variant="tonal"
            >
              Si ya existe un presupuesto para esta categoría
              y mes, se actualizará su límite.
            </v-alert>

            <v-btn
              block
              color="primary"
              prepend-icon="mdi-content-save-outline"
              rounded="lg"
              size="large"
              type="submit"
            >
              Guardar presupuesto
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ELIMINAR -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card class="delete-dialog" rounded="xl">
        <v-icon color="error" size="48">
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
            rounded="lg"
            variant="outlined"
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
      <v-icon class="mr-2">{{ colorAlerta === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}</v-icon>
      {{ mensaje }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>

.budgets-page {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* ENCABEZADOS */
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
  color: rgb(var(--v-theme-on-background));
}

.page-header p,
.section-heading p {
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 7px;
  font-size: 14px;
}

/* FILTRO DE MES */
.month-filter {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 28px;
  color: rgb(var(--v-theme-on-surface));
  font-size: 13px;
  font-weight: 700;
}

.month-picker-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  min-width: 280px;
}

.month-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}

.month-grid {
  padding: 12px;
}

/* TARJETAS DE RESUMEN */
.summary-card {
  padding: 26px;
  min-height: 170px;
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  transition: transform 0.25s, box-shadow 0.25s;
}

.summary-card:hover,
.budget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.12);
}

.summary-heading {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
  font-weight: 600;
}

.summary-card h2 {
  font-size: 31px;
  font-weight: 800;
  margin-top: 24px;
  letter-spacing: -1px;
  color: rgb(var(--v-theme-on-surface));
}

.summary-card p {
  margin-top: 10px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 12px;
}

/* TARJETA DESTACADA */
.gradient-card {
  background: linear-gradient(135deg, #2563eb, #4338ca, #7c3aed);
  color: white;
  border: none;
}

.gradient-card .summary-heading,
.gradient-card h2,
.gradient-card p {
  color: white !important;
}

/* SECCIÓN DE PRESUPUESTOS */
.section-heading {
  margin: 35px 0 20px;
}

.section-heading h2 {
  font-size: 21px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-background));
}

/* TARJETAS POR CATEGORÍA */
.budget-card {
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  border-radius: 20px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
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
  color: rgb(var(--v-theme-on-surface));
  font-size: 16px;
  font-weight: 800;
}

.category-info span,
.budget-amounts span {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 12px;
}

.budget-amounts {
  margin-top: 30px;
}

.budget-amounts h3 {
  font-size: 20px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  margin-top: 5px;
}

.progress-info {
  margin-top: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 12px;
}

.budget-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  padding-top: 17px;
  margin-top: 20px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 13px;
}

/* ESTADO VACÍO */
.empty-state {
  text-align: center;
  padding: 65px 20px;
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.empty-state h3 {
  font-size: 20px;
  margin-top: 15px;
  color: rgb(var(--v-theme-on-surface));
}

.empty-state p {
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 10px 0 22px;
}

/* DIÁLOGO DE CREACIÓN */
.dialog-card {
  padding: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.dialog-title {
  padding: 20px 20px 10px;
}

.dialog-title h3 {
  font-size: 21px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.dialog-title p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 5px;
}

.dialog-card label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface));
}

.month-form-button {
  justify-content: flex-start;
}

/* DIÁLOGO DE ELIMINACIÓN */
.delete-dialog {
  padding: 30px 25px;
  text-align: center;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.delete-dialog h3 {
  margin-top: 12px;
  font-size: 19px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.delete-dialog p {
  margin: 12px 0 24px;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.delete-actions {
  justify-content: center;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .page-header h1 {
    font-size: 25px;
  }

  .summary-card h2 {
    font-size: 26px;
  }

  .budget-amounts h3 {
    font-size: 17px;
  }
}
</style>
