<template>
  <div class="edit-page">
    <AppHeader>
      <div class="edit-page__toolbar">
        <div class="edit-page__history-btns">
          <button
            class="toolbar-btn"
            :disabled="!notesStore.canUndo(noteId)"
            @click="handleUndo"
            title="Отменить изменение (Ctrl+Z)"
            aria-label="Отменить изменение"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4"/>
            </svg>
          </button>
          <button
            class="toolbar-btn"
            :disabled="!notesStore.canRedo(noteId)"
            @click="handleRedo"
            title="Повторить изменение (Ctrl+Shift+Z)"
            aria-label="Повторить изменение"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-.49-4"/>
            </svg>
          </button>
        </div>

        <div class="edit-page__divider" />
        <button class="toolbar-btn toolbar-btn--text" @click="handleCancelRequest" title="Отменить редактирование">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <span class="toolbar-btn__label">Отмена</span>
        </button>

        <button class="toolbar-btn toolbar-btn--danger" @click="handleDeleteRequest" title="Удалить заметку">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          <span class="toolbar-btn__label">Удалить</span>
        </button>

        <button class="edit-page-btn edit-page-btn--primary" @click="handleSave" :disabled="isSaving">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>{{ isSaving ? 'Сохранение...' : 'Сохранить' }}</span>
        </button>
      </div>
    </AppHeader>

    <div class="edit-page__not-found" v-if="!note">
      <div class="edit-page__not-found-inner">
        <h2>Заметка не найдена</h2>
        <p>Возможно, она была удалена</p>
        <NuxtLink to="/" class="edit-page-btn edit-page-btn--primary">На главную</NuxtLink>
      </div>
    </div>

    <main class="edit-page__main" v-else>
      <div class="container">
        <div class="edit-page__card">
          <div class="edit-page__section">
            <label class="edit-page__label" for="note-title">Название заметки</label>
            <input
              id="note-title"
              class="edit-page__title-input"
              type="text"
              v-model="localTitle"
              placeholder="Введите название..."
              @keydown.enter="focusFirstTodo"
              maxlength="200"
            />
          </div>

          <div class="edit-page__section">
            <div class="edit-page__todos-header">
              <label class="edit-page__label">Список задач</label>
              <span class="edit-page__todos-count" v-if="note.todos.length > 0">
                {{ completedCount }} / {{ note.todos.length }} выполнено
              </span>
            </div>

            <div class="edit-page__progress" v-if="note.todos.length > 0">
              <div class="edit-page__progress-fill" :style="{ width: progressPercent + '%' }" />
            </div>

            <TransitionGroup name="todo-list" tag="div" class="edit-page__todos">
              <TodoItemEdit
                v-for="(todo, index) in note.todos"
                :key="todo.id"
                :ref="(el) => setTodoRef(el, index)"
                :todo="todo"
                :index="index"
                @toggle="notesStore.toggleTodo(noteId, todo.id)"
                @delete="handleDeleteTodo(todo.id)"
                @update:text="(text) => handleUpdateTodoText(todo.id, text)"
                @add-after="handleAddTodoAfter(index)"
              />
            </TransitionGroup>

            <button class="edit-page__add-todo" @click="handleAddTodo" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Добавить задачу
            </button>
          </div>

          <div class="edit-page__meta">
            <span>Создано: {{ formatDate(note.createdAt) }}</span>
            <span>Обновлено: {{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </main>

    <AppModal
      v-model="cancelModal.isOpen.value"
      title="Отменить редактирование?"
      message="Несохранённые изменения будут потеряны."
      confirm-text="Да, отменить"
      cancel-text="Продолжить"
      variant="warning"
      @confirm="cancelModal.confirm"
      @cancel="cancelModal.cancel"
    />

    <AppModal
      v-model="deleteModal.isOpen.value"
      title="Удалить заметку?"
      :message="`Заметка «${note?.title || 'Без названия'}» будет удалена безвозвратно.`"
      confirm-text="Удалить"
      cancel-text="Отмена"
      variant="danger"
      @confirm="deleteModal.confirm"
      @cancel="deleteModal.cancel"
    />

    <Transition name="toast">
      <div class="toast toast--success" v-if="showSaveToast">
        <IconCheck :size="16" />
        Изменения сохранены
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'

const DEBOUNCE_TEXT_MS = 800
const SAVE_DELAY_MS = 300
const TOAST_DURATION_MS = 2500

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()

const noteId = route.params.id as string

const note = computed(() => notesStore.getNoteById(noteId))

const { formatDate } = useNoteDate()

const localTitle = computed({
  get: (): string => note.value?.title ?? '',
  set: (val: string): void => notesStore.updateNote(noteId, { title: val }),
})

const completedCount = computed(() => note.value?.todos.filter(t => t.completed).length ?? 0)
const progressPercent = computed(() => {
  const total = note.value?.todos.length ?? 0
  return total > 0 ? (completedCount.value / total) * 100 : 0
})

type TodoItemRef = { focus: () => void }

const todoRefs = ref<Record<number, TodoItemRef>>({})
function setTodoRef(el: TodoItemRef | null, index: number): void {
  if (el) todoRefs.value[index] = el
  else delete todoRefs.value[index]
}

function focusFirstTodo(): void {
  nextTick(() => {
    todoRefs.value[0]?.focus()
  })
}

function handleAddTodo(): void {
  notesStore.addTodo(noteId)
  nextTick(() => {
    const lastIndex = (note.value?.todos.length ?? 1) - 1
    todoRefs.value[lastIndex]?.focus()
  })
}

function handleAddTodoAfter(index: number): void {
  const currentNote = note.value
  if (!currentNote) return

  notesStore.addTodo(noteId)
  const todos = [...currentNote.todos]
  const newTodo = todos.pop()!
  todos.splice(index + 1, 0, newTodo)
  notesStore.updateNote(noteId, { todos }, false)

  nextTick(() => {
    todoRefs.value[index + 1]?.focus()
  })
}

function handleDeleteTodo(todoId: string): void {
  notesStore.deleteTodo(noteId, todoId)
}

const textDebounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)
function handleUpdateTodoText(todoId: string, text: string): void {
  notesStore.updateTodo(noteId, todoId, { text }, false)

  if (textDebounceTimer.value) clearTimeout(textDebounceTimer.value)
  textDebounceTimer.value = setTimeout(() => {
    const currentNote = notesStore.getNoteById(noteId)
    if (currentNote) {
      notesStore.updateNote(noteId, { todos: currentNote.todos }, true)
    }
  }, DEBOUNCE_TEXT_MS)
}

const isSaving = ref(false)
const showSaveToast = ref(false)

function handleSave(): void {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    showSaveToast.value = true
    setTimeout(() => { showSaveToast.value = false }, TOAST_DURATION_MS)
  }, SAVE_DELAY_MS)
}

const cancelModal = useConfirmModal()
const hasChanges = ref(false)

watch(note, () => { hasChanges.value = true }, { deep: true })

function handleCancelRequest(): void {
  if (hasChanges.value) {
    cancelModal.request(() => router.push('/'))
  } else {
    router.push('/')
  }
}

const deleteModal = useConfirmModal()

function handleDeleteRequest(): void {
  deleteModal.request(() => {
    notesStore.deleteNote(noteId)
    router.push('/')
  })
}

function handleUndo(): void {
  notesStore.undo(noteId)
}

function handleRedo(): void {
  notesStore.redo(noteId)
}

function handleKeydown(e: KeyboardEvent): void {
  const ctrl = e.ctrlKey || e.metaKey
  if (ctrl && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    handleUndo()
  } else if (ctrl && e.key === 'z' && e.shiftKey) {
    e.preventDefault()
    handleRedo()
  } else if (ctrl && e.key === 'y') {
    e.preventDefault()
    handleRedo()
  } else if (ctrl && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
}

onMounted(() => {
  hasChanges.value = false
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (textDebounceTimer.value) clearTimeout(textDebounceTimer.value)
})
</script>

