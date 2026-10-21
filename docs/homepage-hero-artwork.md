# Homepage hero artwork

The homepage uses `public/home-farm-hero.png`, prepared with the built-in ImageGen tool from the existing `public/hero_banner_original.jpg`. The original asset is preserved. Headline text, navigation, buttons, icons, the quality seal, and purple waves are rendered by React/CSS/SVG.

The reference layout is implemented in `src/components/HeroBanner.tsx` and `src/components/HeroBanner.css`. Admin-uploaded custom carousel slides continue to render their configured images and links.

## Final generation prompt

Edit the provided existing Farminix rice marketing image into a clean website hero BACKGROUND ASSET, landscape aspect ratio about 16:9 (keep original wide framing). Preserve the exact three branded Farminix rice bags on the right: green bag behind, tallest purple bag center-right, gold bag right, all three front-facing with the existing Farminix logos and packaging text intact. Preserve the photoreal rice fields, distant blue mountains, bright sunrise sky, rustic wooden tabletop, bowl of raw rice, scattered grains, golden rice stalks and green foliage. Move/compose the bags into the right 54% of the image, occupying from about 22% to 82% image height. IMPORTANT: completely remove all overlaid headline text and the giant standalone Farminix logo and slogan from the LEFT HALF of the source. Replace the left 45% with softly sunlit pale white/cream atmospheric farm scene, very light and low contrast, with clear empty copy space from x=5%-44%, y=18%-78%. Keep sky and subtle fields beneath the pale overlay. Remove the abstract lavender wave shapes from the original; the website will render its own waves. No header, navigation, interface, button, icon, badge, headline or standalone text anywhere, except the printed logos/text on the product packaging. The right half must be highly detailed, vivid and realistic like the source; the left must be clean and pale enough for dark headlines. Leaves can frame the outer top corners subtly. No additional bags. No graphic design UI. This is a production background asset, not a website screenshot.

## Verification

- Production TypeScript/Vite build completed.
- Lint completed with existing repository warnings.
- Browser checks covered 320, 390, 768, 1024, 1280, and 1672 pixel viewport widths, image loading, headline fit, and horizontal overflow.
- Browser interaction checks covered the story dialog, Escape dismissal and focus restoration, product navigation, mobile navigation, and custom carousel slides.
- Previews use sample cart data. No orders or payments were submitted.
