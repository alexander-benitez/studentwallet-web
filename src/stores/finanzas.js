
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useFinanzasStore = defineStore('finanzas', () => {
  
  const obtenerMovimientos = () => {
    try {
      const datos = localStorage.getItem('studentwallet_movimientos')
      return datos ? JSON.parse(datos) : []
    } catch {
      return []
    }
  }

  const movimientos = ref(obtenerMovimientos())

  
const obtenerPresupuestos = () => {
  try {
    const datos = localStorage.getItem('studentwallet_presupuestos')
    const resultado = datos ? JSON.parse(datos) : []
    return Array.isArray(resultado) ? resultado : []
  } catch {
    return []
  }
}

const presupuestos = ref(obtenerPresupuestos())

function guardarPresupuesto(presupuesto) {
  const existente = presupuestos.value.findIndex(
    p => p.category === presupuesto.category &&
         p.month === presupuesto.month
  )

  const nuevo = {
    category: presupuesto.category,
    month: presupuesto.month,
    limit: Number(presupuesto.limit),
  }

  if (existente >= 0) {
    presupuestos.value[existente] = nuevo
  } else {
    presupuestos.value.push(nuevo)
  }
}

function eliminarPresupuesto(category, month) {
  presupuestos.value = presupuestos.value.filter(
    p => !(p.category === category && p.month === month)
  )
}

watch(
  presupuestos,
  nuevos => {
    localStorage.setItem(
      'studentwallet_presupuestos',
      JSON.stringify(nuevos)
    )
  },
  { deep: true }
)


  const ingresos = computed(() =>
    movimientos.value
      .filter((m) => m.type === 'income')
      .reduce((total, m) => total + Number(m.amount), 0)
  )

  const gastos = computed(() =>
    movimientos.value
      .filter((m) => m.type === 'expense')
      .reduce((total, m) => total + Number(m.amount), 0)
  )

  const saldo = computed(() => ingresos.value - gastos.value)

  function agregarMovimiento(movimiento) {
    movimientos.value.unshift({
      ...movimiento,
      id: crypto.randomUUID(),
      date: movimiento.date || new Date().toISOString().slice(0, 10),
    })
  }

  
function eliminarMovimiento(id) {
  movimientos.value = movimientos.value.filter(
    (movimiento) => movimiento.id !== id
  )
}


  watch(
    movimientos,
    (nuevosMovimientos) => {
      localStorage.setItem(
        'studentwallet_movimientos',
        JSON.stringify(nuevosMovimientos)
      )
    },
    { deep: true }
  )

  
// METAS DE AHORRO

const obtenerMetas = () => {
  try {
    const datos = localStorage.getItem('studentwallet_metas')
    const resultado = datos ? JSON.parse(datos) : []
    return Array.isArray(resultado) ? resultado : []
  } catch {
    return []
  }
}

const metas = ref(obtenerMetas())

function agregarMeta(meta) {
  const objetivo = Number(meta.target)

  if (!Number.isFinite(objetivo) || objetivo <= 0) {
    return false
  }

  metas.value.unshift({
    id: crypto.randomUUID(),
    name: meta.name,
    target: objetivo,
    saved: 0,
    deadline: meta.deadline || '',
    icon: meta.icon || 'mdi-bullseye-arrow',
    createdAt: new Date().toISOString(),
  })

  return true
}

function agregarAhorro(id, cantidad) {
  const meta = metas.value.find(m => m.id === id)
  const monto = Number(cantidad)

  if (!meta || !Number.isFinite(monto) || monto <= 0) {
    return false
  }

  if (monto > meta.target - meta.saved) {
    return false
  }

  meta.saved += monto
  return true
}

function eliminarMeta(id) {
  metas.value = metas.value.filter(m => m.id !== id)
}

const totalAhorrado = computed(() =>
  metas.value.reduce(
    (total, meta) => total + Number(meta.saved),
    0
  )
)

watch(
  metas,
  nuevasMetas => {
    localStorage.setItem(
      'studentwallet_metas',
      JSON.stringify(nuevasMetas)
    )
  },
  { deep: true }
)


// PERFIL DEL USUARIO

const obtenerPerfil = () => {
  try {
    const datos = localStorage.getItem('studentwallet_perfil')
    const perfilGuardado = datos ? JSON.parse(datos) : {}

    return {
      nombre: perfilGuardado.nombre || '',
      apellido: perfilGuardado.apellido || '',
      correo: perfilGuardado.correo || '',
      universidad: perfilGuardado.universidad || '',
      carrera: perfilGuardado.carrera || '',
      foto: perfilGuardado.foto || '',
    }
  } catch {
    return {
      nombre: '',
      apellido: '',
      correo: '',
      universidad: '',
      carrera: '',
      foto: '',
    }
  }
}

const perfil = ref(obtenerPerfil())

const nombreCompleto = computed(() => {
  const nombre = `${perfil.value.nombre} ${perfil.value.apellido}`.trim()
  return nombre || 'Estudiante'
})

const iniciales = computed(() => {
  const nombre = perfil.value.nombre?.charAt(0) || 'E'
  const apellido = perfil.value.apellido?.charAt(0) || ''
  return `${nombre}${apellido}`.toUpperCase()
})

function actualizarPerfil(datos) {
  perfil.value = {
    ...perfil.value,
    nombre: String(datos.nombre || '').trim(),
    apellido: String(datos.apellido || '').trim(),
    correo: String(datos.correo || '').trim(),
    universidad: String(datos.universidad || '').trim(),
    carrera: String(datos.carrera || '').trim(),
  }
}

watch(
  perfil,
  nuevoPerfil => {
    localStorage.setItem(
      'studentwallet_perfil',
      JSON.stringify(nuevoPerfil)
    )
  },
  { deep: true }
)


// CONFIGURACIÓN DE STUDENTWALLET

const obtenerConfiguracion = () => {
  const valoresIniciales = {
    moneda: 'USD',
    notificaciones: true,
    alertasPresupuesto: true,
    mostrarConsejos: true,
  }

  try {
    const datos = localStorage.getItem('studentwallet_configuracion')
    const guardado = datos ? JSON.parse(datos) : {}

    return {
      ...valoresIniciales,
      ...(guardado && typeof guardado === 'object' &&
        !Array.isArray(guardado) ? guardado : {}),
    }
  } catch {
    return valoresIniciales
  }
}

const configuracion = ref(obtenerConfiguracion())

function actualizarConfiguracion(nuevosDatos) {
  configuracion.value = {
    ...configuracion.value,
    ...nuevosDatos,
  }
}

function restablecerConfiguracion() {
  configuracion.value = {
    moneda: 'USD',
    notificaciones: true,
    alertasPresupuesto: true,
    mostrarConsejos: true,
  }
}

watch(
  configuracion,
  nuevaConfiguracion => {
    localStorage.setItem(
      'studentwallet_configuracion',
      JSON.stringify(nuevaConfiguracion)
    )
  },
  { deep: true }
)


const obtenerComentarios = () => {
  try {
    const datos = localStorage.getItem('studentwallet_comentarios')
    const resultado = datos ? JSON.parse(datos) : []
    return Array.isArray(resultado) ? resultado : []
  } catch {
    return []
  }
}

const comentarios = ref(obtenerComentarios())

function agregarComentario(datos) {
  const texto = String(datos.comentario || '').trim()

  if (texto.length < 10) {
    return false
  }

  comentarios.value.unshift({
    id: crypto.randomUUID(),
    usuario: datos.usuario,
    categoria: datos.categoria,
    comentario: texto,
    calificacion: Number(datos.calificacion),
    estado: 'Pendiente',
    fecha: new Date().toLocaleDateString('es-SV'),
  })

  return true
}

function actualizarEstadoComentario(id, estado) {
  const estadosPermitidos = [
    'Pendiente',
    'En revisión',
    'Resuelto',
  ]

  if (!estadosPermitidos.includes(estado)) return

  const item = comentarios.value.find((c) => c.id === id)
  if (item) item.estado = estado
}

watch(
  comentarios,
  (nuevos) => {
    localStorage.setItem(
      'studentwallet_comentarios',
      JSON.stringify(nuevos)
    )
  },
  { deep: true }
)


  // CATEGORÍAS PERSONALIZADAS

  const categoriasIniciales = [
    {
      id: 'gasto-alimentacion',
      nombre: 'Alimentación',
      tipo: 'expense',
      icono: 'mdi-food-outline',
      color: '#F59E0B',
    },
    {
      id: 'gasto-transporte',
      nombre: 'Transporte',
      tipo: 'expense',
      icono: 'mdi-bus',
      color: '#2563EB',
    },
    {
      id: 'gasto-educacion',
      nombre: 'Educación',
      tipo: 'expense',
      icono: 'mdi-school-outline',
      color: '#7C3AED',
    },
    {
      id: 'ingreso-salario',
      nombre: 'Salario',
      tipo: 'income',
      icono: 'mdi-cash-multiple',
      color: '#10B981',
    },
    {
      id: 'ingreso-beca',
      nombre: 'Becas',
      tipo: 'income',
      icono: 'mdi-school-outline',
      color: '#2563EB',
    },
  ]

  function obtenerCategorias() {
    try {
      const datos = localStorage.getItem('studentwallet_categorias')

      if (!datos) {
        return categoriasIniciales.map(categoria => ({ ...categoria }))
      }

      const resultado = JSON.parse(datos)

      return Array.isArray(resultado)
        ? resultado
        : categoriasIniciales.map(categoria => ({ ...categoria }))
    } catch {
      return categoriasIniciales.map(categoria => ({ ...categoria }))
    }
  }

  const categorias = ref(obtenerCategorias())

  function validarCategoria(datos, idActual = null) {
    const nombre = String(datos.nombre || '').trim()
    const tipo = datos.tipo

    if (!nombre) {
      return 'El nombre de la categoría es obligatorio.'
    }

    if (nombre.length > 40) {
      return 'El nombre no puede superar los 40 caracteres.'
    }

    if (!['income', 'expense'].includes(tipo)) {
      return 'Selecciona un tipo de categoría válido.'
    }

    const duplicada = categorias.value.some(categoria =>
      categoria.id !== idActual &&
      categoria.tipo === tipo &&
      categoria.nombre.trim().toLowerCase() === nombre.toLowerCase()
    )

    if (duplicada) {
      return 'Ya existe una categoría con ese nombre y tipo.'
    }

    return null
  }

  function agregarCategoria(datos) {
    const error = validarCategoria(datos)

    if (error) {
      return { ok: false, mensaje: error }
    }

    categorias.value.push({
      id: crypto.randomUUID(),
      nombre: String(datos.nombre).trim(),
      tipo: datos.tipo,
      icono: datos.icono || 'mdi-tag-outline',
      color: datos.color || '#2563EB',
    })

    return {
      ok: true,
      mensaje: 'Categoría creada correctamente.',
    }
  }

  function editarCategoria(id, datos) {
    const categoria = categorias.value.find(c => c.id === id)

    if (!categoria) {
      return {
        ok: false,
        mensaje: 'No se encontró la categoría.',
      }
    }

    const error = validarCategoria(datos, id)

    if (error) {
      return { ok: false, mensaje: error }
    }

    // No permitir cambiar el tipo si ya tiene movimientos.
    const tieneMovimientos = movimientos.value.some(m =>
      m.type === categoria.tipo &&
      String(m.category || '').trim().toLowerCase() ===
        categoria.nombre.trim().toLowerCase()
    )

    if (tieneMovimientos && datos.tipo !== categoria.tipo) {
      return {
        ok: false,
        mensaje: 'No puedes cambiar el tipo de una categoría que tiene movimientos.',
      }
    }

    // Los movimientos existentes guardan la categoría por nombre.
    // Si cambia el nombre, actualizamos sus referencias.
    if (categoria.nombre !== String(datos.nombre).trim()) {
      movimientos.value.forEach(m => {
        if (
          m.type === categoria.tipo &&
          String(m.category || '').trim().toLowerCase() ===
            categoria.nombre.trim().toLowerCase()
        ) {
          m.category = String(datos.nombre).trim()
        }
      })
    }

    categoria.nombre = String(datos.nombre).trim()
    categoria.tipo = datos.tipo
    categoria.icono = datos.icono || 'mdi-tag-outline'
    categoria.color = datos.color || '#2563EB'

    return {
      ok: true,
      mensaje: 'Categoría actualizada correctamente.',
    }
  }

  function eliminarCategoria(id) {
    const categoria = categorias.value.find(c => c.id === id)

    if (!categoria) {
      return {
        ok: false,
        mensaje: 'No se encontró la categoría.',
      }
    }

    const tieneMovimientos = movimientos.value.some(m =>
      m.type === categoria.tipo &&
      String(m.category || '').trim().toLowerCase() ===
        categoria.nombre.trim().toLowerCase()
    )

    if (tieneMovimientos) {
      return {
        ok: false,
        mensaje: 'No puedes eliminar una categoría que tiene movimientos asociados.',
      }
    }

    const tienePresupuestos =
      categoria.tipo === 'expense' &&
      presupuestos.value.some(p =>
        String(p.category || '').trim().toLowerCase() ===
          categoria.nombre.trim().toLowerCase()
      )

    if (tienePresupuestos) {
      return {
        ok: false,
        mensaje: 'No puedes eliminar una categoría que tiene presupuestos asociados.',
      }
    }

    categorias.value = categorias.value.filter(c => c.id !== id)

    return {
      ok: true,
      mensaje: 'Categoría eliminada correctamente.',
    }
  }

  watch(
    categorias,
    nuevasCategorias => {
      localStorage.setItem(
        'studentwallet_categorias',
        JSON.stringify(nuevasCategorias)
      )
    },
    { deep: true }
  )

return {
  // Movimientos
  movimientos,
  ingresos,
  gastos,
  saldo,
  agregarMovimiento,
  eliminarMovimiento,

  // Presupuestos
  presupuestos,
  guardarPresupuesto,
  eliminarPresupuesto,

  // Metas de ahorro
  metas,
  agregarMeta,
  agregarAhorro,
  eliminarMeta,
  totalAhorrado,

  // Perfil
  perfil,
  nombreCompleto,
  iniciales,
  actualizarPerfil,

  // Configuración
  configuracion,
  actualizarConfiguracion,
  restablecerConfiguracion,

  //comentarios
  comentarios,
  agregarComentario,
  actualizarEstadoComentario,

  // Categorías personalizadas
  categorias,
  agregarCategoria,
  editarCategoria,
  eliminarCategoria,
}





})
