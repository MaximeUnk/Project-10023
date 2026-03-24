import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export interface Note {
  id: string
  title: string
  todos: TodoItem[]
  createdAt: string
  updatedAt: string
}

export type NoteSnapshot = Omit<Note, 'createdAt' | 'updatedAt'>

const STORAGE_KEY = 'nuxt-notes-app'
const MAX_HISTORY = 50

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function loadFromStorage(): Note[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(notes: Note[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch(e) {
    console.error(e)
  }
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function snapshotNote(note: Note): NoteSnapshot {
  return {
    id: note.id,
    title: note.title,
    todos: deepClone(note.todos),
  }
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])

  const history = ref<Record<string, { past: NoteSnapshot[]; future: NoteSnapshot[] }>>({})

  const initialized = ref(false)

  function init() {
    if (initialized.value) return
    notes.value = loadFromStorage()
    initialized.value = true
  }

  function persist() {
    saveToStorage(notes.value)
  }


  function ensureHistory(noteId: string) {
    if (!history.value[noteId]) {
      history.value[noteId] = { past: [], future: [] }
    }
  }

  function pushHistory(noteId: string, snapshot: NoteSnapshot) {
    ensureHistory(noteId)
    const h = history.value[noteId]
    h.past.push(snapshot)
    if (h.past.length > MAX_HISTORY) {
      h.past.shift()
    }
    h.future = []
  }

  function canUndo(noteId: string): boolean {
    return (history.value[noteId]?.past.length ?? 0) > 0
  }

  function canRedo(noteId: string): boolean {
    return (history.value[noteId]?.future.length ?? 0) > 0
  }

  function undo(noteId: string) {
    ensureHistory(noteId)
    const h = history.value[noteId]
    if (!h.past.length) return

    const noteIndex = notes.value.findIndex(n => n.id === noteId)
    if (noteIndex === -1) return

    const currentSnapshot = snapshotNote(notes.value[noteIndex])
    const prevSnapshot = h.past.pop()!

    h.future.unshift(currentSnapshot)

    notes.value[noteIndex] = {
      ...notes.value[noteIndex],
      title: prevSnapshot.title,
      todos: deepClone(prevSnapshot.todos),
      updatedAt: new Date().toISOString(),
    }
    persist()
  }

  function redo(noteId: string) {
    ensureHistory(noteId)
    const h = history.value[noteId]
    if (!h.future.length) return

    const noteIndex = notes.value.findIndex(n => n.id === noteId)
    if (noteIndex === -1) return

    const currentSnapshot = snapshotNote(notes.value[noteIndex])
    const nextSnapshot = h.future.shift()!

    h.past.push(currentSnapshot)

    notes.value[noteIndex] = {
      ...notes.value[noteIndex],
      title: nextSnapshot.title,
      todos: deepClone(nextSnapshot.todos),
      updatedAt: new Date().toISOString(),
    }
    persist()
  }


  function createNote(): Note {
    const now = new Date().toISOString()
    const note: Note = {
      id: generateId(),
      title: '',
      todos: [],
      createdAt: now,
      updatedAt: now,
    }
    notes.value.unshift(note)
    persist()
    return note
  }

  function updateNote(noteId: string, changes: { title?: string; todos?: TodoItem[] }, recordHistory = true) {
    const noteIndex = notes.value.findIndex(n => n.id === noteId)
    if (noteIndex === -1) return

    if (recordHistory) {
      pushHistory(noteId, snapshotNote(notes.value[noteIndex]))
    }

    notes.value[noteIndex] = {
      ...notes.value[noteIndex],
      ...changes,
      updatedAt: new Date().toISOString(),
    }
    persist()
  }

  function deleteNote(noteId: string) {
    const idx = notes.value.findIndex(n => n.id === noteId)
    if (idx !== -1) {
      notes.value.splice(idx, 1)
      delete history.value[noteId]
      persist()
    }
  }

  function getNoteById(noteId: string): Note | undefined {
    return notes.value.find(n => n.id === noteId)
  }

  function addTodo(noteId: string) {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return

    pushHistory(noteId, snapshotNote(note))

    note.todos.push({
      id: generateId(),
      text: '',
      completed: false,
    })
    note.updatedAt = new Date().toISOString()
    persist()
  }

  function deleteTodo(noteId: string, todoId: string) {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return

    pushHistory(noteId, snapshotNote(note))

    note.todos = note.todos.filter(t => t.id !== todoId)
    note.updatedAt = new Date().toISOString()
    persist()
  }

  function updateTodo(noteId: string, todoId: string, changes: Partial<Pick<TodoItem, 'text' | 'completed'>>, recordHistory = true) {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return

    if (recordHistory) {
      pushHistory(noteId, snapshotNote(note))
    }

    const todo = note.todos.find(t => t.id === todoId)
    if (!todo) return

    Object.assign(todo, changes)
    note.updatedAt = new Date().toISOString()
    persist()
  }

  function toggleTodo(noteId: string, todoId: string) {
    const note = notes.value.find(n => n.id === noteId)
    if (!note) return
    const todo = note.todos.find(t => t.id === todoId)
    if (!todo) return

    pushHistory(noteId, snapshotNote(note))
    todo.completed = !todo.completed
    note.updatedAt = new Date().toISOString()
    persist()
  }

  return {
    notes,
    history,
    init,
    canUndo,
    canRedo,
    undo,
    redo,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    addTodo,
    deleteTodo,
    updateTodo,
    toggleTodo,
  }
})