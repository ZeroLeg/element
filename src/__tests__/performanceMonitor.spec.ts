import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { createPerformanceMonitor } from '../plugins/performanceMonitor'

class FakeObserver {
  static supportedEntryTypes = ['measure', 'longtask']
  static instances: FakeObserver[] = []
  callback: PerformanceObserverCallback
  types: string[] = []
  disconnect = vi.fn()

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback
    FakeObserver.instances.push(this)
  }

  observe(options: PerformanceObserverInit) {
    this.types = options.entryTypes ?? []
  }

  emit(entries: Partial<PerformanceEntry>[]) {
    this.callback(
      { getEntries: () => entries } as PerformanceObserverEntryList,
      this as unknown as PerformanceObserver,
    )
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  FakeObserver.instances = []
  FakeObserver.supportedEntryTypes = ['measure', 'longtask']
  vi.useRealTimers()
})

describe('performance monitor', () => {
  it('reports slow Vue measures and long tasks, suppresses repeated component warnings, and disconnects', () => {
    vi.stubGlobal('PerformanceObserver', FakeObserver)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const app = createApp({ render: () => h('div') })
    app.use(createPerformanceMonitor({ componentThresholdMs: 30, cooldownMs: 5000 }))
    const target = document.createElement('div')
    app.mount(target)
    const measure = FakeObserver.instances.find((observer) => observer.types.includes('measure'))!
    const longTask = FakeObserver.instances.find((observer) => observer.types.includes('longtask'))!
    measure.emit([
      { name: '<List> patch', duration: 35, startTime: 100 },
      { name: '<List> patch', duration: 40, startTime: 200 },
      { name: '<List> render', duration: 10, startTime: 300 },
      { name: 'unrelated', duration: 100, startTime: 400 },
    ])
    longTask.emit([{ duration: 75 }])
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn.mock.calls[0]?.[0]).toContain('<List> patch')
    expect(warn.mock.calls[1]?.[0]).toContain('75.0 ms')
    app.unmount()
    expect(measure.disconnect).toHaveBeenCalledOnce()
    expect(longTask.disconnect).toHaveBeenCalledOnce()
    expect(app.config.performance).toBe(false)
  })

  it('uses the timer fallback without longtask support and cleans it up', () => {
    vi.useFakeTimers()
    FakeObserver.supportedEntryTypes = ['measure']
    vi.stubGlobal('PerformanceObserver', FakeObserver)
    vi.spyOn(console, 'info').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    let now = 0
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    const app = createApp({ render: () => h('div') })
    app.use(createPerformanceMonitor())
    app.mount(document.createElement('div'))
    now = 400
    vi.advanceTimersByTime(250)
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[0]).toContain('150.0 ms')
    app.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
