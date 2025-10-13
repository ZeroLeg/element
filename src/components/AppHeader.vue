<template>
  <div class="header">
    <el-button plain @click="OpenCloseDialog"> Cargar datos nuevos </el-button>
    <el-button v-show="dataLoaded" plain @click="emit('load:data')">
      Cargar datos existentes
    </el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false,
  },
  dataLoaded: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:dialogVisible', 'load:data'])

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
</style>
