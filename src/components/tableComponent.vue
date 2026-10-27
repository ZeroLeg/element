<template>
  <el-table :data="rows" style="width: 100%" height="800px" table-layout="auto">
    <el-table-column
      v-for="column in columns"
      :key="column.id"
      :prop="column.id"
      :label="column.label"
    />

    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default>
        <el-button link type="primary" size="small">Edit</el-button>
        <el-button link type="primary" size="small">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import type { column, row } from '@/types/list'

const { rows, columns } = defineProps<{
  rows: row[]
  columns: column[]
}>()

const handleClick = () => {
  console.log('click')
}
</script>

<style scoped>
.el-table :deep(.cell) {
  white-space: nowrap;
}
</style>
