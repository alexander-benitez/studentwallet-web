<script setup>
import { ref, computed, onMounted } from 'vue'

const usuarios = ref([])
const cargando = ref(false)

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
const usuariosActivos = computed(() => usuarios.value.filter(u => u.is_active === 1).length)
const usuariosInactivos = computed(() => usuarios.value.filter(u => u.is_active === 0).length)

const estadisticas = computed(() => [
  {
    titulo: 'Usuarios registrados',
    valor: totalUsuarios.value,
    icono: 'mdi-account-group-outline',
    color: '#2563EB',
    fondo: '#DBEAFE',
  },
  {
    titulo: 'Usuarios activos',
    valor: usuariosActivos.value,
    icono: 'mdi-account-check-outline',
    color: '#10B981',
    fondo: '#D1FAE5',
  },
  {
    titulo: 'Usuarios inactivos',
    valor: usuariosInactivos.value,
    icono: 'mdi-account-off-outline',
    color: '#F59E0B',
    fondo: '#FEF3C7',
  },
  {
    titulo: 'Total de movimientos',
    valor: '—',
    icono: 'mdi-swap-horizontal',
    color: '#7C3AED',
    fondo: '#EDE9FE',
  },
])
</script>

<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <div>
        <v-chip color="primary" variant="tonal" size="small" class="mb-3">
          Administración
        </v-chip>

        <h1>Panel de administrador</h1>

        <p>
          Supervisa la actividad general de StudentWallet.
        </p>
      </div>

      <v-chip color="info" variant="tonal">
        Módulo en integración con API (Sprint 4)
      </v-chip>
    </div>

    <v-row class="mt-4">
      <v-col v-for="item in estadisticas" :key="item.titulo" cols="12" sm="6" lg="3">
        <v-card class="stat-card" elevation="0">
          <div class="stat-icon" :style="{ background: item.fondo }">
            <v-icon :color="item.color" size="27">
              {{ item.icono }}
            </v-icon>
          </div>

          <p class="stat-title">{{ item.titulo }}</p>
          <h2>{{ item.valor }}</h2>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" lg="8">
        <v-card class="content-card" elevation="0">
          <div class="section-header">
            <div>
              <h3>Usuarios recientes</h3>
              <p>Vista general de cuentas registradas</p>
            </div>

            <v-icon color="primary">
              mdi-account-group-outline
            </v-icon>
          </div>

          <v-table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="usuarios.length === 0">
                <td colspan="4" class="text-center py-4">
                  {{ cargando ? 'Cargando usuarios...' : 'No hay usuarios registrados.' }}
                </td>
              </tr>
              <tr v-for="usuario in usuarios" :key="usuario.id">
                <td>{{ usuario.name }}</td>
                <td>{{ usuario.email }}</td>
                <td>{{ usuario.rol }}</td>
                <td>
                  <v-chip size="small" :color="usuario.is_active === 1 ? 'success' : 'warning'" variant="tonal">
                    {{ usuario.is_active === 1 ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card class="content-card" elevation="0">
          <div class="section-header">
            <div>
              <h3>Estado del sistema</h3>
              <p>Resumen de funcionalidades</p>
            </div>
          </div>

          <div class="system-item">
            <v-icon color="success">mdi-check-circle</v-icon>
            Dashboard estudiantil
          </div>

          <div class="system-item">
            <v-icon color="success">mdi-check-circle</v-icon>
            Registro e inicio de sesión
          </div>

          <div class="system-item">
            <v-icon color="success">mdi-check-circle</v-icon>
            Autenticación con backend
          </div>

          <div class="system-item">
            <v-icon color="success">mdi-check-circle</v-icon>
            Gestión real de usuarios
          </div>

          <v-alert type="info" variant="tonal" density="comfortable" class="mt-5">
            Los datos mostrados son reales y provienen de la base de datos.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.admin-dashboard {
  padding: 32px;
  min-height: 100vh;
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
  margin-top: 8px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.stat-card,
.content-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  border-radius: 18px;
  padding: 24px;
  height: 100%;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.stat-title {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.stat-card h2 {
  font-size: 30px;
  color: rgb(var(--v-theme-on-surface));
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
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

.system-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

.content-card :deep(.v-table) {
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
}

.content-card :deep(table) {
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

@media (max-width: 600px) {
  .admin-dashboard {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .content-card {
    overflow-x: auto;
  }
}
</style>