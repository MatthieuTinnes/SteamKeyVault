<template>
  <div class="custom-game-info">
    <h2 class="title">{{ gameName }}</h2>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ gameName: string }>()
</script>

<style scoped>
.custom-game-info {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 1.5rem;
  background: #1b2838;
  color: white;
  border-radius: 8px;
  margin-bottom: 1em;
}
.custom-game-info .title {
  margin: 0;
  font-size: 1.8rem;
}
</style>
