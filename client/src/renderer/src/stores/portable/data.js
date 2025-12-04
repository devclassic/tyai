import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useDataStore = defineStore('data', () => {
  const state = reactive({
    imgs: [],
    files: [],
    upfiles: [],
    input: '',
  })
  return { state }
})
