<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal" :class="`modal--${variant}`" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <div class="modal__header">
            <h3 class="modal__title" :id="titleId">{{ title }}</h3>
            <button class="modal__close" @click="$emit('update:modelValue', false)" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal__body" v-if="$slots.default">
            <slot />
          </div>

          <p class="modal__message" v-if="message">{{ message }}</p>

          <div class="modal__actions">
            <button
              v-if="cancelText"
              class="modal-btn modal-btn--ghost"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              v-if="confirmText"
              class="modal-btn"
              :class="`modal-btn--${variant === 'danger' ? 'danger' : 'primary'}`"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'warning'
  closeOnOverlay?: boolean
}>(), {
  variant: 'default',
  closeOnOverlay: true,
  cancelText: 'Отмена',
  confirmText: 'Подтвердить',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`

function handleConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    handleCancel()
  }
}

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.modelValue) {
      handleCancel()
    }
  }
  document.addEventListener('keydown', handler)
  onBeforeUnmount(() => document.removeEventListener('keydown', handler))
})
</script>
