
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
    <router-view v-if="esPaginaPublica" />

    <AdminLayout v-else-if="esAdministrador">
      <router-view />
    </AdminLayout>

    <MainLayout v-else>
      <router-view />
    </MainLayout>
  </v-app>
</template>
