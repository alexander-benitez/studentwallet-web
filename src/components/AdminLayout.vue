
<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/AdminSidebar.vue'

const route = useRoute()
const drawer = ref(true)

const titulos = {
  '/admin': 'Dashboard administrativo',
  '/admin/usuarios': 'Gestión de usuarios',
  '/admin/finanzas': 'Supervisión financiera',
  '/admin/comentarios': 'Comentarios y sugerencias',
  '/admin/reportes': 'Reportes',
  '/admin/configuracion': 'Configuración',
}

const tituloPagina = computed(() =>
  titulos[route.path] || 'Administración'
)

watch(
  () => route.path,
  () => {
    if (window.innerWidth < 960) {
      drawer.value = false
    }
  }
)
</script>

<template>
  <v-layout class="admin-layout">
    <AdminSidebar v-model="drawer" />

    <v-app-bar
      color="white"
      elevation="0"
      border="b"
      height="72"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title class="page-title">
        {{ tituloPagina }}
      </v-toolbar-title>

      <v-spacer />

      <v-chip
        color="primary"
        variant="tonal"
        class="mr-4"
      >
        Administrador
      </v-chip>
    </v-app-bar>

    <v-main class="admin-main">
      <slot />
    </v-main>
  </v-layout>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.page-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.admin-main {
  min-height: 100vh;
  background: #f6f8fc;
}
</style>
