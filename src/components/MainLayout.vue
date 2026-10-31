
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'

const route = useRoute()

const drawer = ref(true)

// Cerrar el menú móvil al cambiar de página
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
  <v-layout class="main-layout">
    <!-- MENÚ LATERAL -->
    <AppSidebar v-model="drawer" />

    <!-- BARRA SUPERIOR -->
    <v-app-bar
      color="surface"
      elevation="0"
      border="b"
      height="72"
      class="main-app-bar"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title class="page-title">
        StudentWallet
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        icon
        variant="text"
        to="/perfil"
      >
        <v-icon>mdi-account-circle-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- CONTENIDO DE CADA PÁGINA -->
    <v-main class="main-content">
      <slot />
    </v-main>
  </v-layout>
</template>


<style scoped>

.main-layout {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.main-app-bar {
  background: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
  border-color: rgba(var(--v-theme-on-surface), 0.12) !important;
}

.page-title {
  font-size: 17px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.main-content {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
}

</style>
