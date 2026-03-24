<template>
  <div class="todo-item" :class="{ 'todo-item--done': todo.completed }">
    <button
      class="todo-item__check"
      :class="{ 'todo-item__check--checked': todo.completed }"
      @click="$emit('toggle')"
      :aria-label="todo.completed ? 'Отметить как невыполненное' : 'Отметить как выполненное'"
      type="button"
    >
      <Transition name="check">
        <IconCheck v-if="todo.completed" />
      </Transition>
    </button>

    <input
      ref="inputRef"
      class="todo-item__input"
      type="text"
      :value="todo.text"
      placeholder="Текст задачи..."
      @input="handleInput"
      @keydown.enter="$emit('add-after')"
      @keydown.delete="handleBackspaceOnEmpty"
      :aria-label="`Задача ${index + 1}`"
    />

    <button
      class="todo-item__delete"
      @click="$emit('delete')"
      type="button"
      aria-label="Удалить задачу"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '~/stores/notes'

const props = defineProps<{
  todo: TodoItem
  index: number
}>()

const emit = defineEmits<{
  toggle: []
  delete: []
  'update:text': [text: string]
  'add-after': []
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function handleInput(e: Event): void {
  emit('update:text', (e.target as HTMLInputElement).value)
}

function handleBackspaceOnEmpty(e: KeyboardEvent): void {
  if (e.key === 'Backspace' && props.todo.text === '') {
    emit('delete')
  }
}

defineExpose({
  focus(): void {
    nextTick(() => inputRef.value?.focus())
  }
})
</script>