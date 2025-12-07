<template>
  <div class="import-view">
    <div class="header">
      <h2><i class="pi pi-upload"></i> Import Games</h2>
      <Button label="Back to Account" icon="pi pi-arrow-left" @click="router.push('/my-account')" severity="secondary" />
    </div>

    <div class="content-card">
      <div class="card-header">
        <h3>Upload CSV File</h3>
        <p class="section-desc">
          Import your game library using a CSV or TXT file.<br>
          Format: <code>gameName;key1;key2</code>
        </p>
      </div>

      <div
        class="import-dropzone"
        :class="{ 'is-dragover': isDragOver }"
        @drop.prevent="onDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @click="openFilePicker"
      >
        <i class="pi pi-cloud-upload drop-icon"></i>
        <p class="drop-text">Drop your CSV file here or click to browse</p>
        <input type="file" ref="fileInput" @change="onFileChange" accept=".csv,text/csv,.txt,text/plain" style="display:none" />
        <Button label="Select File" icon="pi pi-folder-open" class="p-button-outlined" />
      </div>

      <div v-if="jobId" class="progress-section">
        <div class="section-title">
          <h3>Import Progress</h3>
          <span class="status-badge" :class="status">{{ status }}</span>
        </div>

        <div class="progress-container" v-if="total">
          <div class="progress-info">
            <span>Processing...</span>
            <span>{{ progress }} / {{ total }}</span>
          </div>
          <progress :value="progress" :max="total" class="styled-progress"></progress>
        </div>

        <div v-if="error" class="message error">
          <i class="pi pi-exclamation-circle"></i> {{ error }}
        </div>

        <div v-if="result" class="results-section">
          <h4>Results</h4>
          <div class="results-list">
            <div v-for="(r, i) in result" :key="i" class="result-item">
              <div class="result-game">
                <i class="pi pi-box"></i>
                <strong>{{ r.game }}</strong>
              </div>
              <div class="result-details">
                <span v-if="r.created_keys" class="success-tag">
                  <i class="pi pi-check"></i> {{ r.created_keys.length }} keys added
                </span>
                <span v-if="r.error" class="error-tag">
                  <i class="pi pi-times"></i> {{ r.error }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { createImport, getImportStatus } from '@/api/jobs'
import { showSuccessToast, showErrorToast } from '@/utils/toast'

const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)
const jobId = ref<number | null>(null)
const status = ref<string | null>(null)
const progress = ref<number>(0)
const total = ref<number>(0)
const error = ref<string | null>(null)
const result = ref<any[] | null>(null)
const isDragOver = ref(false)

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
  isDragOver.value = false
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
    toast.success({ summary: 'Upload', detail: 'File uploaded, processing started' })
  } catch (err: any) {
    toast.error({ summary: 'Error', detail: err?.response?.data?.error || err.message || String(err) })
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
    toast.error({ summary: 'Error', detail: err?.response?.data?.error || err.message || String(err) })
  }
}
</script>

<style scoped>
.import-view {
  max-width: 75rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  color: var(--text-primary);
  margin: 0;
}

.content-card {
  background: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.card-header {
  margin-bottom: 2rem;
  text-align: center;
}

.card-header h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.section-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
}

.section-desc code {
  background: var(--bg-tertiary);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
  color: var(--primary-color);
}

.import-dropzone {
  border: 2px dashed var(--border-color);
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.import-dropzone:hover,
.import-dropzone.is-dragover {
  border-color: var(--primary-color);
  background: var(--bg-tertiary);
}

.drop-icon {
  font-size: 3rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
  transition: color 0.3s ease;
}

.import-dropzone:hover .drop-icon {
  color: var(--primary-color);
}

.drop-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* Progress Section */
.progress-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pending { background: #eff6ff; color: #1d4ed8; }
.status-badge.processing { background: #fff7ed; color: #c2410c; }
.status-badge.completed { background: #ecfdf5; color: #047857; }
.status-badge.failed { background: #fef2f2; color: #b91c1c; }

.progress-container {
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.styled-progress {
  width: 100%;
  height: 0.75rem;
  border-radius: 0.375rem;
  overflow: hidden;
}

.styled-progress::-webkit-progress-bar {
  background-color: var(--bg-tertiary);
  border-radius: 0.375rem;
}

.styled-progress::-webkit-progress-value {
  background-color: var(--primary-color);
  border-radius: 0.375rem;
  transition: width 0.3s ease;
}

.message.error {
  background: #fef2f2;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.results-section h4 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 20rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.result-item {
  background: var(--bg-secondary);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
}

.result-game {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
}

.result-details {
  display: flex;
  gap: 0.5rem;
}

.success-tag {
  color: #059669;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-tag {
  color: #dc2626;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
