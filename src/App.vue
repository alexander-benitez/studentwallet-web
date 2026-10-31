
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/MainLayout.vue'
import AdminLayout from '@/components/AdminLayout.vue'

const route = useRoute()

const paginasPublicas = ['/', '/registro']

const esPaginaPublica = computed(() =>
  paginasPublicas.includes(route.path)
)

const esAdministrador = computed(() =>
  route.path === '/admin' ||
  route.path.startsWith('/admin/')
)
</script>

<template>
  <v-app>
    <router-view v-slot="{ Component }">
      <!-- PÁGINAS PÚBLICAS -->
      <component
        :is="Component"
        v-if="esPaginaPublica"
      />

      <!-- PÁGINAS DE ADMINISTRADOR -->
      <AdminLayout v-else-if="esAdministrador">
        <component :is="Component" />
      </AdminLayout>

      <!-- PÁGINAS DE USUARIO -->
      <MainLayout v-else>
        <component :is="Component" />
      </MainLayout>
    </router-view>
  </v-app>
</template>
