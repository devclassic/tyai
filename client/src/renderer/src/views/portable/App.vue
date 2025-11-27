<template>
  <div>
    <button @click="goHome">首页</button>
    <button @click="goAbout">关于</button>
  </div>
  <div>
    <RouterView />
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const goHome = () => {
    document.startViewTransition(() => {
      router.push('/index')
    })
  }

  const goAbout = () => {
    document.startViewTransition(() => {
      router.push('/about')
    })
  }
</script>
