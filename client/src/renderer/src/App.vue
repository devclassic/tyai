<template>
  <WinBtns />
  <div class="box">
    <Sidebar />
    <div class="main">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
  import WinBtns from './components/winbtns/WinBtns.vue'
  import Sidebar from './components/sidebar/Sidebar.vue'
</script>

<style lang="scss" scoped>
  .box {
    width: 1280px;
    height: 720px;
    background: #f5f4f6;
    display: flex;
    position: relative;
  }

  .main {
    flex: 1;
    padding: 0 20px;
    position: relative;
  }
</style>
