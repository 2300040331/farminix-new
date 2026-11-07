# Farminix intro and harvest animation

The website opens directly to the homepage without an opening animation, video overlay, or Enter Site step. `App.tsx` no longer mounts the intro component or waits for an intro to finish. Existing intro configuration and video assets remain stored for compatibility but do not trigger playback on page load. Direct links and search parameters are preserved.

The animated paddy section has also been removed from the homepage. The hero renders directly before the remaining configured sections, without the harvest scene, animated grains, or its reserved space. `App.tsx` no longer imports or mounts `PaddyHarvestScene`, so its renderers and styles are not loaded by the storefront.

The existing animation components and assets remain in the repository as legacy source. The compact homepage banner and its static rice-bag image are separate from the removed animation.

Legacy implementation (not mounted by the storefront):

- `src/components/IntroVideoOverlay.tsx` and its CSS: legacy intro implementation, no longer mounted by the storefront.
- `src/components/PaddyHarvestScene.tsx`: automatic playback, visibility handling, and renderer fallback.
- `src/components/paddyHarvestRenderer.ts`: desktop geometry, lighting, wind, falling grains, and cleanup.
- `src/components/paddyHarvestMobileRenderer.ts`: cached mobile scene and frame-rate cap.
- `src/components/PaddyHarvestFallback.tsx`: vector fallback.
- `src/components/PaddyHarvestScene.css`: responsive layout, atmosphere, product placement, and vector animation.

`src/App.tsx` now renders the homepage directly, with neither the opening intro nor the inline paddy animation.
