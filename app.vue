<template>
  <div class="app">
    <div class="bg-gradient" aria-hidden="true" />
    <div class="page-content">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'

const notesStore = useNotesStore()

onMounted(() => {
  notesStore.init()
})
</script>
