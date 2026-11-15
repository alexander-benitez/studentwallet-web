import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useFinanzasStore = defineStore('finanzas', () => {
  const movimientos = ref([])
  const categorias = ref([])
  const presupuestos = ref([])
  const balanceData = ref({ balance: 0, total_incomes: 0, total_expenses: 0 })
  const saldo = ref(0)
  const ingresos = ref(0)
  const gastos = ref(0)
  const cargando = ref(false)
  const error = ref(null)
  const perfil = ref({
    nombre: '',
    apellido: '',
    universidad: '',
    carrera: '',
  })
  const configuracion = ref({
    notificaciones: true,
    alertasPresupuesto: true,
    mostrarConsejos: true,
  })

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
  const CONFIG_KEY = 'studentwallet_config'

  function getHeaders () {
    const token = localStorage.getItem('auth_token')
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  // Convierte los tipos usados por la interfaz a los de la API
  function tipoApi (valor) {
    const tipo = String(valor ?? '').toLowerCase()
    return tipo === 'income' || tipo === 'ingreso' ? 'ingreso' : 'gasto'
  }

  // Normaliza una categoría para que las vistas tengan siempre el mismo formato
  function normalizarCategoria (raw = {}, fallback = {}) {
    const tipo = raw.type ?? raw.tipo ?? fallback.type ?? fallback.tipo ?? 'gasto'
    return {
      ...fallback,
      ...raw,
      id: raw.id ?? fallback.id,
      nombre: raw.nombre ?? raw.name ?? fallback.nombre ?? fallback.name ?? '',
      tipo,
      icono: raw.icono ?? raw.icon ?? fallback.icono ?? 'mdi-tag-outline',
      color: raw.color ?? fallback.color ?? '#2563EB',
    }
  }

  // Cargar categorías desde la API
  async function cargarCategorias () {
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() })
      if (res.ok) {
        const json = await res.json()
        const data = json.data || json || []
        categorias.value = data.map(categoria => normalizarCategoria(categoria))
      }
    } catch (error_) {
      console.error('Error al cargar categorías:', error_)
    }
  }

  // Cargar movimientos del usuario
  async function cargarMovimientos () {
    cargando.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}/transactions`, { headers: getHeaders() })
      if (res.ok) {
        const json = await res.json()
        movimientos.value = (json.data || json || []).map(movimiento => ({
          ...movimiento,
          description: movimiento.description ?? '',
        }))
      } else {
        error.value = 'No se pudieron obtener los movimientos.'
      }
    } catch (error_) {
      console.error('Error de red en transacciones:', error_)
      error.value = 'Error al conectar con el servidor.'
    } finally {
      cargando.value = false
    }
  }

  // Cargar balance financiero consolidado
  async function cargarBalance () {
    try {
      const res = await fetch(`${API_BASE}/balance`, { headers: getHeaders() })
      if (res.ok) {
        const json = await res.json()
        const data = json.data || json
        balanceData.value = data
        saldo.value = Number(data.balance ?? 0)
        ingresos.value = Number(data.total_incomes ?? 0)
        gastos.value = Number(data.total_expenses ?? 0)
      }
    } catch (error_) {
      console.error('Error al consultar balance:', error_)
    }
  }

  // Registrar nuevo movimiento
  async function agregarMovimiento (nuevoMovimiento) {
    cargando.value = true
    try {
      const type = nuevoMovimiento.type === 'ingreso' || nuevoMovimiento.type === 'income'
        ? 'ingreso'
        : 'gasto'
      const categoryId = nuevoMovimiento.category_id
        ?? nuevoMovimiento.category?.id
        ?? nuevoMovimiento.category?.value
        ?? nuevoMovimiento.category
      const payload = {
        amount: Number(nuevoMovimiento.amount),
        type,
        category_id: categoryId,
        description: nuevoMovimiento.description ?? nuevoMovimiento.name ?? '',
        date: nuevoMovimiento.date,
      }
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok) {
        // Refrescar lista y balance tras inserción exitosa
        await cargarMovimientos()
        await cargarBalance()
        return { ok: true, data: json }
      }
      return { ok: false, message: json.message || 'Error al guardar el movimiento' }
    } catch (error_) {
      console.error('Error al registrar movimiento:', error_)
      return { ok: false, message: 'Error de red al registrar movimiento' }
    } finally {
      cargando.value = false
    }
  }

  // Eliminar un movimiento
  async function eliminarMovimiento (id) {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (res.ok) {
        movimientos.value = movimientos.value.filter(
          movimiento => String(movimiento.id) !== String(id),
        )
        return { ok: true }
      }
      return { ok: false, mensaje: 'No se pudo eliminar el movimiento.' }
    } catch (error_) {
      console.error('Error al eliminar movimiento:', error_)
      return { ok: false, mensaje: 'Error de red al eliminar el movimiento.' }
    }
  }

  // Crear una categoría
  async function agregarCategoria (data) {
    try {
      const payload = {
        name: data.name ?? data.nombre,
        type: tipoApi(data.type ?? data.tipo),
        color: data.color || '#2563EB',
        icon: data.icono || data.icon || 'mdi-tag-outline',
      }
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok) {
        const creada = normalizarCategoria(json.data || json, data)
        categorias.value.push(creada)
        return { ok: true, mensaje: 'Categoría creada correctamente', data: creada }
      }
      console.error('ERROR BACKEND:', json)
      console.error('Error al crear categoría:', res.status, json)
      return {
        ok: false,
        mensaje: json?.message || 'No se pudo crear la categoría.',
      }
    } catch (error_) {
      console.error('Error al crear categoría:', error_)
      return { ok: false, mensaje: 'Error de red al crear la categoría.' }
    }
  }

  // Actualizar una categoría
  async function editarCategoria (id, data) {
    try {
      const payload = {
        name: data.name ?? data.nombre,
        type: tipoApi(data.type ?? data.tipo),
        color: data.color || '#2563EB',
        icon: data.icono || data.icon || 'mdi-tag-outline',
      }
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok) {
        const index = categorias.value.findIndex(
          categoria => String(categoria.id) === String(id),
        )
        const base = index === -1 ? {} : categorias.value[index]
        const actualizada = normalizarCategoria(json.data || json, {
          ...base,
          ...data,
        })
        if (index === -1) {
          categorias.value.push(actualizada)
        } else {
          categorias.value[index] = actualizada
        }
        return { ok: true, mensaje: 'Categoría actualizada correctamente', data: actualizada }
      }
      console.error('Error al actualizar categoría:', res.status, json)
      return {
        ok: false,
        mensaje: json?.message || 'No se pudo actualizar la categoría.',
      }
    } catch (error_) {
      console.error('Error al actualizar categoría:', error_)
      return { ok: false, mensaje: 'Error de red al actualizar la categoría.' }
    }
  }

  // Eliminar una categoría
  async function eliminarCategoria (id) {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (res.ok) {
        categorias.value = categorias.value.filter(
          categoria => String(categoria.id) !== String(id),
        )
        return { ok: true, mensaje: 'Categoría eliminada correctamente' }
      }
      return { ok: false, mensaje: 'No se pudo eliminar la categoría.' }
    } catch (error_) {
      console.error('Error al eliminar categoría:', error_)
      return { ok: false, mensaje: 'Error de red al eliminar la categoría.' }
    }
  }

  // Cargar presupuestos desde la API
  async function cargarPresupuestos (month, year) {
    try {
      const params = new URLSearchParams()

      if (month != null) {
        params.set('month', String(month))
      }

      if (year != null) {
        params.set('year', String(year))
      }

      const query = params.toString()
      const res = await fetch(`${API_BASE}/budgets${query ? `?${query}` : ''}`, {
        headers: getHeaders(),
      })

      if (res.ok) {
        const json = await res.json()
        presupuestos.value = json.data || []
      }
    } catch (error_) {
      console.error('Error al cargar presupuestos:', error_)
    }
  }

  // Crear o actualizar un presupuesto
  async function guardarPresupuesto (data) {
    try {
      const payload = {
        category_id: data.category_id,
        amount: Number(data.amount ?? data.limit),
        month: Number(data.month),
        year: Number(data.year),
      }

      const res = await fetch(`${API_BASE}/budgets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (res.ok) {
        const respuesta = json.data

        presupuestos.value = [
          ...presupuestos.value.filter(presupuesto => String(presupuesto.id) !== String(respuesta.id)),
          respuesta,
        ]

        return { ok: true, mensaje: 'Presupuesto guardado correctamente', data: respuesta }
      }

      return {
        ok: false,
        mensaje: json.message || 'No se pudo guardar el presupuesto.',
      }
    } catch (error_) {
      console.error('Error al guardar presupuesto:', error_)
      return { ok: false, mensaje: 'Error de red al guardar el presupuesto.' }
    }
  }

  // Eliminar un presupuesto
  async function eliminarPresupuesto (id) {
    try {
      const res = await fetch(`${API_BASE}/budgets/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (res.ok) {
        presupuestos.value = presupuestos.value.filter(
          presupuesto => String(presupuesto.id) !== String(id),
        )
        return { ok: true, mensaje: 'Presupuesto eliminado correctamente' }
      }

      const json = await res.json()
      return { ok: false, mensaje: json.message || 'No se pudo eliminar el presupuesto.' }
    } catch (error_) {
      console.error('Error al eliminar presupuesto:', error_)
      return { ok: false, mensaje: 'Error de red al eliminar el presupuesto.' }
    }
  }

  // Cargar el perfil del usuario autenticado desde la API
  async function cargarPerfil () {
    try {
      const res = await fetch(`${API_BASE}/user`, { headers: getHeaders() })
      if (res.ok) {
        const json = await res.json()
        const u = json.data || json

        perfil.value = {
          nombre: u.name ?? u.nombre ?? '',
          apellido: u.apellido ?? '',
          universidad: u.universidad ?? '',
          carrera: u.carrera ?? '',
        }

        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')

        localStorage.setItem(
          'user_info',
          JSON.stringify({
            ...userInfo,
            name: perfil.value.nombre,
            apellido: perfil.value.apellido,
          }),
        )
      }
    } catch (error_) {
      console.error('Error al cargar perfil:', error_)
    }
  }

  // Actualizar el perfil en la API
  async function actualizarPerfil (data) {
    try {
      const payload = {
        name: data.nombre ?? data.name ?? undefined,
        apellido: data.apellido ?? undefined,
        universidad: data.universidad ?? undefined,
        carrera: data.carrera ?? undefined,
      }

      const res = await fetch(`${API_BASE}/user`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (res.ok) {
        await cargarPerfil()
        return { ok: true, mensaje: 'Tu perfil se actualizó correctamente' }
      }

      return {
        ok: false,
        mensaje: json.message || 'No se pudo actualizar el perfil.',
      }
    } catch (error_) {
      console.error('Error al actualizar perfil:', error_)
      return { ok: false, mensaje: 'Error de red al actualizar el perfil.' }
    }
  }

  function guardarConfiguracion () {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(configuracion.value))
  }

  function cargarConfiguracion () {
    try {
      const raw = localStorage.getItem(CONFIG_KEY)
      if (raw) {
        configuracion.value = { ...configuracion.value, ...JSON.parse(raw) }
      }
    } catch (error_) {
      console.error('Error al leer la configuración:', error_)
    }
  }

  function actualizarConfiguracion (patch) {
    configuracion.value = { ...configuracion.value, ...patch }
    guardarConfiguracion()
  }

  function restablecerConfiguracion () {
    configuracion.value = {
      notificaciones: true,
      alertasPresupuesto: true,
      mostrarConsejos: true,
    }
    guardarConfiguracion()
  }

  cargarConfiguracion()

  // Getters computados
  const saldoActual = computed(() => saldo.value)
  const totalIngresos = computed(() => ingresos.value)
  const nombreCompleto = computed(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user_info'))
      return u?.name || 'Estudiante'
    } catch {
      return 'Estudiante'
    }
  })
  const iniciales = computed(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user_info'))
      const nombre = String(u?.name || u?.nombre || '').trim()
      if (!nombre) {
        return 'U'
      }

      const partes = nombre.split(/\s+/).filter(Boolean)
      const primera = partes[0]?.charAt(0) || ''
      const ultima = partes.length > 1 ? partes.at(-1).charAt(0) : ''
      return `${primera}${ultima}`.toUpperCase() || 'U'
    } catch {
      return 'U'
    }
  })
  const totalGastos = computed(() => gastos.value)

  return {
    movimientos,
    categorias,
    presupuestos,
    balanceData,
    saldo,
    ingresos,
    gastos,
    cargando,
    error,
    perfil,
    configuracion,
    saldoActual,
    totalIngresos,
    totalGastos,
    nombreCompleto,
    iniciales,
    cargarCategorias,
    cargarMovimientos,
    cargarBalance,
    cargarPresupuestos,
    cargarPerfil,
    actualizarPerfil,
    actualizarConfiguracion,
    restablecerConfiguracion,
    agregarMovimiento,
    eliminarMovimiento,
    agregarCategoria,
    editarCategoria,
    eliminarCategoria,
    guardarPresupuesto,
    eliminarPresupuesto,
  }
})
