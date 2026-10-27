
<script setup>
import { ref, computed } from 'vue'
import { useFinanzasStore } from '@/stores/finanzas'

const finanzas = useFinanzasStore()

const busqueda = ref('')
const filtroEstado = ref('Todos')
const filtroCategoria = ref('Todas')
const snackbar = ref(false)
const mensaje = ref('')

const estados = [
  'Pendiente',
  'En revisión',
  'Resuelto',
]

const categorias = [
  'Mejora',
  'Reportar error',
  'Nueva función',
  'Opinión general',
]

const comentariosFiltrados = computed(() => {
  return finanzas.comentarios.filter((item) => {
    const texto = busqueda.value.toLowerCase().trim()

    const coincideBusqueda =
      String(item.usuario || '').toLowerCase().includes(texto) ||
      String(item.comentario || '').toLowerCase().includes(texto)

    const coincideEstado =
      filtroEstado.value === 'Todos' ||
      item.estado === filtroEstado.value

    const coincideCategoria =
      filtroCategoria.value === 'Todas' ||
      item.categoria === filtroCategoria.value

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincideCategoria
    )
  })
})

const total = computed(() => finanzas.comentarios.length)

const pendientes = computed(() =>
  finanzas.comentarios.filter(
    (item) => item.estado === 'Pendiente'
  ).length
)

const enRevision = computed(() =>
  finanzas.comentarios.filter(
    (item) => item.estado === 'En revisión'
  ).length
)

const resueltos = computed(() =>
  finanzas.comentarios.filter(
    (item) => item.estado === 'Resuelto'
  ).length
)

function cambiarEstado(id, nuevoEstado) {
  finanzas.actualizarEstadoComentario(id, nuevoEstado)

  mensaje.value = 'Estado actualizado correctamente.'
  snackbar.value = true
}

function colorEstado(estado) {
  if (estado === 'Resuelto') return 'success'
  if (estado === 'En revisión') return 'info'
  return 'warning'
}
</script>

<template>
  <div class="admin-comentarios">
    <div class="page-header">
      <div>
        <v-chip color="primary" variant="tonal" class="mb-3">
          Administración
        </v-chip>

        <h1>Comentarios y sugerencias</h1>

        <p>
          Revisa las opiniones de los estudiantes
          y administra las mejoras de StudentWallet.
        </p>
      </div>

      <v-chip color="info" variant="tonal">
        Modo demostración
      </v-chip>
    </div>

    <!-- ESTADÍSTICAS -->
    <v-row class="mt-5">
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon blue">
            <v-icon color="primary">
              mdi-message-text-outline
            </v-icon>
          </div>
          <p>Total de comentarios</p>
          <h2>{{ total }}</h2>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon orange">
            <v-icon color="warning">
              mdi-clock-outline
            </v-icon>
          </div>
          <p>Pendientes</p>
          <h2>{{ pendientes }}</h2>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon purple">
            <v-icon color="#7C3AED">
              mdi-eye-outline
            </v-icon>
          </div>
          <p>En revisión</p>
          <h2>{{ enRevision }}</h2>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon green">
            <v-icon color="success">
              mdi-check-circle-outline
            </v-icon>
          </div>
          <p>Resueltos</p>
          <h2>{{ resueltos }}</h2>
        </v-card>
      </v-col>
    </v-row>

    <!-- LISTADO -->
    <v-card class="content-card mt-5" elevation="0">
      <div class="section-header">
        <div>
          <h2>Bandeja de comentarios</h2>
          <p>
            {{ comentariosFiltrados.length }}
            comentarios encontrados
          </p>
        </div>

        <v-icon color="primary" size="28">
          mdi-inbox-outline
        </v-icon>
      </div>

      <v-row class="mb-3">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="busqueda"
            placeholder="Buscar por usuario o comentario..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filtroEstado"
            :items="['Todos', ...estados]"
            label="Estado"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filtroCategoria"
            :items="['Todas', ...categorias]"
            label="Categoría"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
          />
        </v-col>
      </v-row>

      <v-alert
        v-if="comentariosFiltrados.length === 0"
        type="info"
        variant="tonal"
      >
        No hay comentarios que coincidan con los filtros.
      </v-alert>

      <div
        v-for="item in comentariosFiltrados"
        :key="item.id"
        class="comment-card"
      >
        <div class="comment-header">
          <div class="user-info">
            <v-avatar color="primary" size="42">
              <v-icon color="white">
                mdi-account-outline
              </v-icon>
            </v-avatar>

            <div>
              <strong>{{ item.usuario }}</strong>
              <p>{{ item.fecha }}</p>
            </div>
          </div>

          <v-chip
            :color="colorEstado(item.estado)"
            variant="tonal"
            size="small"
          >
            {{ item.estado }}
          </v-chip>
        </div>

        <div class="comment-body">
          <v-chip
            size="small"
            color="primary"
            variant="outlined"
          >
            {{ item.categoria }}
          </v-chip>

          <p>{{ item.comentario }}</p>

          <div class="rating">
            <v-rating
              :model-value="item.calificacion"
              readonly
              density="compact"
              size="small"
              color="amber"
              active-color="amber"
            />
          </div>
        </div>

        <div class="comment-footer">
          <span>Actualizar estado:</span>

          <v-select
            :model-value="item.estado"
            :items="estados"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            class="status-select"
            @update:model-value="
              cambiarEstado(item.id, $event)
            "
          />
        </div>
      </div>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      color="success"
      location="top right"
      :timeout="3000"
    >
      {{ mensaje }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.admin-comentarios {
  min-height: 100vh;
  padding: 32px;
  background: #f6f8fc;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
}

.page-header p {
  margin-top: 8px;
  color: #64748b;
}

.stat-card,
.content-card {
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 18px;
  padding: 24px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.blue {
  background: #dbeafe;
}

.orange {
  background: #fef3c7;
}

.purple {
  background: #ede9fe;
}

.green {
  background: #d1fae5;
}

.stat-card p {
  color: #64748b;
  font-size: 14px;
}

.stat-card h2 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  margin-top: 7px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
}

.section-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 5px;
}

.comment-card {
  border: 1px solid #e8edf5;
  border-radius: 16px;
  padding: 22px;
  margin-top: 16px;
}

.comment-header,
.comment-footer,
.user-info {
  display: flex;
  align-items: center;
}

.comment-header {
  justify-content: space-between;
  gap: 12px;
}

.user-info {
  gap: 12px;
}

.user-info strong {
  color: #0f172a;
  font-size: 14px;
}

.user-info p {
  color: #94a3b8;
  font-size: 12px;
}

.comment-body {
  margin-top: 20px;
}

.comment-body p {
  margin-top: 15px;
  color: #475569;
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.rating {
  margin-top: 12px;
}

.comment-footer {
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  border-top: 1px solid #e8edf5;
  padding-top: 18px;
  margin-top: 18px;
}

.comment-footer span {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.status-select {
  max-width: 190px;
  min-width: 160px;
}

@media (max-width: 600px) {
  .admin-comentarios {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .content-card {
    padding: 18px;
  }
}
</style>
