<template>
  <div class="header">
    <el-button
      type="primary"
      :plain="mode !== 'm3u'"
      @click="$emit('change-mode', 'm3u')"
      style="margin-right: 10px"
    >
      M3U URL
    </el-button>
    <el-button type="primary" :plain="mode !== 'xtream'" @click="$emit('change-mode', 'xtream')">
      Xtream
    </el-button>
  </div>
</template>

<script setup>
defineProps({
  mode: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.header {
  padding: 16px 24px;
}
</style>
