
<script setup>
import { ref, computed, watch } from 'vue'

const usuariosIniciales = [
  {
    id: 1,
    nombre: 'María López',
    correo: 'maria@ejemplo.com',
    universidad: 'Universidad de El Salvador',
    rol: 'Estudiante',
    estado: 'Activo',
    fecha: '2026-09-12',
  },
  {
    id: 2,
    nombre: 'Carlos Pérez',
    correo: 'carlos@ejemplo.com',
    universidad: 'ITCA-FEPADE',
    rol: 'Estudiante',
    estado: 'Activo',
    fecha: '2026-09-20',
  },
  {
    id: 3,
    nombre: 'Ana Martínez',
    correo: 'ana@ejemplo.com',
    universidad: 'Universidad Don Bosco',
    rol: 'Estudiante',
    estado: 'Inactivo',
    fecha: '2026-10-01',
  },
  {
    id: 4,
    nombre: 'José Hernández',
    correo: 'jose@ejemplo.com',
    universidad: 'Universidad Tecnológica',
    rol: 'Estudiante',
    estado: 'Activo',
    fecha: '2026-10-10',
  },
]

function cargarUsuarios() {
  try {
    const datos = localStorage.getItem('studentwallet_admin_usuarios')
    if (!datos) return usuariosIniciales

    const resultado = JSON.parse(datos)
    return Array.isArray(resultado) ? resultado : usuariosIniciales
  } catch {
    return usuariosIniciales
  }
}

const usuarios = ref(cargarUsuarios())

const busqueda = ref('')
const filtroEstado = ref('Todos')
const filtroRol = ref('Todos')

const dialogo = ref(false)
const usuarioSeleccionado = ref(null)

const snackbar = ref(false)
const mensaje = ref('')

const totalUsuarios = computed(() => usuarios.value.length)

const activos = computed(() =>
  usuarios.value.filter(u => u.estado === 'Activo').length
)

const inactivos = computed(() =>
  usuarios.value.filter(u => u.estado === 'Inactivo').length
)

const usuariosFiltrados = computed(() => {
  const texto = String(busqueda.value || '').toLowerCase().trim()

  return usuarios.value.filter(usuario => {
    const coincideBusqueda =
      usuario.nombre.toLowerCase().includes(texto) ||
      usuario.correo.toLowerCase().includes(texto)

    const coincideEstado =
      filtroEstado.value === 'Todos' ||
      usuario.estado === filtroEstado.value

    const coincideRol =
      filtroRol.value === 'Todos' ||
      usuario.rol === filtroRol.value

    return coincideBusqueda && coincideEstado && coincideRol
  })
})

watch(
  usuarios,
  nuevos => {
    localStorage.setItem(
      'studentwallet_admin_usuarios',
      JSON.stringify(nuevos)
    )
  },
  { deep: true }
)

function verUsuario(usuario) {
  usuarioSeleccionado.value = usuario
  dialogo.value = true
}

function cambiarEstado(usuario) {
  usuario.estado =
    usuario.estado === 'Activo' ? 'Inactivo' : 'Activo'

  mensaje.value =
    `La cuenta de ${usuario.nombre} ahora está ${usuario.estado.toLowerCase()}.`

  snackbar.value = true
}

function iniciales(nombre) {
  return nombre
    .split(' ')
    .map(palabra => palabra.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

<template>
  <div class="usuarios-page">
    <div class="page-header">
      <div>
        <v-chip color="primary" variant="tonal" class="mb-3">
          Administración
        </v-chip>

        <h1>Gestión de usuarios</h1>
        <p>
          Consulta y administra las cuentas de StudentWallet.
        </p>
      </div>

      <v-chip color="info" variant="tonal">
        Datos de demostración
      </v-chip>
    </div>

    <!-- ESTADÍSTICAS -->
    <v-row class="mt-5">
      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon blue">
            <v-icon color="primary" size="26">
              mdi-account-group-outline
            </v-icon>
          </div>
          <p>Total de usuarios</p>
          <h2>{{ totalUsuarios }}</h2>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon green">
            <v-icon color="success" size="26">
              mdi-account-check-outline
            </v-icon>
          </div>
          <p>Usuarios activos</p>
          <h2>{{ activos }}</h2>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon orange">
            <v-icon color="warning" size="26">
              mdi-account-off-outline
            </v-icon>
          </div>
          <p>Usuarios inactivos</p>
          <h2>{{ inactivos }}</h2>
        </v-card>
      </v-col>
    </v-row>

    <!-- TABLA DE USUARIOS -->
    <v-card class="content-card mt-5" elevation="0">
      <div class="section-header">
        <div>
          <h2>Usuarios registrados</h2>
          <p>{{ usuariosFiltrados.length }} resultados encontrados</p>
        </div>

        <v-icon color="primary" size="28">
          mdi-account-search-outline
        </v-icon>
      </div>

      <v-row class="mb-3">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="busqueda"
            placeholder="Buscar por nombre o correo..."
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
            :items="['Todos', 'Activo', 'Inactivo']"
            label="Estado"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filtroRol"
            :items="['Todos', 'Estudiante', 'Administrador']"
            label="Rol"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
          />
        </v-col>
      </v-row>

      <v-alert
        v-if="usuariosFiltrados.length === 0"
        type="info"
        variant="tonal"
      >
        No se encontraron usuarios con esos filtros.
      </v-alert>

      <div v-else class="table-wrapper">
        <v-table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo electrónico</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="usuario in usuariosFiltrados"
              :key="usuario.id"
            >
              <td>
                <div class="user-cell">
                  <v-avatar color="#DBEAFE" size="38">
                    <span class="avatar-text">
                      {{ iniciales(usuario.nombre) }}
                    </span>
                  </v-avatar>

                  <strong>{{ usuario.nombre }}</strong>
                </div>
              </td>

              <td>{{ usuario.correo }}</td>
              <td>{{ usuario.rol }}</td>

              <td>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="
                    usuario.estado === 'Activo'
                      ? 'success'
                      : 'warning'
                  "
                >
                  {{ usuario.estado }}
                </v-chip>
              </td>

              <td>
                <div class="actions">
                  <v-btn
                    icon="mdi-eye-outline"
                    variant="text"
                    color="primary"
                    size="small"
                    @click="verUsuario(usuario)"
                  />

                  <v-btn
                    :icon="
                      usuario.estado === 'Activo'
                        ? 'mdi-account-off-outline'
                        : 'mdi-account-check-outline'
                    "
                    variant="text"
                    :color="
                      usuario.estado === 'Activo'
                        ? 'warning'
                        : 'success'
                    "
                    size="small"
                    @click="cambiarEstado(usuario)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card>

    <!-- DETALLES DEL USUARIO -->
    <v-dialog v-model="dialogo" max-width="500">
      <v-card v-if="usuarioSeleccionado" rounded="xl">
        <v-card-title class="pa-5">
          Detalles del usuario
        </v-card-title>

        <v-card-text class="px-5">
          <div class="detail-avatar">
            <v-avatar color="#DBEAFE" size="70">
              <span class="avatar-text">
                {{ iniciales(usuarioSeleccionado.nombre) }}
              </span>
            </v-avatar>

            <h3>{{ usuarioSeleccionado.nombre }}</h3>
            <p>{{ usuarioSeleccionado.rol }}</p>
          </div>

          <v-divider class="my-5" />

          <div class="detail-row">
            <strong>Correo:</strong>
            <span>{{ usuarioSeleccionado.correo }}</span>
          </div>

          <div class="detail-row">
            <strong>Universidad:</strong>
            <span>{{ usuarioSeleccionado.universidad }}</span>
          </div>

          <div class="detail-row">
            <strong>Registro:</strong>
            <span>{{ usuarioSeleccionado.fecha }}</span>
          </div>

          <div class="detail-row">
            <strong>Estado:</strong>
            <v-chip
              size="small"
              :color="
                usuarioSeleccionado.estado === 'Activo'
                  ? 'success'
                  : 'warning'
              "
              variant="tonal"
            >
              {{ usuarioSeleccionado.estado }}
            </v-chip>
          </div>
        </v-card-text>

        <v-card-actions class="pa-5">
          <v-spacer />
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            @click="dialogo = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
.usuarios-page {
  min-height: 100vh;
  padding: 32px;
  background: #f6f8fc;
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
  color: #0f172a;
  letter-spacing: -1px;
}

.page-header p {
  color: #64748b;
  margin-top: 8px;
}

.stat-card,
.content-card {
  background: white;
  border: 1px solid #e8edf5;
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
  background: #dbeafe;
}

.green {
  background: #d1fae5;
}

.orange {
  background: #fef3c7;
}

.stat-card p {
  color: #64748b;
  font-size: 14px;
}

.stat-card h2 {
  color: #0f172a;
  font-size: 30px;
  font-weight: 800;
  margin-top: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header h2 {
  color: #0f172a;
  font-size: 19px;
  font-weight: 800;
}

.section-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 5px;
}

.table-wrapper {
  overflow-x: auto;
}

.user-cell,
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-cell strong {
  white-space: nowrap;
}

.avatar-text {
  color: #2563eb;
  font-weight: 800;
}

.detail-avatar {
  text-align: center;
}

.detail-avatar h3 {
  margin-top: 12px;
  color: #0f172a;
}

.detail-avatar p {
  color: #64748b;
  font-size: 13px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
  font-size: 14px;
}

.detail-row span {
  color: #64748b;
  text-align: right;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .usuarios-page {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .content-card {
    padding: 16px;
  }
}
</style>
