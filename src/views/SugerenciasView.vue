
<script setup>
import { ref, computed } from 'vue'
import { useFinanzasStore } from '@/stores/finanzas'

const finanzas = useFinanzasStore()

const categoria = ref('Mejora')
const comentario = ref('')
const calificacion = ref(0)
const loading = ref(false)
const snackbar = ref(false)
const mensaje = ref('')
const formulario = ref(null)

const categorias = [
  'Mejora',
  'Reportar error',
  'Nueva función',
  'Opinión general',
]

const required = (v) =>
  !!String(v ?? '').trim() || 'Este campo es obligatorio'

const minCaracteres = (v) =>
  String(v ?? '').trim().length >= 10 ||
  'Escribe al menos 10 caracteres'

const misComentarios = computed(() =>
  finanzas.comentarios.filter(
    (item) => item.usuario === finanzas.nombreCompleto
  )
)

async function enviarComentario() {
  if (loading.value) return

  const resultado = await formulario.value.validate()

  if (!resultado.valid) return

  if (calificacion.value === 0) {
    mensaje.value = 'Selecciona una calificación.'
    snackbar.value = true
    return
  }

  loading.value = true

  try {
    finanzas.agregarComentario({
      usuario: finanzas.nombreCompleto,
      categoria: categoria.value,
      comentario: comentario.value.trim(),
      calificacion: calificacion.value,
    })

    comentario.value = ''
    categoria.value = 'Mejora'
    calificacion.value = 0
    formulario.value.resetValidation()

    mensaje.value = '¡Tu comentario fue enviado correctamente!'
    snackbar.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="sugerencias-page">
    <div class="page-header">
      <v-chip color="primary" variant="tonal" class="mb-3">
        Tu opinión importa
      </v-chip>

      <h1>Sugerencias y mejoras</h1>
      <p>
        Ayúdanos a construir una mejor experiencia
        en StudentWallet.
      </p>
    </div>

    <v-row class="mt-5">
      <v-col cols="12" lg="7">
        <v-card class="content-card" elevation="0">
          <div class="card-heading">
            <div class="heading-icon">
              <v-icon color="primary" size="28">
                mdi-message-text-outline
              </v-icon>
            </div>

            <div>
              <h2>Envíanos tu opinión</h2>
              <p>Queremos conocer tus ideas.</p>
            </div>
          </div>

          <v-form ref="formulario" @submit.prevent="enviarComentario">
            <label>Tipo de comentario</label>

            <v-select
              v-model="categoria"
              :items="categorias"
              variant="outlined"
              rounded="lg"
              class="mt-2 mb-3"
              :disabled="loading"
            />

            <label>Tu comentario</label>

            <v-textarea
              v-model="comentario"
              placeholder="Cuéntanos qué podemos mejorar..."
              variant="outlined"
              rounded="lg"
              rows="5"
              counter="500"
              maxlength="500"
              :rules="[required, minCaracteres]"
              :disabled="loading"
              class="mt-2 mb-3"
            />

            <label>Califica tu experiencia</label>

            <div class="rating-container">
              <v-rating
                v-model="calificacion"
                color="amber"
                active-color="amber"
                hover
                size="large"
                :disabled="loading"
              />
              <span>{{ calificacion }} / 5</span>
            </div>

            <v-btn
              type="submit"
              color="primary"
              size="large"
              rounded="lg"
              block
              :loading="loading"
              :disabled="loading"
              prepend-icon="mdi-send-outline"
              class="send-btn"
            >
              Enviar comentario
            </v-btn>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="content-card" elevation="0">
          <h2>¿Por qué compartir tu opinión?</h2>

          <div class="benefit">
            <v-icon color="primary">
              mdi-lightbulb-outline
            </v-icon>
            <div>
              <strong>Propón nuevas ideas</strong>
              <p>Ayúdanos a crear funciones útiles.</p>
            </div>
          </div>

          <div class="benefit">
            <v-icon color="warning">
              mdi-bug-outline
            </v-icon>
            <div>
              <strong>Reporta problemas</strong>
              <p>Cuéntanos si algo no funciona bien.</p>
            </div>
          </div>

          <div class="benefit">
            <v-icon color="success">
              mdi-check-decagram-outline
            </v-icon>
            <div>
              <strong>Mejora StudentWallet</strong>
              <p>Tus sugerencias nos ayudan a crecer.</p>
            </div>
          </div>
        </v-card>

        <v-card class="content-card mt-4" elevation="0">
          <h2>Mis comentarios</h2>
          <p class="section-subtitle">
            Consulta el estado de tus sugerencias.
          </p>

          <v-alert
            v-if="misComentarios.length === 0"
            type="info"
            variant="tonal"
            class="mt-4"
          >
            Todavía no has enviado comentarios.
          </v-alert>

          <div
            v-for="item in misComentarios"
            :key="item.id"
            class="comment-item"
          >
            <div class="comment-top">
              <strong>{{ item.categoria }}</strong>

              <v-chip
                size="x-small"
                :color="
                  item.estado === 'Resuelto'
                    ? 'success'
                    : item.estado === 'En revisión'
                      ? 'info'
                      : 'warning'
                "
                variant="tonal"
              >
                {{ item.estado }}
              </v-chip>
            </div>

            <p>{{ item.comentario }}</p>
            <small>{{ item.fecha }}</small>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar"
      color="primary"
      location="top right"
      :timeout="3500"
    >
      {{ mensaje }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.sugerencias-page {
  padding: 32px;
  min-height: 100vh;
  background: #f6f8fc;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-header h1 {
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
}

.page-header p {
  margin-top: 8px;
  color: #64748b;
}

.content-card {
  background: white;
  border: 1px solid #e8edf5;
  border-radius: 20px;
  padding: 28px;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.heading-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-card h2 {
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
}

.card-heading p,
.section-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 5px;
}

.content-card label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 10px 0 28px;
}

.rating-container span {
  color: #64748b;
  font-size: 14px;
}

.send-btn {
  text-transform: none;
  font-weight: 700;
}

.benefit {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-top: 26px;
}

.benefit strong {
  color: #334155;
  font-size: 14px;
}

.benefit p {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}

.comment-item {
  padding: 17px 0;
  border-bottom: 1px solid #e8edf5;
}

.comment-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.comment-item p {
  color: #475569;
  font-size: 13px;
  margin: 10px 0;
  overflow-wrap: anywhere;
}

.comment-item small {
  color: #94a3b8;
}

@media (max-width: 600px) {
  .sugerencias-page {
    padding: 18px;
  }

  .content-card {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 25px;
  }
}
</style>
