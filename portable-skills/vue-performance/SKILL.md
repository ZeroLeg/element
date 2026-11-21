---
name: vue-performance
description: Diagnose and improve Vue application performance, including large tables, loading states, rendering, and measurement; use when implementing or reviewing performance-sensitive Vue features.
---

# Vue performance

Inspect the target project's instructions, dependencies, component patterns, tests and architecture first. Adapt to its Vue and UI-library versions. Preserve behavior and accessibility; avoid new dependencies or broad architectural rewrites without a concrete need.

1. Reproduce with representative data. Establish a baseline in a production build, recording device, browser, data size and relevant network/CPU conditions. Separate network, parsing, JavaScript, Vue updates, layout and paint. Use browser Performance and Network panels, Vue DevTools and user timing marks as useful.
2. Address the measured bottleneck. For large tables consider server pagination/filtering and virtualization where UX and component support permit; compare complexity and compatibility. Progressive batches can yield between updates, but still create all rows and may increase total work. Tune batch size with measurements; never assume five is optimal.
3. Separate API access, business transformations and view state according to existing conventions. Use cohesive composables and dependency boundaries where useful. Apply SOLID pragmatically, not as mandatory layers. Preserve stable keys, accessible loading/empty/error states and existing features.
4. Define whether loading ends on data arrival, first usable content or completion of incremental work. Show it before expensive work, handle errors and cleanup in finally, prevent stale requests overwriting newer results, and cancel pending work on disposal where appropriate. A spinner cannot animate while the main thread is blocked.
5. nextTick waits for Vue's pending DOM updates, not network, child async work or paint. One or two requestAnimationFrame callbacks can provide a paint opportunity, not a paint-completion guarantee; callbacks may be throttled in background tabs. Avoid arbitrary delays for production synchronization. Coordinate asynchronously loading descendants through explicit readiness events or promises.
6. Use lazy route imports for infrequently visited routes; consider defineAsyncComponent for costly conditional components. Neither automatically accelerates an already-mounted table. Use shallowRef for large immutable data only when measured and update semantics are acceptable; replace the root or explicitly trigger changes.
7. Verify relevant loading, error, empty, cancellation/race, repeated-load and unmount behavior. Add focused tests for meaningful state transitions and edge cases; profile before and after under comparable conditions. Report measurements, environment, tradeoffs and unverified assumptions. Timing assertions alone do not prove performance.

Consult official Vue, browser and UI-library documentation for installed versions when specific APIs or behavior need verification.
