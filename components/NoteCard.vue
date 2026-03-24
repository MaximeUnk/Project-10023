<template>
  <article class="note-card" @click="handleClick">
    <div class="note-card__header">
      <h3 class="note-card__title">
        {{ note.title || 'Без названия' }}
      </h3>
      <div class="note-card__meta">
        <span class="note-card__count">{{ note.todos.length }} задач</span>
        <span class="note-card__progress" v-if="note.todos.length > 0">
          {{ completedCount }}/{{ note.todos.length }}
        </span>
      </div>
    </div>

    <div class="note-card__todos" v-if="previewTodos.length > 0">
      <div
        v-for="todo in previewTodos"
        :key="todo.id"
        class="note-card__todo-item"
        :class="{ 'note-card__todo-item--done': todo.completed }"
      >
        <span class="note-card__todo-check">
          <IconCheck v-if="todo.completed" />
        </span>
        <span class="note-card__todo-text">{{ todo.text || 'Без текста' }}</span>
      </div>

      <div v-if="note.todos.length > previewLimit" class="note-card__more">
        +{{ note.todos.length - previewLimit }} ещё...
      </div>
    </div>

    <div class="note-card__empty" v-else>
      <span>Нет задач</span>
    </div>

    <div class="note-card__progress-bar" v-if="note.todos.length > 0">
      <div
        class="note-card__progress-fill"
        :style="{ width: progressPercent + '%' }"
      />
    </div>

    <div class="note-card__actions" @click.stop>
      <button class="note-card__btn note-card__btn--edit" @click="$emit('edit', note)" title="Редактировать">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <span>Изменить</span>
      </button>
      <button class="note-card__btn note-card__btn--delete" @click="$emit('delete', note)" title="Удалить">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
        <span>Удалить</span>
      </button>
    </div>

    <div class="note-card__date">
      {{ formatDate(note.updatedAt) }}
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Note } from '~/stores/notes'

const props = withDefaults(defineProps<{
  note: Note
  previewLimit?: number
}>(), {
  previewLimit: 3,
})

const emit = defineEmits<{
  edit: [note: Note]
  delete: [note: Note]
}>()

const previewTodos = computed(() => props.note.todos.slice(0, props.previewLimit))
const completedCount = computed(() => props.note.todos.filter(t => t.completed).length)
const progressPercent = computed(() =>
  props.note.todos.length > 0
    ? (completedCount.value / props.note.todos.length) * 100
    : 0
)

const { formatDate } = useNoteDate()

function handleClick(): void {
  emit('edit', props.note)
}
</script>