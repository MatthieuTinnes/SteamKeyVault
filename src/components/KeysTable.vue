<template>
    <div class="keys-table">
        <h2>Your Steam Keys</h2>
        <div v-if="keys.length === 0" class="empty">
            <Message severity="info">No keys found.</Message>
        </div>
    <DataTable :value="keys" tableStyle="min-width: 50rem" striped-rows>
        <Column field="key" header="Key"></Column>
        <Column field="date_added" header="Date added"></Column>
        <Column field="current_use" header="Current use"></Column>
        <Column field="used" header="Used"></Column>
    </DataTable>
    </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { Key } from '@/models/Key';
defineProps<{ keys: Key[] }>()
</script>
<style scoped></style>