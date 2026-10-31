import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useFinanzasStore = defineStore("finanzas", () => {
  const movimientos = ref([]);
  const categorias = ref([]);
  const balanceData = ref({ saldo_total: 0, total_ingresos: 0, total_gastos: 0 });
  const cargando = ref(false);
  const error = ref(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  function getHeaders() {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  // Cargar categorías desde la API
  async function cargarCategorias() {
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
      if (res.ok) {
        const json = await res.json();
        categorias.value = json.data || json || [];
      }
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  }

  // Cargar movimientos del usuario
  async function cargarMovimientos() {
    cargando.value = true;
    error.value = null;
    try {
      const res = await fetch(`${API_BASE}/transactions`, { headers: getHeaders() });
      if (res.ok) {
        const json = await res.json();
        movimientos.value = json.data || json || [];
      } else {
        error.value = "No se pudieron obtener los movimientos.";
      }
    } catch (err) {
      console.error("Error de red en transacciones:", err);
      error.value = "Error al conectar con el servidor.";
    } finally {
      cargando.value = false;
    }
  }

  // Cargar balance financiero consolidado
  async function cargarBalance() {
    try {
      const res = await fetch(`${API_BASE}/balance`, { headers: getHeaders() });
      if (res.ok) {
        const json = await res.json();
        balanceData.value = json.data || json;
      }
    } catch (err) {
      console.error("Error al consultar balance:", err);
    }
  }

  // Registrar nuevo movimiento
  async function agregarMovimiento(nuevoMovimiento) {
    cargando.value = true;
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(nuevoMovimiento)
      });
      const json = await res.json();
      if (res.ok) {
        // Refrescar lista y balance tras inserción exitosa
        await cargarMovimientos();
        await cargarBalance();
        return { ok: true, data: json };
      }
      return { ok: false, message: json.message || "Error al guardar el movimiento" };
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      return { ok: false, message: "Error de red al registrar movimiento" };
    } finally {
      cargando.value = false;
    }
  }

  // Getters computados
  const saldoActual = computed(() => Number(balanceData.value.saldo_total ?? 0));
  const totalIngresos = computed(() => Number(balanceData.value.total_ingresos ?? 0));
  const nombreCompleto = computed(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user_info"));
      return u?.name || "Estudiante";
    } catch {
      return "Estudiante";
    }
  });
  const totalGastos = computed(() => Number(balanceData.value.total_gastos ?? 0));

  return {
    movimientos,
    categorias,
    balanceData,
    cargando,
    error,
    saldoActual,
    totalIngresos,
    totalGastos,
    nombreCompleto,
    cargarCategorias,
    cargarMovimientos,
    cargarBalance,
    agregarMovimiento
  };
});
