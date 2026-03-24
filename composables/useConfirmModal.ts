export function useConfirmModal() {
  const isOpen = ref(false)
  const pendingAction = ref<(() => void) | null>(null)

  function request(action: () => void): void {
    pendingAction.value = action
    isOpen.value = true
  }

  function confirm(): void {
    pendingAction.value?.()
    pendingAction.value = null
    isOpen.value = false
  }

  function cancel(): void {
    pendingAction.value = null
    isOpen.value = false
  }

  return {
    isOpen,
    request,
    confirm,
    cancel,
  }
}