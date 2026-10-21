export const normalizeSearchText = (text: string) => text.toLowerCase().trim().replace(/[-\s]+/g, '').replace(/s$/, '');

export const getProductSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
