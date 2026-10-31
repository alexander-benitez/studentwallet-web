
<script setup>
import { useRoute } from 'vue-router'
import { useFinanzasStore } from '@/stores/finanzas'

const route = useRoute()
const finanzas = useFinanzasStore()

defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const menu = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
  { title: 'Ingresos', icon: 'mdi-trending-up', to: '/ingresos' },
  { title: 'Gastos', icon: 'mdi-trending-down', to: '/gastos' },
  { title: 'Movimientos', icon: 'mdi-swap-horizontal', to: '/movimientos' },
  {title: 'Mis categorías',icon: 'mdi-shape-outline',to: '/categorias',},
  { title: 'Presupuestos', icon: 'mdi-chart-donut', to: '/presupuestos' },
  { title: 'Metas de ahorro', icon: 'mdi-piggy-bank-outline', to: '/metas' },
  { title: 'Estadísticas', icon: 'mdi-chart-bar', to: '/estadisticas' },
  {title: 'Sugerencias y mejoras',icon: 'mdi-message-text-outline',to: '/sugerencias',},
  { title: 'Mi perfil', icon: 'mdi-account-circle-outline', to: '/perfil' },
  { title: 'Configuración', icon: 'mdi-cog-outline', to: '/configuracion' },
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
          <v-icon color="white" size="26">
            mdi-wallet-outline
          </v-icon>
        </div>

        <div>
          <h2>StudentWallet</h2>
          <span>Finanzas inteligentes</span>
        </div>
      </div>

      <v-divider class="mb-5" color="white" opacity="0.15" />

      <div class="menu-label">MENÚ PRINCIPAL</div>

      <v-list nav density="comfortable" class="menu-list">
        <v-list-item
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="route.path === item.to"
          active-class="sidebar-active"
          rounded="lg"
          class="menu-item"
        />
      </v-list>

      <v-spacer />

      <div class="sidebar-footer">
        <v-divider color="white" opacity="0.15" class="mb-4" />

        <div class="user-info">
          <v-avatar color="#2563EB" size="42">
            {{ finanzas.iniciales }}
          </v-avatar>

          <div class="user-text">
            <strong>{{ finanzas.nombreCompleto }}</strong>
            <span>Estudiante</span>
          </div>
        </div>

        <v-btn
          block
          variant="text"
          color="white"
          prepend-icon="mdi-logout"
          class="mt-4"
          to="/"
        >
          Cerrar sesión
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 25px;
}

.brand-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand h2 {
  font-size: 18px;
  font-weight: 800;
  color: white;
}

.brand span {
  font-size: 11px;
  color: #94a3b8;
}

.menu-label {
  padding: 0 14px 10px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.3px;
  color: #64748b;
}

.menu-list {
  padding: 0;
}

.menu-item {
  color: #cbd5e1;
  margin-bottom: 5px;
  font-size: 13px;
}

.menu-item:hover {
  background: #ffffff12;
}

.sidebar-active {
  background: #2563eb !important;
  color: white !important;
}

.sidebar-footer {
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 10px;
}

.user-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-text strong {
  font-size: 13px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-text span {
  color: #94a3b8;
  font-size: 11px;
}
</style>
