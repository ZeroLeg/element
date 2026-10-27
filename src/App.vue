<script setup lang="ts">
import TransactionDialog from './modules/transactions/TransactionDialog.vue'
import { provideTransactions } from './modules/transactions/useTransaction'
import { ElMessageBox } from 'element-plus'

let busyAlertOpen = false

const { active, finish } = provideTransactions({
  onBusy() {
    if (busyAlertOpen) return
    busyAlertOpen = true
    void ElMessageBox.alert(
      'Termina o cancela el formulario actual antes de abrir otro.',
      'Hay una transacción en curso',
      { type: 'warning', confirmButtonText: 'Entendido' },
    )
      .catch(() => undefined)
      .finally(() => {
        busyAlertOpen = false
      })
  },
})
</script>

<template>
  <router-view />
  <TransactionDialog :config="active" @finish="finish" />
</template>

<style scoped></style>
