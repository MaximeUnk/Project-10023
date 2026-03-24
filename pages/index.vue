<template>
  <div class="home-page">
    <AppHeader>
      <div class="home-page__header-actions">
        <span class="home-page__count" v-if="notesStore.notes.length > 0">
          {{ notesStore.notes.length }} {{ pluralNotes(notesStore.notes.length) }}
        </span>
        <button class="home-page-btn home-page-btn--primary" @click="handleCreateNote">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Новая заметка</span>
        </button>
      </div>
    </AppHeader>

    <main class="home-page__main">
      <div class="container">
        <Transition name="fade">
          <div class="home-page__empty" v-if="notesStore.notes.length === 0">
            <div class="home-page__empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h2 class="home-page__empty-title">Нет заметок</h2>
            <p class="home-page__empty-text">Создайте первую заметку, чтобы начать работу</p>
            <button class="home-page-btn home-page-btn--primary home-page-btn--lg" @click="handleCreateNote">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Создать заметку
            </button>
          </div>
        </Transition>

        <TransitionGroup name="notes-list" tag="div" class="home-page__grid" v-if="notesStore.notes.length > 0">
          <NoteCard
            v-for="note in notesStore.notes"
            :key="note.id"
            :note="note"
            @edit="handleEdit"
            @delete="handleDeleteRequest"
          />
        </TransitionGroup>
      </div>
    </main>

    <AppModal
      v-model="deleteModal.isOpen.value"
      title="Удалить заметку?"
      :message="`Заметка «${noteToDelete?.title || 'Без названия'}» будет удалена безвозвратно.`"
      confirm-text="Удалить"
      cancel-text="Отмена"
      variant="danger"
      @confirm="deleteModal.confirm"
      @cancel="deleteModal.cancel"
    />
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/stores/notes'
import { useNotesStore } from '~/stores/notes'

const notesStore = useNotesStore()
const router = useRouter()

const deleteModal = useConfirmModal()
const noteToDelete = ref<Note | null>(null)

function handleCreateNote(): void {
  const note = notesStore.createNote()
  router.push(`/notes/${note.id}`)
}

function handleEdit(note: Note): void {
  router.push(`/notes/${note.id}`)
}

function handleDeleteRequest(note: Note): void {
  noteToDelete.value = note
  deleteModal.request(() => {
    if (noteToDelete.value) {
      notesStore.deleteNote(noteToDelete.value.id)
      noteToDelete.value = null
    }
  })
}

function pluralNotes(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return 'заметок'
  if (mod10 === 1) return 'заметка'
  if (mod10 >= 2 && mod10 <= 4) return 'заметки'
  return 'заметок'
}
</script>