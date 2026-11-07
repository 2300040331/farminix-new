# Homepage sections and footer socials

- The collection no longer includes the “Everyday meals. Lasting memories.” promotional panel. A single featured product is centered without an empty second column.
- The shared “From farm to family / Good food brings us together” footer invitation is removed on all storefront routes, including below The Farminix Collection. The redundant banner-side slogan is also removed.
- The footer has labeled Instagram, Facebook, and WhatsApp icons with 44 px targets and keyboard focus styling. Links open in a separate tab.
- Official profile defaults supplied by the site owner are stored in `src/data/socialLinks.ts`: Instagram `https://www.instagram.com/farminix.in/` and Facebook `https://www.facebook.com/p/Farminix-61595330121099/`.
- Saved profile URLs can override those defaults in Footer Management. Empty legacy Instagram/Facebook fields use the official defaults. X and YouTube remain hidden until a profile is configured. Empty, invalid, non-web, or generic platform-homepage URLs do not create public icons.
- WhatsApp uses the existing configured business phone and message.
