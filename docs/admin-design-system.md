# Farminix admin design system

The dashboard and all management screens share the colors, typography, spacing, surfaces, and control styling in `src/admin/admin.css` and `src/admin/admin-editors.css`. The latter also styles the sign-in screen.

- Use standard `lucide-react` SVG icons with a consistent 2 px stroke. Dashboard actions and metrics use plain, restrained icon treatments. `AdminSymbol` maps payment and delivery settings to Lucide icons without changing stored storefront configuration.
- Wrap editor content in `.admin-editor`. The admin layout does this for every management route.
- Use `.admin-page-heading` for page introduction/actions and `.admin-page-heading-inline` for a heading inside an existing card.
- Use `.admin-panel` for sections and dialogs, `.admin-tabs` for tab navigation, and the common form styles for inputs, selects, textareas, labels, and focus states.
- Keep product images, storefront previews, availability, and order data tied to their existing sources. UI styling does not replace content or backend behavior.
- Preserve mobile navigation, horizontal table scrolling, accessible names, disabled controls, destructive-action distinctions, and reduced-motion behavior.

The shared styles are applied to all 32 management page modules, their image/coupon/product editors, and admin sign-in. Future editor pages should use the same classes rather than introducing separate component themes.
