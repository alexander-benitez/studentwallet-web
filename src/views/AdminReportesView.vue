
<script setup>
import { ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const periodo = ref('Todos')
const snackbar = ref(false)
const mensaje = ref('')

const periodos = [
  'Todos',
  'Primer trimestre',
  'Segundo trimestre',
  'Tercer trimestre',
  'Cuarto trimestre',
]

// Datos ficticios de demostración.
// Más adelante se reemplazarán por estadísticas del backend.
const datos = [
  { mes: 'Enero', trimestre: 'Primer trimestre', ingresos: 3200, gastos: 2100 },
  { mes: 'Febrero', trimestre: 'Primer trimestre', ingresos: 3900, gastos: 2500 },
  { mes: 'Marzo', trimestre: 'Primer trimestre', ingresos: 3500, gastos: 2800 },
  { mes: 'Abril', trimestre: 'Segundo trimestre', ingresos: 4600, gastos: 3100 },
  { mes: 'Mayo', trimestre: 'Segundo trimestre', ingresos: 4200, gastos: 2900 },
  { mes: 'Junio', trimestre: 'Segundo trimestre', ingresos: 5100, gastos: 3400 },
  { mes: 'Julio', trimestre: 'Tercer trimestre', ingresos: 4800, gastos: 3600 },
  { mes: 'Agosto', trimestre: 'Tercer trimestre', ingresos: 5600, gastos: 3800 },
  { mes: 'Septiembre', trimestre: 'Tercer trimestre', ingresos: 5900, gastos: 4100 },
  { mes: 'Octubre', trimestre: 'Cuarto trimestre', ingresos: 6200, gastos: 4300 },
]

const registros = computed(() =>
  periodo.value === 'Todos'
    ? datos
    : datos.filter(item => item.trimestre === periodo.value)
)

const totalIngresos = computed(() =>
  registros.value.reduce((total, item) => total + item.ingresos, 0)
)

const totalGastos = computed(() =>
  registros.value.reduce((total, item) => total + item.gastos, 0)
)

const balance = computed(() => totalIngresos.value - totalGastos.value)

function moneda(valor) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(valor)
}

function filasReporte() {
  return registros.value.map(item => ({
    Mes: item.mes,
    Ingresos: item.ingresos,
    Gastos: item.gastos,
    Balance: item.ingresos - item.gastos,
  }))
}

function exportarExcel() {
  try {
    const filas = filasReporte()

    const resumen = [
      { Indicador: 'Período', Valor: periodo.value },
      { Indicador: 'Ingresos', Valor: totalIngresos.value },
      { Indicador: 'Gastos', Valor: totalGastos.value },
      { Indicador: 'Balance', Valor: balance.value },
    ]

    const libro = XLSX.utils.book_new()

    const hojaDatos = XLSX.utils.json_to_sheet(filas)
    hojaDatos['!cols'] = [
      { wch: 20 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
    ]

    const hojaResumen = XLSX.utils.json_to_sheet(resumen)
    hojaResumen['!cols'] = [
      { wch: 22 },
      { wch: 24 },
    ]

    XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen')
    XLSX.utils.book_append_sheet(libro, hojaDatos, 'Finanzas')

    XLSX.writeFile(libro, 'StudentWallet_Reporte.xlsx')

    mensaje.value = 'Reporte Excel generado correctamente.'
    snackbar.value = true
  } catch (error) {
    console.error(error)
    mensaje.value = 'No se pudo generar el archivo Excel.'
    snackbar.value = true
  }
}

function exportarPDF() {
  try {
    const documento = new jsPDF()

    documento.setFontSize(20)
    documento.setTextColor(37, 99, 235)
    documento.text('StudentWallet', 14, 20)

    documento.setFontSize(14)
    documento.setTextColor(15, 23, 42)
    documento.text('Reporte financiero administrativo', 14, 30)

    documento.setFontSize(10)
    documento.setTextColor(100, 116, 139)
    documento.text(`Período: ${periodo.value}`, 14, 39)
    documento.text('Datos de demostración', 14, 45)

    autoTable(documento, {
      startY: 54,
      head: [['Mes', 'Ingresos', 'Gastos', 'Balance']],
      body: registros.value.map(item => [
        item.mes,
        moneda(item.ingresos),
        moneda(item.gastos),
        moneda(item.ingresos - item.gastos),
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
      },
      styles: {
        fontSize: 10,
      },
    })

    const posicion = documento.lastAutoTable.finalY + 14

    documento.setFontSize(11)
    documento.setTextColor(15, 23, 42)

    documento.text(
      `Total ingresos: ${moneda(totalIngresos.value)}`,
      14,
      posicion
    )

    documento.text(
      `Total gastos: ${moneda(totalGastos.value)}`,
      14,
      posicion + 7
    )

    documento.text(
      `Balance: ${moneda(balance.value)}`,
      14,
      posicion + 14
    )

    documento.save('StudentWallet_Reporte.pdf')

    mensaje.value = 'Reporte PDF generado correctamente.'
    snackbar.value = true
  } catch (error) {
    console.error(error)
    mensaje.value = 'No se pudo generar el archivo PDF.'
    snackbar.value = true
  }
}
</script>

<template>
  <div class="reportes-page">
    <div class="page-header">
      <div>
        <v-chip color="primary" variant="tonal" class="mb-3">
          Administración
        </v-chip>

        <h1>Reportes administrativos</h1>

        <p>
          Consulta indicadores financieros y genera reportes
          descargables de StudentWallet.
        </p>
      </div>

      <v-chip color="info" variant="tonal">
        Datos de demostración
      </v-chip>
    </div>

    <v-card class="report-card mt-6" elevation="0">
      <div class="section-header">
        <div>
          <h2>Generar reporte financiero</h2>
          <p>Selecciona un período y el formato de exportación.</p>
        </div>

        <v-icon color="primary" size="30">
          mdi-file-chart-outline
        </v-icon>
      </div>

      <v-row align="center" class="mt-3">
        <v-col cols="12" md="5">
          <v-select
            v-model="periodo"
            :items="periodos"
            label="Período del reporte"
            variant="outlined"
            rounded="lg"
            hide-details
          />
        </v-col>

        <v-col cols="12" md="7">
          <div class="export-buttons">
            <v-btn
              color="success"
              prepend-icon="mdi-microsoft-excel"
              rounded="lg"
              size="large"
              @click="exportarExcel"
            >
              Exportar Excel
            </v-btn>

            <v-btn
              color="error"
              prepend-icon="mdi-file-pdf-box"
              rounded="lg"
              size="large"
              @click="exportarPDF"
            >
              Exportar PDF
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-row class="mt-4">
      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <v-icon color="primary" size="30">
            mdi-trending-up
          </v-icon>

          <p>Ingresos</p>
          <h2>{{ moneda(totalIngresos) }}</h2>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <v-icon color="#7C3AED" size="30">
            mdi-trending-down
          </v-icon>

          <p>Gastos</p>
          <h2>{{ moneda(totalGastos) }}</h2>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="stat-card" elevation="0">
          <v-icon color="success" size="30">
            mdi-wallet-outline
          </v-icon>

          <p>Balance</p>
          <h2>{{ moneda(balance) }}</h2>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="report-card mt-5" elevation="0">
      <div class="section-header">
        <div>
          <h2>Vista previa del reporte</h2>
          <p>{{ registros.length }} meses incluidos</p>
        </div>

        <v-icon color="primary">
          mdi-table-large
        </v-icon>
      </div>

      <v-table class="mt-4">
        <thead>
          <tr>
            <th>Mes</th>
            <th class="text-right">Ingresos</th>
            <th class="text-right">Gastos</th>
            <th class="text-right">Balance</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in registros" :key="item.mes">
            <td>{{ item.mes }}</td>
            <td class="text-right">
              {{ moneda(item.ingresos) }}
            </td>
            <td class="text-right">
              {{ moneda(item.gastos) }}
            </td>
            <td class="text-right">
              <strong>
                {{ moneda(item.ingresos - item.gastos) }}
              </strong>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-alert type="info" variant="tonal" class="mt-5">
      Los reportes utilizan datos ficticios para fines
      académicos. No incluyen información financiera
      privada de estudiantes.
    </v-alert>

    <v-snackbar
      v-model="snackbar"
      location="top right"
      :timeout="3000"
    >
      {{ mensaje }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.reportes-page {
  min-height: 100vh;
  padding: 32px;
  background: #f6f8fc;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
}

.page-header p {
  margin-top: 8px;
  color: #64748b;
}

.report-card,
.stat-card {
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 18px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
}

.section-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 6px;
}

.export-buttons {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-card p {
  margin-top: 15px;
  color: #64748b;
  font-size: 14px;
}

.stat-card h2 {
  margin-top: 8px;
  color: #0f172a;
  font-size: 25px;
  font-weight: 800;
}

@media (max-width: 600px) {
  .reportes-page {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .export-buttons {
    justify-content: stretch;
  }

  .export-buttons :deep(.v-btn) {
    width: 100%;
  }
}
</style>
