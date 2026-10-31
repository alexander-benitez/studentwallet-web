
<script setup>
import { ref, computed } from 'vue'
import { useFinanzasStore } from '@/stores/finanzas'

const finanzas = useFinanzasStore()

const tipoActivo = ref('expense')
const busqueda = ref('')
const dialogo = ref(false)
const dialogoEliminar = ref(false)
const editandoId = ref(null)
const categoriaEliminar = ref(null)
const formulario = ref(null)

const snackbar = ref(false)
const mensaje = ref('')
const colorMensaje = ref('success')

const iconos = [
  'mdi-tag-outline',
  'mdi-food-outline',
  'mdi-bus',
  'mdi-school-outline',
  'mdi-shopping-outline',
  'mdi-home-outline',
  'mdi-heart-outline',
  'mdi-gamepad-variant-outline',
  'mdi-cash-multiple',
  'mdi-wallet-outline',
  'mdi-briefcase-outline',
  'mdi-gift-outline',
  'mdi-piggy-bank-outline',
  'mdi-laptop',
]

const colores = [
  '#2563EB',
  '#7C3AED',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#06B6D4',
  '#64748B',
]

const datosIniciales = () => ({
  nombre: '',
  tipo: tipoActivo.value,
  icono: 'mdi-tag-outline',
  color: '#2563EB',
})

const categoriaForm = ref(datosIniciales())

const reglas = [
  valor => !!String(valor || '').trim() || 'El nombre es obligatorio',
  valor => String(valor || '').trim().length <= 40 ||
    'Máximo 40 caracteres',
]

const categoriasFiltradas = computed(() => {
  const texto = String(busqueda.value || '').toLowerCase().trim()

  return finanzas.categorias.filter(categoria =>
    categoria.tipo === tipoActivo.value &&
    categoria.nombre.toLowerCase().includes(texto)
  )
})

const totalGastos = computed(() =>
  finanzas.categorias.filter(c => c.tipo === 'expense').length
)

const totalIngresos = computed(() =>
  finanzas.categorias.filter(c => c.tipo === 'income').length
)

function notificar(texto, color = 'success') {
  mensaje.value = texto
  colorMensaje.value = color
  snackbar.value = true
}

function abrirCrear() {
  editandoId.value = null
  categoriaForm.value = datosIniciales()
  dialogo.value = true
}

function abrirEditar(categoria) {
  editandoId.value = categoria.id

  categoriaForm.value = {
    nombre: categoria.nombre,
    tipo: categoria.tipo,
    icono: categoria.icono,
    color: categoria.color,
  }

  dialogo.value = true
}

async function guardarCategoria() {
  const resultadoValidacion = await formulario.value.validate()

  if (!resultadoValidacion.valid) return

  const resultado = editandoId.value
    ? finanzas.editarCategoria(editandoId.value, categoriaForm.value)
    : finanzas.agregarCategoria(categoriaForm.value)

  if (!resultado.ok) {
    notificar(resultado.mensaje, 'error')
    return
  }

  dialogo.value = false
  notificar(resultado.mensaje)
}

function confirmarEliminar(categoria) {
  categoriaEliminar.value = categoria
  dialogoEliminar.value = true
}

function eliminarCategoria() {
  if (!categoriaEliminar.value) return

  const resultado = finanzas.eliminarCategoria(
    categoriaEliminar.value.id
  )

  dialogoEliminar.value = false

  notificar(
    resultado.mensaje,
    resultado.ok ? 'success' : 'error'
  )

  categoriaEliminar.value = null
}
</script>

<template>
  <div class="categorias-page">
    <div class="page-header">
      <div>
        <v-chip color="primary" variant="tonal" class="mb-3">
          Organización financiera
        </v-chip>

        <h1>Mis categorías</h1>

        <p>
          Personaliza las categorías de tus ingresos
          y gastos para organizar mejor tus finanzas.
        </p>
      </div>

      <v-btn
        color="primary"
        size="large"
        rounded="lg"
        prepend-icon="mdi-plus"
        @click="abrirCrear"
      >
        Nueva categoría
      </v-btn>
    </div>

    <!-- RESUMEN -->
    <v-row class="mt-5">
      <v-col cols="12" sm="6">
        <v-card class="summary-card" elevation="0">
          <div class="summary-icon expense-icon">
            <v-icon color="#7C3AED" size="26">
              mdi-trending-down
            </v-icon>
          </div>

          <div>
            <p>Categorías de gastos</p>
            <h2>{{ totalGastos }}</h2>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6">
        <v-card class="summary-card" elevation="0">
          <div class="summary-icon income-icon">
            <v-icon color="#10B981" size="26">
              mdi-trending-up
            </v-icon>
          </div>

          <div>
            <p>Categorías de ingresos</p>
            <h2>{{ totalIngresos }}</h2>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- LISTADO -->
    <v-card class="content-card mt-5" elevation="0">
      <div class="section-heading">
        <div>
          <h2>Administrar categorías</h2>
          <p>Organiza tus movimientos financieros</p>
        </div>

        <v-icon color="primary" size="27">
          mdi-shape-outline
        </v-icon>
      </div>

      <div class="filters">
        <v-btn-toggle
          v-model="tipoActivo"
          mandatory
          color="primary"
          variant="outlined"
          rounded="lg"
          divided
        >
          <v-btn value="expense">
            <v-icon start>mdi-trending-down</v-icon>
            Gastos
          </v-btn>

          <v-btn value="income">
            <v-icon start>mdi-trending-up</v-icon>
            Ingresos
          </v-btn>
        </v-btn-toggle>

        <v-text-field
          v-model="busqueda"
          placeholder="Buscar categoría..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details
          clearable
          class="search-field"
        />
      </div>

      <v-alert
        v-if="categoriasFiltradas.length === 0"
        type="info"
        variant="tonal"
        class="mt-5"
      >
        No se encontraron categorías. Puedes crear una nueva
        con el botón superior.
      </v-alert>

      <v-row v-else class="mt-3">
        <v-col
          v-for="categoria in categoriasFiltradas"
          :key="categoria.id"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card class="category-card" elevation="0">
            <div class="category-top">
              <div
                class="category-icon"
                :style="{
                  backgroundColor: categoria.color + '18',
                }"
              >
                <v-icon
                  :color="categoria.color"
                  size="29"
                >
                  {{ categoria.icono }}
                </v-icon>
              </div>

              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                  />
                </template>

                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-pencil-outline"
                    title="Editar categoría"
                    @click="abrirEditar(categoria)"
                  />

                  <v-list-item
                    prepend-icon="mdi-delete-outline"
                    title="Eliminar categoría"
                    base-color="error"
                    @click="confirmarEliminar(categoria)"
                  />
                </v-list>
              </v-menu>
            </div>

            <h3>{{ categoria.nombre }}</h3>

            <v-chip
              size="small"
              variant="tonal"
              :color="
                categoria.tipo === 'income'
                  ? 'success'
                  : 'primary'
              "
              class="mt-3"
            >
              {{ categoria.tipo === 'income' ? 'Ingreso' : 'Gasto' }}
            </v-chip>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- FORMULARIO -->
    <v-dialog v-model="dialogo" max-width="540">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="dialog-title">
          {{ editandoId ? 'Editar categoría' : 'Nueva categoría' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="formulario" @submit.prevent="guardarCategoria">
            <!-- NOMBRE DE LA CATEGORÍA -->
<div class="category-form-field">
  <label class="form-label">Nombre de la categoría</label>

  <v-text-field
    v-model="categoriaForm.nombre"
    placeholder="Ej. Servicios básicos"
    variant="outlined"
    rounded="lg"
    counter="40"
    maxlength="40"
    :rules="reglas"
    class="category-name-input"
    hide-details="auto"
  />
</div>

           <!-- TIPO DE CATEGORÍA -->
<div class="category-form-field">
  <label class="form-label">Tipo de categoría</label>

  <v-select
    v-model="categoriaForm.tipo"
    :items="[
      { title: 'Gasto', value: 'expense' },
      { title: 'Ingreso', value: 'income' },
    ]"
    variant="outlined"
    rounded="lg"
    hide-details
  />
</div>

            <p class="field-label">Selecciona un ícono</p>

            <div class="icon-grid">
              <button
                v-for="icono in iconos"
                :key="icono"
                type="button"
                class="icon-option"
                :class="{
                  'icon-selected': categoriaForm.icono === icono,
                }"
                @click="categoriaForm.icono = icono"
              >
                <v-icon size="23">
                  {{ icono }}
                </v-icon>
              </button>
            </div>

            <p class="field-label mt-5">Selecciona un color</p>

            <div class="colors">
              <button
                v-for="color in colores"
                :key="color"
                type="button"
                class="color-option"
                :class="{
                  'color-selected': categoriaForm.color === color,
                }"
                :style="{ backgroundColor: color }"
                :aria-label="'Seleccionar color ' + color"
                @click="categoriaForm.color = color"
              >
                <v-icon
                  v-if="categoriaForm.color === color"
                  color="white"
                  size="18"
                >
                  mdi-check
                </v-icon>
              </button>
            </div>

            <div class="dialog-actions">
              <v-btn
                variant="text"
                rounded="lg"
                @click="dialogo = false"
              >
                Cancelar
              </v-btn>

              <v-btn
                type="submit"
                color="primary"
                rounded="lg"
                prepend-icon="mdi-content-save-outline"
              >
                {{ editandoId ? 'Guardar cambios' : 'Crear categoría' }}
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- CONFIRMAR ELIMINACIÓN -->
    <v-dialog v-model="dialogoEliminar" max-width="430">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title>
          Eliminar categoría
        </v-card-title>

        <v-card-text>
          ¿Estás seguro de que deseas eliminar
          <strong>{{ categoriaEliminar?.nombre }}</strong>?

          <v-alert
            type="warning"
            variant="tonal"
            class="mt-4"
            density="comfortable"
          >
            No se podrá eliminar si tiene movimientos
            o presupuestos asociados.
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            variant="text"
            @click="dialogoEliminar = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            @click="eliminarCategoria"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- NOTIFICACIONES -->
    <v-snackbar
      v-model="snackbar"
      :color="colorMensaje"
      location="top right"
      :timeout="3500"
    >
      {{ mensaje }}

      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>

.categorias-page {
  min-height: 100vh;
  padding: 32px;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
}

/* ENCABEZADO */

.page-header {
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
  letter-spacing: -1px;
}

.page-header p {
  margin-top: 8px;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* TARJETAS DE RESUMEN */

.summary-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 18px;
}

.summary-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.expense-icon {
  background: rgba(124, 58, 237, 0.13);
}

.income-icon {
  background: rgba(16, 185, 129, 0.13);
}

.summary-card p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.summary-card h2 {
  font-size: 29px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
  margin-top: 5px;
}

/* CONTENEDOR PRINCIPAL */

.content-card {
  padding: 25px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 18px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-heading h2 {
  font-size: 19px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.section-heading p {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 5px;
}

/* FILTROS */

.filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
}

.search-field {
  max-width: 330px;
  min-width: 200px;
}

/* TARJETAS DE CATEGORÍAS */

.category-card {
  padding: 22px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 16px;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.category-card:hover {
  transform: translateY(-3px);
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 8px 24px rgba(var(--v-theme-on-surface), 0.08) !important;
}

.category-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.category-icon {
  width: 55px;
  height: 55px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-card h3 {
  font-size: 17px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin-top: 20px;
}

/* DIÁLOGOS */

.dialog-card {
  padding: 12px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.dialog-title {
  font-size: 21px;
  font-weight: 800;
  padding: 20px 24px;
  color: rgb(var(--v-theme-on-surface));
}

/* CAMPOS DEL FORMULARIO DE CATEGORÍAS */

.category-form-field {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 22px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 10px;
  text-align: left;
}

.category-name-input {
  margin-bottom: 0;
}

/* SEPARACIÓN DEL MENSAJE DE VALIDACIÓN */

.category-name-input :deep(.v-input__details) {
  padding-top: 6px;
  min-height: 30px;
}

.category-name-input :deep(.v-messages) {
  line-height: 1.4;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 12px;
}

/* SELECTOR DE ICONOS */

.icon-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.icon-option {
  height: 43px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.18);
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  color: rgb(var(--v-theme-on-surface-variant));
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.icon-option:hover {
  border-color: rgb(var(--v-theme-primary));
}

.icon-selected {
  background: rgba(var(--v-theme-primary), 0.15);
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
}

/* SELECTOR DE COLORES */

.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
}

.color-selected {
  outline: 2px solid rgb(var(--v-theme-on-surface-variant));
  outline-offset: 3px;
}

/* BOTONES DEL DIÁLOGO */

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

/* DIVISORES Y COMPONENTES VUETIFY */

.content-card :deep(.v-divider),
.dialog-card :deep(.v-divider) {
  border-color: rgba(var(--v-theme-on-surface), 0.12);
  opacity: 1;
}

/* RESPONSIVE */

@media (max-width: 600px) {
  .categorias-page {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .content-card {
    padding: 16px;
  }

  .search-field {
    max-width: 100%;
    width: 100%;
  }

  .icon-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-card,
  .icon-option {
    transition: none;
  }
}

</style>
