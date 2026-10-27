# Farminix intro and harvest animation

The opening screen plays the configured intro video automatically. Desktop uses `public/farminix_intro.mp4`; narrow screens use `public/farminix_intro_mobile.mp4`, with the desktop video as a fallback. Playback is muted and inline so browsers can autoplay it. The video closes the intro when it ends, and **Enter Site** remains available to skip ahead. The intro enabled setting controls the opening. It replays after a fresh page load but not during internal navigation.

The homepage harvest scene remains below the main hero and above the product collection. It starts automatically when it becomes visible, including when reduced motion is enabled, and has no Play/Pause control. It pauses while offscreen or while the document is hidden, then resumes when visible again. Desktop uses WebGL 2 with instanced geometry; phones and touch devices use a cached Canvas 2D renderer. Browsers without WebGL 2 or that lose their graphics context fall back to Canvas 2D, then SVG.

The harvest includes swaying paddy, falling rice grains, cursor-responsive perspective, and the Farminix Family Choice Rice bag. Mobile omits the large blurred background photograph and uses a lower frame-rate and pixel-density cap.

Implementation:

- `src/components/IntroVideoOverlay.tsx` and its CSS: responsive intro-video selection, autoplay, completion, and entry control.
- `src/components/PaddyHarvestScene.tsx`: automatic playback, visibility handling, and renderer fallback.
- `src/components/paddyHarvestRenderer.ts`: desktop geometry, lighting, wind, falling grains, and cleanup.
- `src/components/paddyHarvestMobileRenderer.ts`: cached mobile scene and frame-rate cap.
- `src/components/PaddyHarvestFallback.tsx`: vector fallback.
- `src/components/PaddyHarvestScene.css`: responsive layout, atmosphere, product placement, and vector animation.
- `src/App.tsx`: intro overlay and homepage scene placement.
