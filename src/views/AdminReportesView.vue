
<script setup>
import { ref, computed } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'

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


async function exportarExcel() {
  try {
    const libro = new ExcelJS.Workbook()

    libro.creator = 'StudentWallet'
    libro.subject = 'Reporte financiero administrativo'
    libro.title = 'Reporte financiero StudentWallet'
    libro.created = new Date()

    // COLORES DEL REPORTE
    const azulOscuro = '172554'
    const azul = '2563EB'
    const azulClaro = 'DBEAFE'
    const grisClaro = 'F1F5F9'
    const blanco = 'FFFFFF'
    const grisTexto = '475569'
    const verdeClaro = 'DCFCE7'

    const formatoMoneda = '"$"#,##0.00;[Red]-"$"#,##0.00'

    const fechaGeneracion = new Date().toLocaleDateString('es-SV')

    // =====================================
    // HOJA 1: RESUMEN
    // =====================================

    const hojaResumen = libro.addWorksheet('Resumen')

    hojaResumen.columns = [
      { key: 'indicador', width: 28 },
      { key: 'valor', width: 25 },
    ]

    hojaResumen.mergeCells('A1:B1')

    const tituloResumen = hojaResumen.getCell('A1')
    tituloResumen.value = 'STUDENTWALLET'
    tituloResumen.font = {
      name: 'Arial',
      size: 18,
      bold: true,
      color: { argb: blanco },
    }
    tituloResumen.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: azulOscuro },
    }
    tituloResumen.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }

    hojaResumen.getRow(1).height = 35

    hojaResumen.mergeCells('A2:B2')

    const subtituloResumen = hojaResumen.getCell('A2')
    subtituloResumen.value = 'Reporte financiero administrativo'
    subtituloResumen.font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: azulOscuro },
    }
    subtituloResumen.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }

    hojaResumen.mergeCells('A3:B3')

    hojaResumen.getCell('A3').value =
      `Período: ${periodo.value} | Generado: ${fechaGeneracion}`

    hojaResumen.getCell('A3').font = {
      name: 'Arial',
      size: 10,
      italic: true,
      color: { argb: grisTexto },
    }

    hojaResumen.getCell('A3').alignment = {
      horizontal: 'center',
    }

    // Encabezados
    const encabezadoResumen = hojaResumen.getRow(5)

    encabezadoResumen.values = ['Indicador', 'Valor']

    encabezadoResumen.eachCell(cell => {
      cell.font = {
        name: 'Arial',
        bold: true,
        color: { argb: blanco },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: azul },
      }

      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      }

      cell.border = {
        bottom: {
          style: 'medium',
          color: { argb: azulOscuro },
        },
      }
    })

    encabezadoResumen.height = 25

    // Datos del resumen
    const datosResumen = [
      ['Período', periodo.value],
      ['Total de ingresos', totalIngresos.value],
      ['Total de gastos', totalGastos.value],
      ['Balance general', balance.value],
      ['Meses incluidos', registros.value.length],
    ]

    datosResumen.forEach((fila, indice) => {
      const numeroFila = indice + 6
      const nuevaFila = hojaResumen.getRow(numeroFila)

      nuevaFila.values = fila

      nuevaFila.eachCell((cell, numeroColumna) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          bold: numeroFila === 9,
          color: {
            argb: numeroFila === 9 ? '166534' : grisTexto,
          },
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: numeroFila === 9
            ? verdeClaro
            : indice % 2 === 0
              ? blanco
              : grisClaro,
        }

        cell.border = {
          bottom: {
            style: 'thin',
            color: { argb: 'CBD5E1' },
          },
        }

        cell.alignment = {
          vertical: 'middle',
          horizontal: numeroColumna === 2 ? 'right' : 'left',
        }

        if (
          numeroColumna === 2 &&
          [7, 8, 9].includes(numeroFila)
        ) {
          cell.numFmt = formatoMoneda
        }
      })

      nuevaFila.height = 23
    })

    hojaResumen.autoFilter = 'A5:B10'
    hojaResumen.views = [
      { state: 'frozen', ySplit: 5 },
    ]

    // =====================================
    // HOJA 2: FINANZAS
    // =====================================

    const hojaFinanzas = libro.addWorksheet('Finanzas')

    hojaFinanzas.columns = [
      { header: 'Mes', key: 'mes', width: 22 },
      { header: 'Ingresos', key: 'ingresos', width: 20 },
      { header: 'Gastos', key: 'gastos', width: 20 },
      { header: 'Balance', key: 'balance', width: 20 },
    ]

    hojaFinanzas.mergeCells('A1:D1')

    const tituloFinanzas = hojaFinanzas.getCell('A1')
    tituloFinanzas.value = 'REPORTE FINANCIERO MENSUAL'
    tituloFinanzas.font = {
      name: 'Arial',
      size: 18,
      bold: true,
      color: { argb: blanco },
    }
    tituloFinanzas.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: azulOscuro },
    }
    tituloFinanzas.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }

    hojaFinanzas.getRow(1).height = 35

    hojaFinanzas.mergeCells('A2:D2')

    hojaFinanzas.getCell('A2').value =
      `Período: ${periodo.value} | Generado: ${fechaGeneracion}`

    hojaFinanzas.getCell('A2').font = {
      name: 'Arial',
      size: 10,
      italic: true,
      color: { argb: grisTexto },
    }

    hojaFinanzas.getCell('A2').alignment = {
      horizontal: 'center',
    }

    // Encabezados
    const encabezadoFinanzas = hojaFinanzas.getRow(4)

    encabezadoFinanzas.values = [
      'Mes',
      'Ingresos',
      'Gastos',
      'Balance',
    ]

    encabezadoFinanzas.eachCell(cell => {
      cell.font = {
        name: 'Arial',
        bold: true,
        color: { argb: blanco },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: azul },
      }

      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      }

      cell.border = {
        bottom: {
          style: 'medium',
          color: { argb: azulOscuro },
        },
      }
    })

    encabezadoFinanzas.height = 25

    // Registros financieros
    registros.value.forEach((item, indice) => {
      const fila = hojaFinanzas.addRow({
        mes: item.mes,
        ingresos: item.ingresos,
        gastos: item.gastos,
        balance: item.ingresos - item.gastos,
      })

      fila.eachCell((cell, numeroColumna) => {
        cell.font = {
          name: 'Arial',
          size: 11,
          color: { argb: grisTexto },
        }

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: indice % 2 === 0 ? blanco : grisClaro,
        }

        cell.border = {
          bottom: {
            style: 'thin',
            color: { argb: 'CBD5E1' },
          },
        }

        cell.alignment = {
          vertical: 'middle',
          horizontal: numeroColumna === 1 ? 'left' : 'right',
        }

        if (numeroColumna > 1) {
          cell.numFmt = formatoMoneda
        }
      })

      fila.height = 23
    })

    // Fila de totales
    const filaTotal = hojaFinanzas.addRow({
      mes: 'TOTAL',
      ingresos: totalIngresos.value,
      gastos: totalGastos.value,
      balance: balance.value,
    })

    filaTotal.eachCell(cell => {
      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: blanco },
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: azulOscuro },
      }

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'right',
      }

      cell.border = {
        top: {
          style: 'medium',
          color: { argb: azul },
        },
      }
    })

    filaTotal.getCell(1).alignment = {
      horizontal: 'left',
      vertical: 'middle',
    }

    for (let columna = 2; columna <= 4; columna++) {
      filaTotal.getCell(columna).numFmt = formatoMoneda
    }

    filaTotal.height = 28

    // Filtros y encabezados inmovilizados
    hojaFinanzas.autoFilter = {
      from: 'A4',
      to: `D${registros.value.length + 4}`,
    }

    hojaFinanzas.views = [
      { state: 'frozen', ySplit: 4 },
    ]

    // =====================================
    // DESCARGAR ARCHIVO
    // =====================================

    const contenido = await libro.xlsx.writeBuffer()

    const archivo = new Blob(
      [contenido],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    )

    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = 'StudentWallet_Reporte.xlsx'

    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)

    URL.revokeObjectURL(url)

    mensaje.value = 'Reporte Excel con formato generado correctamente.'
    snackbar.value = true

  } catch (error) {
    console.error('Error al exportar Excel:', error)

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
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
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
  color: rgb(var(--v-theme-on-background));
}

.page-header p {
  margin-top: 8px;
  color: rgb(var(--v-theme-on-surface-variant));
}

.report-card,
.stat-card {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.10);
  border-radius: 18px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.section-header h2 {
  font-size: 19px;
  font-weight: 800;
  color: rgb(var(--v-theme-on-surface));
}

.section-header p {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 13px;
  margin-top: 6px;
}

.export-buttons {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

/* Indicadores financieros */
.stat-card p {
  margin-top: 15px;
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 14px;
}

.stat-card h2 {
  margin-top: 8px;
  color: rgb(var(--v-theme-on-surface));
  font-size: 25px;
  font-weight: 800;
}

/* Selector de período */
.report-card :deep(.v-field) {
  color: rgb(var(--v-theme-on-surface));
}

.report-card :deep(.v-label) {
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Tabla */
.report-card :deep(.v-table) {
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
}

.report-card :deep(th) {
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 700;
  white-space: nowrap;
}

.report-card :deep(td) {
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

.report-card :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

/* Alertas */
.reportes-page :deep(.v-alert) {
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 600px) {
  .reportes-page {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .report-card,
  .stat-card {
    padding: 18px;
  }

  .export-buttons {
    justify-content: stretch;
  }

  .export-buttons :deep(.v-btn) {
    width: 100%;
  }
}

</style>
