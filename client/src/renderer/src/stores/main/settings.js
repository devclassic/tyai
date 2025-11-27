import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const state = reactive({
    title: '',
    base: '',
  })
  return state
})
