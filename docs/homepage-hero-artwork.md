# Homepage banner

The default homepage banner is a compact product-led layout built in `src/components/HeroBanner.tsx` and `src/components/HeroBanner.css`. It reuses the original transparent `public/farminix_rice_front.png`, with cream and lavender backgrounds, the headline “Good rice. Great family meals.”, one Shop now action, and a smaller benefit strip. The product image and its packaging are unchanged.

The desktop stage now has a 460 px minimum height instead of the previous 690–870 px stage. Mobile uses a compact stacked layout instead of the previous fixed 950 px stage. The product and text remain separate elements so the headline can wrap without being baked into an image. Admin-uploaded carousel slides keep their configured artwork and links, inside a 460 px desktop / 360 px mobile frame with `object-fit: contain`.

The lavender navbar styling and direct homepage loading are preserved. Production build and lint checks cover the replacement implementation; the browser preview was unavailable during this update.

## Previous generated background (archived)

The former homepage used `public/home-farm-hero.png`, prepared with the built-in ImageGen tool from the existing `public/hero_banner_original.jpg`. Both assets are preserved, but the new default banner no longer loads the generated background. Its previous headline, quality seal, feature row, and purple waves have been replaced by the compact product layout.

The reference layout is implemented in `src/components/HeroBanner.tsx` and `src/components/HeroBanner.css`. Admin-uploaded custom carousel slides continue to render their configured images and links.

### Original generation prompt

Edit the provided existing Farminix rice marketing image into a clean website hero BACKGROUND ASSET, landscape aspect ratio about 16:9 (keep original wide framing). Preserve the exact three branded Farminix rice bags on the right: green bag behind, tallest purple bag center-right, gold bag right, all three front-facing with the existing Farminix logos and packaging text intact. Preserve the photoreal rice fields, distant blue mountains, bright sunrise sky, rustic wooden tabletop, bowl of raw rice, scattered grains, golden rice stalks and green foliage. Move/compose the bags into the right 54% of the image, occupying from about 22% to 82% image height. IMPORTANT: completely remove all overlaid headline text and the giant standalone Farminix logo and slogan from the LEFT HALF of the source. Replace the left 45% with softly sunlit pale white/cream atmospheric farm scene, very light and low contrast, with clear empty copy space from x=5%-44%, y=18%-78%. Keep sky and subtle fields beneath the pale overlay. Remove the abstract lavender wave shapes from the original; the website will render its own waves. No header, navigation, interface, button, icon, badge, headline or standalone text anywhere, except the printed logos/text on the product packaging. The right half must be highly detailed, vivid and realistic like the source; the left must be clean and pale enough for dark headlines. Leaves can frame the outer top corners subtly. No additional bags. No graphic design UI. This is a production background asset, not a website screenshot.

### Previous background verification

- Production TypeScript/Vite build completed.
- Lint completed with existing repository warnings.
- Browser checks covered 320, 390, 768, 1024, 1280, and 1672 pixel viewport widths, image loading, headline fit, and horizontal overflow.
- Browser interaction checks covered the story dialog, Escape dismissal and focus restoration, product navigation, mobile navigation, and custom carousel slides.
- Previews use sample cart data. No orders or payments were submitted.
