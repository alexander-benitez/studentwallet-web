
<script setup>
import { useRoute } from 'vue-router'

defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const route = useRoute()

const menu = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
    to: '/admin',
  },
  {
    title: 'Usuarios',
    icon: 'mdi-account-group-outline',
    to: '/admin/usuarios',
  },
  {
    title: 'Finanzas',
    icon: 'mdi-finance',
    to: '/admin/finanzas',
  },
  {
    title: 'Comentarios',
    icon: 'mdi-message-text-outline',
    to: '/admin/comentarios',
  },
  {
    title: 'Reportes',
    icon: 'mdi-file-chart-outline',
    to: '/admin/reportes',
  },
  {
    title: 'Configuración',
    icon: 'mdi-cog-outline',
    to: '/admin/configuracion',
  },
]
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    width="270"
    color="#14213D"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="sidebar-content">
      <div class="brand">
        <div class="brand-icon">
          <v-icon color="white" size="27">
            mdi-shield-crown-outline
          </v-icon>
        </div>

        <div>
          <h2>StudentWallet</h2>
          <span>ADMINISTRACIÓN</span>
        </div>
      </div>

      <div class="menu-label">
        MENÚ ADMINISTRATIVO
      </div>

      <v-list nav class="menu-list">
        <v-list-item
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="route.path === item.to"
          active-class="admin-active"
          rounded="lg"
          class="menu-item"
        />
      </v-list>

      <v-spacer />

      <div class="sidebar-footer">
        <div class="admin-profile">
          <v-avatar color="#7C3AED" size="40">
            <v-icon color="white">
              mdi-shield-account
            </v-icon>
          </v-avatar>

          <div>
            <strong>Administrador</strong>
            <span>Panel de control</span>
          </div>
        </div>

        <v-btn
          to="/"
          variant="tonal"
          color="white"
          block
          prepend-icon="mdi-logout"
          class="mt-4"
        >
          Cerrar sesión
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 32px;
  color: white;
}

.brand-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand h2 {
  font-size: 17px;
  font-weight: 800;
}

.brand span {
  font-size: 10px;
  color: #a5b4fc;
  letter-spacing: 1.5px;
}

.menu-label {
  font-size: 11px;
  color: #94a3b8;
  letter-spacing: 1px;
  padding: 0 18px 12px;
}

.menu-list {
  background: transparent;
}

.menu-item {
  color: #cbd5e1;
  margin-bottom: 6px;
}

.menu-item:hover {
  background: #ffffff12;
}

:deep(.admin-active) {
  background: #2563eb !important;
  color: white !important;
}

.sidebar-footer {
  padding: 20px 10px 0;
  border-top: 1px solid #ffffff20;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-profile strong {
  display: block;
  color: white;
  font-size: 13px;
}

.admin-profile span {
  display: block;
  color: #94a3b8;
  font-size: 11px;
}
</style>
