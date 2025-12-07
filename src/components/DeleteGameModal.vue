<template>
  <Dialog 
    v-model:visible="visible" 
    header="Confirm Delete" 
    :modal="true" 
    :style="{ width: 'min(24rem, 90vw)' }"
    class="p-fluid"
  >
    <div class="confirmation-content">
      <div class="message-container">
        <i class="pi pi-exclamation-triangle warning-icon"></i>
        <div class="message-text">
          <p v-if="hasKeys" class="warning-text">
            This game has associated keys. Deleting the game will also <strong>permanently delete all its keys</strong>.
          </p>
          <p v-else>Are you sure you want to delete this game?</p>
        </div>
      </div>
      
      <div class="dialog-footer">
        <Button label="Cancel" icon="pi pi-times" text @click="cancel" />
        <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirm" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const props = defineProps<{ modelValue: boolean; hasKeys?: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'confirmed'): void }>()

const visible = ref<boolean>(!!props.modelValue)
const hasKeys = computed(() => !!props.hasKeys)

watch(() => props.modelValue, (v) => { visible.value = !!v })
watch(visible, (v) => { emit('update:modelValue', v) })

function cancel() {
  visible.value = false
}

function confirm() {
  emit('confirmed')
  visible.value = false
}
</script>

<style scoped>
.confirmation-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.message-container {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.warning-icon {
  font-size: 2rem;
  color: var(--red-400);
}

.message-text {
  flex: 1;
  line-height: 1.5;
  color: var(--text-primary);
}

.message-text p {
  margin: 0;
}

.warning-text {
  color: var(--red-300);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
