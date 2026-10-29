<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { initLibrary } from './api/library'

onMounted(() => initLibrary())

const route = useRoute()

const menus = [
  { path: '/students', label: '学生管理', icon: 'User' },
  { path: '/books', label: '图书管理', icon: 'Reading' },
  { path: '/borrows', label: '借阅管理', icon: 'RefreshLeft' },
]

const currentTitle = computed(() => route.meta.title || '图书馆管理')
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="lib-brand">
        <div class="brand-seal">馆</div>
        <div>
          <div class="brand-name">图书馆管理</div>
          <div class="brand-sub">Library Console</div>
        </div>
      </div>

      <nav class="nav">
        <router-link
          v-for="m in menus"
          :key="m.path"
          :to="m.path"
          class="lib-nav-item"
          :class="{ 'is-active': route.path === m.path }"
        >
          <el-icon :size="17"><component :is="m.icon" /></el-icon>
          <span>{{ m.label }}</span>
        </router-link>
      </nav>
    </aside>

    <main class="content">
      <header class="topbar">
        <h1 class="topbar-title">{{ currentTitle }}</h1>
        <span class="topbar-seal">馆藏管理</span>
      </header>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 216px;
  flex-shrink: 0;
  background: var(--lib-sidebar);
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}
.brand-sub {
  font-size: 11px;
  color: #87948e;
  letter-spacing: 1px;
}

.nav {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav a {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border-radius: 8px;
  color: var(--lib-sidebar-text);
  text-decoration: none;
  font-size: 14px;
  transition: background 0.18s ease, color 0.18s ease;
}
.nav a:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.nav a.is-active {
  color: #fff;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 22px 28px;
  overflow: auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.topbar-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.topbar-seal {
  font-size: 12px;
  color: var(--lib-accent);
  border: 1px solid var(--lib-accent);
  border-radius: 999px;
  padding: 4px 12px;
  letter-spacing: 2px;
}

/* 页面切换淡入 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .sidebar {
    width: 72px;
  }
  .brand-sub,
  .nav a span {
    display: none;
  }
  .lib-brand {
    padding: 18px 12px;
  }
}
</style>
