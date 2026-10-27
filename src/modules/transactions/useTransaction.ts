import { inject, onScopeDispose, provide, shallowRef, type InjectionKey } from 'vue'

export interface TransactionConfig {
  title: string
  fields: readonly {
    name: string
    label: string
    type?: 'text' | 'email'
    required?: boolean
  }[]
  initialValues?: Record<string, string>
  confirmText?: string
}

export type TransactionResult =
  { confirmed: true; data: Record<string, string> } | { confirmed: false; reason?: 'busy' }

interface TransactionOptions {
  onBusy?: () => void
}

const key: InjectionKey<ReturnType<typeof createTransaction>> = Symbol('transactions')

function createTransaction(options: TransactionOptions) {
  const active = shallowRef<TransactionConfig | null>(null)
  let resolve: ((result: TransactionResult) => void) | undefined

  function finish(result: TransactionResult) {
    const pending = resolve
    resolve = undefined
    active.value = null
    pending?.(result)
  }

  function open(config: TransactionConfig): Promise<TransactionResult> {
    if (resolve) {
      options.onBusy?.()
      return Promise.resolve({ confirmed: false, reason: 'busy' })
    }
    active.value = {
      ...config,
      fields: config.fields.map((field) => ({ ...field })),
      initialValues: { ...config.initialValues },
    }
    return new Promise((done) => {
      resolve = done
    })
  }

  return { active, open, finish }
}

export function provideTransactions(options: TransactionOptions = {}) {
  const transaction = createTransaction(options)
  provide(key, transaction)
  onScopeDispose(() => transaction.finish({ confirmed: false }))
  return transaction
}

export function useTransaction() {
  const transaction = inject(key)
  if (!transaction) throw new Error('Falta provideTransactions() en un componente antecesor.')
  return { open: transaction.open }
}
