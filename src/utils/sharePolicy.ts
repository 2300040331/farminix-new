export async function sharePolicy(title: string, path: string): Promise<{ status: 'shared' | 'copied' | 'cancelled' | 'manual'; url: string }> {
  const url = new URL(path, window.location.origin).href;
  if (typeof navigator.share === 'function') {
    try { await navigator.share({ title, url }); return { status: 'shared', url }; }
    catch (error) { if ((error as { name?: string }).name === 'AbortError') return { status: 'cancelled', url }; }
  }
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(url); return { status: 'copied', url }; } catch { /* Show a selectable URL if clipboard access is unavailable. */ }
  }
  return { status: 'manual', url };
}
