<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" :to="{ name: 'record-list' }">
        <span class="brand-mark">R</span>
        <span>Registro</span>
      </RouterLink>
      <span class="topbar-section">Administración</span>
    </header>
    <RouterView />
  </div>
</template>

<style>
:root {
  font-family: 'Avenir Next', Avenir, 'Segoe UI', sans-serif;
  color: #233b39;
  background: #f5f8f6;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
}

button,
input {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
}

.topbar {
  display: flex;
  height: 64px;
  align-items: center;
  justify-content: space-between;
  padding: 0 max(32px, calc((100vw - 1120px) / 2));
  border-bottom: 1px solid #e4ebe7;
  background: #fff;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #183b3a;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 30px;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 6px;
  background: #dcebe3;
  color: #17695d;
}

.topbar-section {
  color: #70817c;
  font-size: 13px;
}

@media (max-width: 640px) {
  .topbar {
    padding: 0 18px;
  }
}
</style>
