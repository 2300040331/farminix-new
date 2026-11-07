import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { loadTypeScript } from './helpers/load-typescript.mjs';
const { supportContacts, sendSupportRequest } = loadTypeScript(new URL('../src/utils/support.ts', import.meta.url));

test('support links use actual configured contacts; invalid channels stay hidden', () => {
  const config = { aboutPage: { contactPhone: '+91 7989743595', contactEmail: 'info@farminix.in' }, footer: { whatsappPhone: '7989743595' }, manufacturer: { supportHours: 'Mon–Sat, 8 am–8 pm' } };
  const contacts = supportContacts(config, 'I need help with my order.');
  assert.equal(contacts.callUrl, 'tel:+917989743595'); assert.match(contacts.emailUrl, /^mailto:info%40farminix.in/);
  assert.match(contacts.whatsappUrl, /^https:\/\/wa.me\/917989743595/); assert.match(decodeURIComponent(contacts.whatsappUrl), /I need help with my order/);
  const invalid = supportContacts({ aboutPage: { contactPhone: '1800-123-FARM', contactEmail: 'invalid' }, footer: { whatsappPhone: '0000000000' } });
  assert.equal(invalid.callUrl, ''); assert.equal(invalid.whatsappUrl, ''); assert.equal(invalid.emailUrl, '');
});

test('submission only reports success for a real confirmed reference and preserves the retry ID', async () => {
  const original = globalThis.fetch, id = '12345678-1234-1234-1234-123456789abc';
  const payload = { name: 'Test Customer', mobile: '9999999999', email: '', message: 'Please help with this issue.', kind: 'complaint', source: 'support', website: '' };
  const ids = [];
  try {
    globalThis.fetch = async (_url, options) => { ids.push(JSON.parse(options.body).requestId); return { ok: false, status: 503, json: async () => ({ error: 'Storage unavailable' }) }; };
    await assert.rejects(sendSupportRequest(payload, id), /Storage unavailable/);
    globalThis.fetch = async (_url, options) => { ids.push(JSON.parse(options.body).requestId); return { ok: true, status: 201, json: async () => ({ id }) }; };
    assert.equal(await sendSupportRequest(payload, id), id); assert.deepEqual(ids, [id, id]);
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ reply: 'An agent is connected' }) });
    await assert.rejects(sendSupportRequest(payload, id), /not been confirmed/);
  } finally { globalThis.fetch = original; }
});

test('support UI contains real issue fields and actual replies, without fabricated connection or promises', async () => {
  const server = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, plugins: [{ name: 'support-context-fixture', enforce: 'pre', resolveId(source) { if (source.endsWith('/context/AppContext')) return '\0support-context'; if (source.endsWith('/admin/context/AdminConfigContext')) return '\0support-admin'; }, load(id) { if (id === '\0support-context') return 'export const useApp = () => globalThis.__supportFixture'; if (id === '\0support-admin') return `export const useAdminConfig = () => ({ publishedConfig: { header: {}, footer: { whatsappPhone: '917989743595' }, aboutPage: { contactPhone: '+91 7989743595', contactEmail: 'info@farminix.in' }, manufacturer: { supportHours: 'Monday–Saturday: 8 am–8 pm' } } })`; } }] });
  globalThis.__supportFixture = { isSupportOpen: true, user: null, orders: [], setIsSupportOpen() {}, requestLogin() {} };
  try {
    const { SupportModal } = await server.ssrLoadModule('/src/modals/SupportModal.tsx');
    const { SupportRequestsView } = await server.ssrLoadModule('/src/components/SupportRequests.tsx');
    const markup = renderToStaticMarkup(React.createElement(SupportModal));
    for (const text of ['Farminix Support', 'Send support request', 'Mobile number', 'Describe the issue', 'My requests', 'tel:+917989743595']) assert.ok(markup.includes(text), text);
    for (const fake of ['Live Agent Connected', '24/7 Live Support', '1800-123-FARM', '100% resolution', '2 minutes']) assert.ok(!markup.includes(fake), fake);
    assert.match(markup, /<dialog/); assert.match(markup, /aria-label="Close support"/);
    assert.match(renderToStaticMarkup(React.createElement(SupportRequestsView, { requests: [] })), /No support requests yet/);
    const actual = renderToStaticMarkup(React.createElement(SupportRequestsView, { requests: [{ id: 'request-id', message: 'My order has not arrived', kind: 'complaint', status: 'in-progress', createdAt: '2026-11-07T06:30:00Z', publicReply: 'The dispatch team is checking.', repliedAt: '2026-11-07T07:30:00Z' }] }));
    for (const text of ['My order has not arrived', 'In progress', 'Farminix response', 'The dispatch team is checking.', 'request-id']) assert.ok(actual.includes(text), text);
  } finally { delete globalThis.__supportFixture; await server.close(); }
});
