<template>
  <div class="my-account">
    <div class="card">
      <h2 class="page-title">Import game and keys from CSV</h2>

      <div
        class="import-dropzone"
        @drop.prevent="onDrop"
        @dragover.prevent
        @click="openFilePicker"
      >
        <p class="drop-text">Drop your CSV file here or click to select</p>
        <input type="file" ref="fileInput" @change="onFileChange" accept=".csv,text/csv,.txt,text/plain" style="display:none" />
        <div class="actions" style="justify-content:center; margin-top:0.75rem;">
          <Button label="Choose a file" class="p-button-secondary" @click="openFilePicker" />
        </div>
      </div>

      <div v-if="jobId" class="status-section">
        <h3>Import progress</h3>
        <div class="stat-row" v-if="status"><div class="stat-label">Status :&nbsp;</div><div class="stat-value"> {{ status }}</div></div>
        <div class="stat-row" v-if="total"><div class="stat-label">Progress :&nbsp;</div><div class="stat-value">{{ progress }} / {{ total }}</div></div>
        <div class="progress-wrap" v-if="total"><progress :value="progress" :max="total"></progress></div>
        <div v-if="error" class="p-error">Error: {{ error }}</div>
        <div v-if="result" class="result-list">
          <h4>Results</h4>
          <ul>
            <li v-for="(r, i) in result" :key="i">
              <strong>{{ r.game }}</strong>
              <span v-if="r.created_keys"> - {{ r.created_keys.length }} keys added</span>
              <span v-if="r.error" class="p-error"> - Error: {{ r.error }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="!jobId" class="hint">Use a TXT/CSV file with the format: <code>gameName;key1;key2</code></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import { createImport, getImportStatus } from '@/api/jobs'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

const fileInput = ref<HTMLInputElement | null>(null)
const jobId = ref<number | null>(null)
const status = ref<string | null>(null)
const progress = ref<number>(0)
const total = ref<number>(0)
const error = ref<string | null>(null)
const result = ref<any[] | null>(null)

const toast = { success: (s: any) => showSuccessToast(s.summary || 'Info', s.detail), error: (s: any) => showErrorToast(s.summary || 'Error', s.detail) }
let pollTimer: number | null = null

function openFilePicker() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  uploadFile(target.files[0])
}

function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  uploadFile(files[0])
}

async function uploadFile(file: File) {
  try {
    const res = await createImport(file)
    jobId.value = res.job_id
    status.value = 'pending'
    startPolling()
    toast.success({ summary: 'Upload', detail: 'Fichier uplodé, traitement en cours' })
  } catch (err: any) {
    toast.error({ summary: 'Erreur', detail: err?.response?.data?.error || err.message || String(err) })
  }
}

function startPolling() {
  stopPolling()
  poll()
  pollTimer = window.setInterval(poll, 1500)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function poll() {
  if (!jobId.value) return
  try {
    const s = await getImportStatus(jobId.value)
    status.value = s.status
    progress.value = s.progress
    total.value = s.total
    error.value = s.error
    result.value = s.result
    if (s.status === 'completed' || s.status === 'failed') stopPolling()
  } catch (err: any) {
    stopPolling()
    toast.error({ summary: 'Erreur', detail: err?.response?.data?.error || err.message || String(err) })
  }
}

</script>

<style scoped>
.card { 
  border-radius: 0.5rem; 
  padding: 1.25rem; 
  box-shadow: var(--shadow-md); 
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}
.page-title { 
  font-size: 1.5rem; 
  margin-bottom: 1rem;
  color: var(--text-primary);
}
.import-dropzone { 
  cursor: pointer; 
  border: 0.125rem dashed var(--border-color); 
  padding: 1.25rem; 
  border-radius: 0.5rem; 
  text-align: center; 
  background: var(--bg-secondary);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
.drop-text { 
  color: var(--text-secondary); 
  margin: 0; 
}
.hint { 
  margin-top: 1rem; 
  color: var(--text-secondary);
}
.status-section { 
  margin-top: 1rem;
}
.stat-row { 
  display:flex; 
  justify-content:flex-start; 
  padding:0.5rem 0; 
  border-bottom: 0.0625rem solid var(--border-color);
}
.stat-label { 
  color: var(--text-secondary); 
  font-weight:600;
}
.stat-value { 
  font-weight:700;
  color: var(--text-primary);
}
.progress-wrap { 
  margin-top:0.5rem;
}
.result-list { 
  margin-top:0.75rem;
  color: var(--text-primary);
}
.p-error { 
  color: #ef4444;
}
</style>
