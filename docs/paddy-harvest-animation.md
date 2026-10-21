# Paddy harvest animation

The homepage opens with a full-screen harvest animation, the published Farminix logo at the top, and the tagline **Family Choice Brand**. The opening logo uses a warm ivory treatment without a surrounding card to match the field scene; the regular site header retains its brand colors. It automatically reveals the homepage after 6.5 seconds once the scene is ready. Visitors can enter immediately using the Enter Farminix button or Escape. It replays on a page reload but does not replay during internal navigation. The existing intro enabled setting controls it; the configured story videos remain available through Watch Our Story.

The same scene remains immediately below the main hero and above the product collection. It uses native WebGL 2 with instanced geometry for paddy stems, narrow leaves, grain clusters, and individual falling grains. The attached paddy photograph is preserved as `public/paddy-harvest-reference.png` and used as the softened backdrop.

Grains detach from their moving stem positions, accelerate downward, rotate around multiple axes, and move through perspective depth. Warm lighting gives the grains their rounded surface. The paddy sways gently; cursor movement changes the camera perspective.

Implementation:

- `src/components/PaddyHarvestScene.tsx`: controls, visibility handling, reduced-motion preferences, and fallback.
- `src/components/paddyHarvestRenderer.ts`: geometry, lighting, wind, grain release, gravity, and renderer cleanup.
- `src/components/PaddyHarvestScene.css`: responsive layout and CSS fallback.
- `src/components/IntroVideoOverlay.tsx` and its CSS: opening screen, logo, timing, and entry controls. A native modal dialog manages keyboard focus and prevents interacting with the page underneath; page scrolling is restored on close.
- `src/App.tsx`: lazy loading with the enabled homepage hero section.

The animation can be paused and resumed. It pauses when offscreen or when the document is hidden, starts paused when reduced motion is requested, caps render pixel density, and releases GPU resources on unmount. With reduced motion, the opening screen displays the static scene and dismisses after 1.5 seconds. Browsers without WebGL 2 receive a falling-grain CSS animation over the paddy photograph.

Validation covered real WebGL rendering, moving and falling grains, pause/resume, offscreen suspension, mobile layout, reduced-motion preferences, and the unsupported-WebGL fallback. A short MP4 preview was recorded separately; the website runs the interactive renderer directly and does not download that video.
