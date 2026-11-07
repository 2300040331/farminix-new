import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { loadTypeScript } from './helpers/load-typescript.mjs';
const { policyPages, policyForPath, footerPolicyLinks } = loadTypeScript(new URL('../src/data/policies.ts', import.meta.url));
const { sharePolicy } = loadTypeScript(new URL('../src/utils/sharePolicy.ts', import.meta.url));

test('dedicated policy routes and legacy footer configs expose all three supplied policies', () => {
  assert.deepEqual(policyPages.map(page => page.path), ['/refund-policy', '/privacy-policy', '/terms-and-conditions']);
  for (const page of policyPages) {
    assert.equal(page.sections.length, 5); assert.equal(policyForPath(page.path + '/').id, page.id);
    for (const alias of page.aliases) assert.equal(policyForPath(alias).id, page.id);
  }
  assert.equal(policyForPath('/unknown'), undefined);
  for (const saved of [undefined, [], [{ id: 'old', label: 'Privacy Policy', url: '#' }, { id: 'refund', label: 'Refund Policy', url: '#', enabled: false }]]) {
    const links = footerPolicyLinks(saved); assert.equal(links.length, 3); assert.ok(links.every(link => link.url.startsWith('/') && link.enabled));
  }
  const extras = footerPolicyLinks([{ id: 'extra', label: 'Other information', url: '/other-information' }, { id: 'duplicate', label: 'Duplicate', url: '/other-information' }, { id: 'bad', label: 'Unsafe link', url: 'javascript:alert(1)' }]);
  assert.equal(extras.length, 4); assert.equal(extras.at(-1).url, '/other-information');
  assert.match(policyPages[0].sections[0].text, /within the specified return period/);
  assert.match(policyPages[0].sections[2].text, /5–10 business days after approval/);
});

test('policy sharing uses the real page URL and confirms copying only after clipboard success', async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window'), originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const setNavigator = value => Object.defineProperty(globalThis, 'navigator', { configurable: true, value });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { origin: 'https://farminix.test' } } });
  try {
    let sent;
    setNavigator({ share: async value => { sent = value; } });
    assert.equal((await sharePolicy('Privacy Policy', '/privacy-policy')).status, 'shared'); assert.equal(sent.url, 'https://farminix.test/privacy-policy');
    let copied;
    setNavigator({ clipboard: { writeText: async value => { copied = value; } } });
    assert.equal((await sharePolicy('Refund Policy', '/refund-policy')).status, 'copied'); assert.equal(copied, 'https://farminix.test/refund-policy');
    setNavigator({ share: async () => { throw Object.assign(new Error('cancelled'), { name: 'AbortError' }); }, clipboard: { writeText: async () => assert.fail('Cancelled sharing must not copy') } });
    assert.equal((await sharePolicy('Privacy Policy', '/privacy-policy')).status, 'cancelled');
    setNavigator({ share: async () => { throw Error('unavailable'); }, clipboard: { writeText: async () => { throw Error('denied'); } } });
    const manual = await sharePolicy('Terms and Conditions', '/terms-and-conditions'); assert.equal(manual.status, 'manual'); assert.equal(manual.url, 'https://farminix.test/terms-and-conditions');
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else delete globalThis.window;
    if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator); else delete globalThis.navigator;
  }
});

test('policy pages render every supplied clause and real footer links are shareable', async () => {
  const footer = { enabled: true, logoUrl: '', bioText: '', whatsappPhone: '', whatsappMessage: '', socialLinks: {}, companyLinks: [], helpLinks: [], legalLinks: [] };
  const server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, plugins: [{ name: 'policy-context-fixture', enforce: 'pre', resolveId(source) { if (source.endsWith('/context/AppContext')) return '\0policy-context'; if (source.endsWith('/admin/context/AdminConfigContext')) return '\0policy-admin'; }, load(id) { if (id === '\0policy-context') return 'export const useApp = () => ({ navigate() {}, setIsSupportOpen() {}, setIsCartOpen() {} })'; if (id === '\0policy-admin') return `export const useAdminConfig = () => ({ publishedConfig: { footer: ${JSON.stringify(footer)} } })`; } }] });
  try {
    const { PolicyPage } = await server.ssrLoadModule('/src/components/PolicyPage.tsx');
    const { Footer } = await server.ssrLoadModule('/src/components/Footer.tsx');
    for (const policy of policyPages) {
      const html = renderToStaticMarkup(React.createElement(PolicyPage, { policy }));
      assert.ok(html.includes(policy.title)); assert.match(html, /Share this policy/); assert.match(html, /Customer Support/);
      for (const section of policy.sections) {
        const encoded = renderToStaticMarkup(React.createElement('p', null, section.text));
        assert.ok(html.includes(encoded), `Policy wording changed: ${section.title}`);
      }
      assert.ok(!html.includes('Updated on')); assert.ok(!html.includes('7-day return'));
    }
    const html = renderToStaticMarkup(React.createElement(Footer));
    for (const policy of policyPages) assert.ok(html.includes(`href="${policy.path}"`), policy.path);
    assert.match(html, /aria-label="Legal information"/); assert.ok(!html.includes('href="#"'));
  } finally { await server.close(); }
});
