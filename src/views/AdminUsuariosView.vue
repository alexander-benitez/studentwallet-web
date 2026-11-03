<script setup>
import { ref, computed, onMounted } from 'vue'

const usuarios = ref([])
const cargando = ref(false)

const busqueda = ref('')
const filtroEstado = ref('Todos')
const filtroRol = ref('Todos')

const dialogo = ref(false)
const usuarioSeleccionado = ref(null)

const snackbar = ref(false)
const mensaje = ref('')

async function cargarUsuarios() {
  cargando.value = true
  try {
    const token = localStorage.getItem('auth_token')
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    const res = await response.json()
    if (response.ok && res.data) {
      usuarios.value = res.data
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarUsuarios()
})

const totalUsuarios = computed(() => usuarios.value.length)
const activos = computed(() => usuarios.value.filter(u => u.is_active === 1).length)
const inactivos = computed(() => usuarios.value.filter(u => u.is_active === 0).length)

const usuariosFiltrados = computed(() => {
  const texto = String(busqueda.value || '').toLowerCase().trim()

  return usuarios.value.filter(usuario => {
    const coincideBusqueda =
      (usuario.name || '').toLowerCase().includes(texto) ||
      (usuario.email || '').toLowerCase().includes(texto)

    const coincideEstado =
      filtroEstado.value === 'Todos' ||
      (filtroEstado.value === 'Activo' && usuario.is_active === 1) ||
      (filtroEstado.value === 'Inactivo' && usuario.is_active === 0)

    const coincideRol =
      filtroRol.value === 'Todos' ||
      (filtroRol.value === 'Estudiante' && usuario.rol === 'estudiante') ||
      (filtroRol.value === 'Administrador' && usuario.rol === 'administrador')

    return coincideBusqueda && coincideEstado && coincideRol
  })
})

function verUsuario(usuario) {
  usuarioSeleccionado.value = usuario
  dialogo.value = true
}

async function cambiarEstado(usuario) {
  const nuevoEstado = usuario.is_active === 1 ? 0 : 1
  try {
    const token = localStorage.getItem('auth_token')
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

    const response = await fetch(`${API_BASE}/admin/users/${usuario.id}/status`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_active: nuevoEstado })
    })

    if (response.ok) {
      usuario.is_active = nuevoEstado
      mensaje.value = `La cuenta de ${usuario.name} ahora está ${nuevoEstado === 1 ? 'activa' : 'inactiva'}.`
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error)
  }
}

function iniciales(nombre) {
  if (!nombre) return ''
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

      <v-chip color="success" variant="tonal">
        Conectado a la API real
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
        v-if="usuariosFiltrados.length === 0 && !cargando"
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
                      {{ iniciales(usuario.name) }}
                    </span>
                  </v-avatar>

                  <strong>{{ usuario.name }}</strong>
                </div>
              </td>

              <td>{{ usuario.email }}</td>
              <td>{{ usuario.rol }}</td>

              <td>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="usuario.is_active === 1 ? 'success' : 'warning'"
                >
                  {{ usuario.is_active === 1 ? 'Activo' : 'Inactivo' }}
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
                    :icon="usuario.is_active === 1 ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
                    variant="text"
                    :color="usuario.is_active === 1 ? 'warning' : 'success'"
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
                {{ iniciales(usuarioSeleccionado.name) }}
              </span>
            </v-avatar>

            <h3>{{ usuarioSeleccionado.name }}</h3>
            <p>{{ usuarioSeleccionado.rol }}</p>
          </div>

          <v-divider class="my-5" />

          <div class="detail-row">
            <strong>Correo:</strong>
            <span>{{ usuarioSeleccionado.email }}</span>
          </div>

          <div class="detail-row">
            <strong>Rol:</strong>
            <span>{{ usuarioSeleccionado.rol }}</span>
          </div>

          <div class="detail-row">
            <strong>Estado:</strong>
            <v-chip
              size="small"
              :color="usuarioSeleccionado.is_active === 1 ? 'success' : 'warning'"
              variant="tonal"
            >
              {{ usuarioSeleccionado.is_active === 1 ? 'Activo' : 'Inactivo' }}
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
.content-card {
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

.green {
  background: rgba(var(--v-theme-success), 0.14);
}

.orange {
  background: rgba(var(--v-theme-warning), 0.16);
}

.stat-card p {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
}

.stat-card h2 {
  color: rgb(var(--v-theme-on-surface));
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
  color: rgb(var(--v-theme-on-surface));
  font-size: 19px;
  font-weight: 800;
}

.section-header p {
  color: rgb(var(--v-theme-on-surface-variant));
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
  color: rgb(var(--v-theme-on-surface));
}

.avatar-text {
  color: #2563eb;
  font-weight: 800;
}

.content-card :deep(.v-table) {
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
}

.content-card :deep(th) {
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 700;
  white-space: nowrap;
}

.content-card :deep(td) {
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

.content-card :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

:deep(.v-dialog .v-card) {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.detail-avatar {
  text-align: center;
}

.detail-avatar h3 {
  margin-top: 12px;
  color: rgb(var(--v-theme-on-surface));
}

.detail-avatar p {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 13px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 17px;
  font-size: 14px;
}

.detail-row strong {
  color: rgb(var(--v-theme-on-surface));
}

.detail-row span {
  color: rgb(var(--v-theme-on-surface-variant));
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