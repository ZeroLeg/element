<template>
  <div class="header">
    <el-button class="burger-btn" @click="$emit('toggle-aside')">
      <span class="burger-icon">
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          :class="isAsideOpen ? 'burger-open' : ''"
        >
          <rect class="rect1" y="4" width="22" height="2.5" rx="1.25" fill="currentColor" />
          <rect class="rect2" y="9.25" width="22" height="2.5" rx="1.25" fill="currentColor" />
          <rect class="rect3" y="14.5" width="22" height="2.5" rx="1.25" fill="currentColor" />
        </svg>
      </span>
    </el-button>

    <el-button plain @click="OpenCloseDialog"> Click to open the Dialog </el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  isAsideOpen: {
    type: Boolean,
    default: false,
  },
  dialogVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:dialogVisible'])

const OpenCloseDialog = () => {
  emit('update:dialogVisible', !props.dialogVisible)
}
</script>

<style scoped>
.header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
}
.burger-btn {
  margin-right: 16px;
}
.burger-icon {
  display: flex;
  align-items: center;
}
svg rect {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center; /* 🔥 Clave: rota desde el centro */
}

/* svg.burger-open .rect1 {
  transform: translate(-5.25px, 5.25px) rotate(45deg);
}

svg.burger-open .rect2 {
  opacity: 0;
}

svg.burger-open .rect3 {
  transform: translate(-4.75px, -1.75px) rotate(-45deg);
} */
</style>
