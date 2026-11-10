import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useFinanzasStore = defineStore("finanzas", () => {
  const movimientos = ref([]);
  const categorias = ref([]);
  const balanceData = ref({ balance: 0, total_incomes: 0, total_expenses: 0 });
  const saldo = ref(0);
  const ingresos = ref(0);
  const gastos = ref(0);
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
        movimientos.value = (json.data || json || []).map((movimiento) => ({
          ...movimiento,
          description: movimiento.description ?? ""
        }));
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
        const data = json.data || json;
        balanceData.value = data;
        saldo.value = Number(data.balance ?? 0);
        ingresos.value = Number(data.total_incomes ?? 0);
        gastos.value = Number(data.total_expenses ?? 0);
      }
    } catch (err) {
      console.error("Error al consultar balance:", err);
    }
  }

  // Registrar nuevo movimiento
  async function agregarMovimiento(nuevoMovimiento) {
    cargando.value = true;
    try {
      const type = nuevoMovimiento.type === "ingreso" || nuevoMovimiento.type === "income"
        ? "ingreso"
        : "gasto";
      const categoryId = nuevoMovimiento.category_id
        ?? nuevoMovimiento.category?.id
        ?? nuevoMovimiento.category?.value
        ?? nuevoMovimiento.category;
      const payload = {
        amount: Number(nuevoMovimiento.amount),
        type,
        category_id: categoryId,
        description: nuevoMovimiento.description ?? nuevoMovimiento.name ?? "",
        date: nuevoMovimiento.date
      };
      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
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
  const saldoActual = computed(() => saldo.value);
  const totalIngresos = computed(() => ingresos.value);
  const nombreCompleto = computed(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user_info"));
      return u?.name || "Estudiante";
    } catch {
      return "Estudiante";
    }
  });
  const totalGastos = computed(() => gastos.value);

  return {
    movimientos,
    categorias,
    balanceData,
    saldo,
    ingresos,
    gastos,
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
