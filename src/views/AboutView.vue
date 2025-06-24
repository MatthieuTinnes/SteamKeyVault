<template>
  <div class="about">
    <Card>
      <template #title>About</template>
      <template #content>
        <h1>This is an about page</h1>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from 'primevue/card';
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
