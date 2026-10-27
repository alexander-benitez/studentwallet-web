
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
      color="white"
      elevation="0"
      border="b"
      height="72"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
      />

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
}

.page-title {
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}

.main-content {
  min-height: 100vh;
  background: #f6f8fc;
}
</style>
