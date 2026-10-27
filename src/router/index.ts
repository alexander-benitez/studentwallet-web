
/**
 * StudentWallet - Configuración de rutas
 */

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // Login
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },

    // Registro
    {
      path: '/registro',
      name: 'registro',
      component: () => import('@/views/RegisterView.vue'),
    },

    // Dashboard
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },

    // Ingresos
    {
      path: '/ingresos',
      name: 'ingresos',
      component: () => import('@/views/IngresosView.vue'),
    },
    {
  path: '/gastos',
  name: 'gastos',
  component: () => import('@/views/GastosView.vue'),
},
{
  path: '/movimientos',
  name: 'movimientos',
  component: () => import('@/views/MovimientosView.vue'),
},
{
  path: '/presupuestos',
  name: 'presupuestos',
  component: () => import('@/views/PresupuestosView.vue'),
},
{
  path: '/metas',
  name: 'metas',
  component: () => import('@/views/MetasView.vue'),
},
{
  path: '/estadisticas',
  name: 'estadisticas',
  component: () => import('@/views/EstadisticasView.vue'),
},
{
  path: '/perfil',
  name: 'perfil',
  component: () => import('@/views/PerfilView.vue'),
},
{
  path: '/configuracion',
  name: 'configuracion',
  component: () => import('@/views/ConfiguracionView.vue'),
},
{
  path: '/admin',
  name: 'admin-dashboard',
  component: () => import('@/views/AdminDashboardView.vue'),
},
{
  path: '/sugerencias',
  name: 'sugerencias',
  component: () => import('@/views/SugerenciasView.vue'),
},
{
  path: '/admin/comentarios',
  name: 'admin-comentarios',
  component: () => import('@/views/AdminComentariosView.vue'),
},
{
  path: '/admin/usuarios',
  name: 'admin-usuarios',
  component: () => import('@/views/AdminUsuariosView.vue'),
},
{
  path: '/admin/finanzas',
  name: 'admin-finanzas',
  component: () => import('@/views/AdminFinanzasView.vue'),
},
{
  path: '/admin/reportes',
  name: 'admin-reportes',
  component: () => import('@/views/AdminReportesView.vue'),
},
{
  path: '/admin/configuracion',
  name: 'admin-configuracion',
  component: () => import('@/views/AdminConfiguracionView.vue'),
},
{
  path: '/categorias',
  name: 'categorias',
  component: () => import('@/views/CategoriasView.vue'),
},
  ],

})

export default router
