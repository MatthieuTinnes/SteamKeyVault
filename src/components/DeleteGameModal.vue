<template>
  <Dialog v-model:visible="visible" header="Confirm Delete" :modal="true" :style="{ width: '420px' }">
    <div style="display:flex;flex-direction:column;gap:1rem">
      <div>
        <p v-if="hasKeys">This game has associated keys. Deleting the game will also delete all its keys. Are you sure?</p>
        <p v-else>Are you sure you want to delete this game?</p>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:0.5rem">
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
.p-dialog .p-dialog-content { padding: 1rem 1.25rem }
</style>
