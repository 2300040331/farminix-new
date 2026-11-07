export function enquiryRedisFixture(config = { queriesPage: { enabled: true } }) {
  const records = new Map(), indexes = new Map(), sessions = new Map(), customers = new Map(), orders = new Map();
  let calls = 0;
  const index = key => { if (!indexes.has(key)) indexes.set(key, new Map()); return indexes.get(key); };
  const fetch = async (_url, options) => {
    calls++; const command = JSON.parse(options.body); let result = null;
    const [op, key] = command;
    if (op === 'GET') result = key === 'farminix:site-config:v1' ? JSON.stringify(config) : sessions.get(key) || null;
    else if (op === 'HGET') result = (key === 'farminix:customers:v1' ? customers : key === 'farminix:orders:records:v1' ? orders : records).get(command[2]) || null;
    else if (op === 'HMGET') result = command.slice(2).map(id => records.get(id) || null);
    else if (op === 'ZCARD') result = index(key).size;
    else if (op === 'ZREVRANGE') result = [...index(key)].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0])).slice(command[2], command[3] + 1).map(([id]) => id);
    else if (op === 'EVAL') {
      const keys = command.slice(3, 3 + command[2]), args = command.slice(3 + command[2]);
      if (key.includes('local old=')) {
        const [id, value, score] = args, next = JSON.parse(value), previous = records.has(id) ? JSON.parse(records.get(id)) : null;
        if (previous) {
          const fields = ['name', 'mobile', 'email', 'message', 'kind', 'customerId', 'orderId'];
          result = fields.some(field => (previous[field] || '') !== (next[field] || '')) || (previous.source || 'enquiry') !== next.source ? 'CONFLICT' : records.get(id);
        } else { records.set(id, value); index(keys[1]).set(id, score); if (keys[2]) index(keys[2]).set(id, score); result = value; }
      } else if (key.includes('item.status=')) {
        const [id, status, notes, hasReply, reply, date] = args;
        if (records.has(id)) { const row = JSON.parse(records.get(id)); row.status = status; row.adminNotes = notes; if (hasReply === '1' && (row.publicReply || '') !== reply) { row.publicReply = reply; row.repliedAt = date; } result = JSON.stringify(row); records.set(id, result); }
      } else if (key.includes('item.deletedAt')) {
        const [id, action, score, date] = args;
        if (records.has(id)) {
          const row = JSON.parse(records.get(id));
          if (action === 'restore') { delete row.deletedAt; index(keys[2]).delete(id); index(keys[1]).set(id, score); if (keys[3]) index(keys[3]).set(id, score); }
          else { row.deletedAt = date; index(keys[1]).delete(id); index(keys[2]).set(id, score); if (keys[3]) index(keys[3]).delete(id); }
          result = JSON.stringify(row); records.set(id, result);
        }
      } else throw Error('Unexpected script');
    } else throw Error(`Unexpected Redis command ${op}`);
    return { ok: true, json: async () => ({ result }) };
  };
  return { fetch, records, indexes, sessions, customers, orders, get calls() { return calls; } };
}
