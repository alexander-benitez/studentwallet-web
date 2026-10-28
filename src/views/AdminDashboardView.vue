
<script setup>
import { ref } from 'vue'

const usuarios = ref([
  {
    id: 1,
    nombre: 'María López',
    correo: 'maria@ejemplo.com',
    estado: 'Activo',
    rol: 'Estudiante',
  },
  {
    id: 2,
    nombre: 'Carlos Pérez',
    correo: 'carlos@ejemplo.com',
    estado: 'Activo',
    rol: 'Estudiante',
  },
  {
    id: 3,
    nombre: 'Ana Martínez',
    correo: 'ana@ejemplo.com',
    estado: 'Inactivo',
    rol: 'Estudiante',
  },
])

const estadisticas = [
  {
    titulo: 'Usuarios registrados',
    valor: '128',
    icono: 'mdi-account-group-outline',
    color: '#2563EB',
    fondo: '#DBEAFE',
  },
  {
    titulo: 'Usuarios activos',
    valor: '96',
    icono: 'mdi-account-check-outline',
    color: '#10B981',
    fondo: '#D1FAE5',
  },
  {
    titulo: 'Movimientos',
    valor: '1,452',
    icono: 'mdi-swap-horizontal',
    color: '#7C3AED',
    fondo: '#EDE9FE',
  },
  {
    titulo: 'Cuentas bloqueadas',
    valor: '3',
    icono: 'mdi-shield-alert-outline',
    color: '#F59E0B',
    fondo: '#FEF3C7',
  },
]
</script>

<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <div>
        <v-chip
          color="primary"
          variant="tonal"
          size="small"
          class="mb-3"
        >
          Administración
        </v-chip>

        <h1>Panel de administrador</h1>

        <p>
          Supervisa la actividad general de StudentWallet.
        </p>
      </div>

      <v-chip color="info" variant="tonal">
        Modo demostración
      </v-chip>
    </div>

    <v-row class="mt-4">
      <v-col
        v-for="item in estadisticas"
        :key="item.titulo"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card class="stat-card" elevation="0">
          <div
            class="stat-icon"
            :style="{ background: item.fondo }"
          >
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
              <tr
                v-for="usuario in usuarios"
                :key="usuario.id"
              >
                <td>{{ usuario.nombre }}</td>
                <td>{{ usuario.correo }}</td>
                <td>{{ usuario.rol }}</td>
                <td>
                  <v-chip
                    size="small"
                    :color="
                      usuario.estado === 'Activo'
                        ? 'success'
                        : 'warning'
                    "
                    variant="tonal"
                  >
                    {{ usuario.estado }}
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
            <v-icon color="success">
              mdi-check-circle
            </v-icon>
            Dashboard estudiantil
          </div>

          <div class="system-item">
            <v-icon color="success">
              mdi-check-circle
            </v-icon>
            Registro e inicio de sesión
          </div>

          <div class="system-item">
            <v-icon color="warning">
              mdi-clock-outline
            </v-icon>
            Autenticación con backend
          </div>

          <div class="system-item">
            <v-icon color="warning">
              mdi-clock-outline
            </v-icon>
            Gestión real de usuarios
          </div>

          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="mt-5"
          >
            Los datos administrativos son
            demostrativos.
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
  margin-top: 8px;
  color: #64748b;
}

.stat-card,
.content-card {
  background: white;
  border: 1px solid #e8edf5;
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
  color: #64748b;
}

.stat-card h2 {
  font-size: 30px;
  color: #0f172a;
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
  color: #0f172a;
}

.section-header p {
  font-size: 13px;
  color: #64748b;
  margin-top: 5px;
}

.system-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #334155;
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
