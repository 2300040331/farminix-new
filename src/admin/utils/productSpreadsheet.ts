import type { Product } from '../../types';

const columns = [
  'id', 'name', 'category', 'brand', 'price', 'oldPrice', 'discountPercentage', 'weight', 'weightOptions', 'image', 'galleryImages',
  'deliveryTime', 'stockCount', 'description', 'ingredients', 'highlights', 'benefits', 'nutritionBasis', 'energy', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium',
  'badges', 'specifications', 'howToUse', 'storageInstructions', 'origin', 'shelfLife', 'faqs', 'enabled',
  'storyHeadline', 'storySubheadline', 'storyCalloutTitle', 'storyCalloutDesc',
];

const escapeXml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const asLines = (items?: string[]) => (items || []).join('\n');
const structuredLines = (items: Array<{ title?: string; desc?: string; label?: string; value?: string; question?: string; answer?: string }> = []) => items.map((item) => {
  const left = item.title ?? item.label ?? item.question ?? '';
  const right = item.desc ?? item.value ?? item.answer ?? '';
  return `${left} :: ${right}`;
}).join('\n');

function productRow(product: Product): string[] {
  const nutrition = product.nutritionalInfo || { energy: '', protein: '', carbs: '', fat: '' };
  return [
    product.id, product.name, product.category, product.brand, String(product.price ?? 0), String(product.oldPrice ?? 0), String(product.discountPercentage ?? 0), product.weight,
    asLines(product.weightOptions), product.image, asLines(product.galleryImages), product.deliveryTime, String(product.stockCount ?? 0), product.description,
    asLines(product.ingredients), structuredLines((product.highlights || []).map((item) => ({ title: item.title, desc: item.desc }))), asLines(product.benefits), product.nutritionBasis || '',
    nutrition.energy || '', nutrition.protein || '', nutrition.carbs || '', nutrition.fat || '', nutrition.fiber || '', nutrition.sugar || '', nutrition.sodium || '',
    asLines(product.badges), structuredLines((product.specifications || []).map((item) => ({ label: item.label, value: item.value }))), asLines(product.howToUse),
    product.storageInstructions || '', product.origin || '', product.shelfLife || '', structuredLines((product.faqs || []).map((item) => ({ question: item.question, answer: item.answer }))),
    product.enabled === false ? 'false' : 'true', product.storySection?.headline || '', product.storySection?.subheadline || '', product.storySection?.calloutTitle || '', product.storySection?.calloutDesc || '',
  ];
}

const columnLetters = (index: number) => {
  let value = index + 1;
  let result = '';
  while (value > 0) {
    const rem = (value - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
};

function worksheetXml(rows: string[][]): string {
  const xmlRows = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => `<c r="${columnLetters(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`).join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${xmlRows}</sheetData></worksheet>`;
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStored(files: Array<{ name: string; content: string }>): Blob {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.content);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true); lv.setUint16(26, name.length, true);
    local.set(name, 30); local.set(data, 30 + name.length); locals.push(local);
    const entry = new Uint8Array(46 + name.length);
    const ev = new DataView(entry.buffer);
    ev.setUint32(0, 0x02014b50, true); ev.setUint16(4, 20, true); ev.setUint16(6, 20, true); ev.setUint16(8, 0x0800, true); ev.setUint16(10, 0, true);
    ev.setUint32(16, crc, true); ev.setUint32(20, data.length, true); ev.setUint32(24, data.length, true); ev.setUint16(28, name.length, true); ev.setUint32(42, offset, true);
    entry.set(name, 46); central.push(entry); offset += local.length;
  }
  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true); endView.setUint16(8, files.length, true); endView.setUint16(10, files.length, true); endView.setUint32(12, centralSize, true); endView.setUint32(16, offset, true);
  const parts = [...locals, ...central, end];
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of parts) { output.set(part, cursor); cursor += part.length; }
  return new Blob([output.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadProductSpreadsheet(products: Product[]) {
  const productSheet = worksheetXml([columns, ...products.map(productRow)]);
  const readmeSheet = worksheetXml([
    ['Farminix product import guide'],
    ['Fill or update rows on the Products sheet. Keep the ID column to update an existing product; leave it blank to add a new product.'],
    ['Use one line per entry in list columns. For Highlights, Specifications, and FAQs use “Title :: description” on each line.'],
    ['Blank cells keep the existing value when updating. Price, stock, image URL, and availability should be verified before publishing.'],
    ['Save as .xlsx and upload it in Admin → Products. CSV exports are also accepted.'],
  ]);
  const files = [
    { name: '[Content_Types].xml', content: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
    { name: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { name: 'xl/workbook.xml', content: '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Products" sheetId="1" r:id="rId1"/><sheet name="Read me" sheetId="2" r:id="rId2"/></sheets></workbook>' },
    { name: 'xl/_rels/workbook.xml.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>' },
    { name: 'xl/worksheets/sheet1.xml', content: productSheet },
    { name: 'xl/worksheets/sheet2.xml', content: readmeSheet },
  ];
  const blob = zipStored(files);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'farminix-product-catalog.xlsx'; anchor.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

async function unzip(file: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const bytes = new Uint8Array(file);
  const view = new DataView(file);
  let endOffset = -1;
  for (let i = Math.max(0, bytes.length - 65557); i <= bytes.length - 22; i++) if (view.getUint32(i, true) === 0x06054b50) endOffset = i;
  if (endOffset < 0) throw new Error('This file is not a valid .xlsx workbook.');
  const entries = view.getUint16(endOffset + 10, true);
  let cursor = view.getUint32(endOffset + 16, true);
  const decoder = new TextDecoder();
  const result = new Map<string, Uint8Array>();
  for (let i = 0; i < entries; i++) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break;
    const method = view.getUint16(cursor + 10, true), compressedSize = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true), extraLength = view.getUint16(cursor + 30, true), commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    const localNameLength = view.getUint16(localOffset + 26, true), localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const content = bytes.slice(start, start + compressedSize);
    if (method === 0) result.set(name, content);
    else if (method === 8 && 'DecompressionStream' in window) {
      const stream = new Blob([content]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      result.set(name, new Uint8Array(await new Response(stream).arrayBuffer()));
    } else throw new Error('This .xlsx compression format is not supported by this browser. Upload a .csv export from Excel instead.');
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return result;
}

function sheetRows(xml: string, sharedStrings: string[]): string[][] {
  const documentXml = new DOMParser().parseFromString(xml, 'application/xml');
  if (documentXml.querySelector('parsererror')) throw new Error('The spreadsheet worksheet could not be read.');
  return Array.from(documentXml.getElementsByTagName('row')).map((row) => {
    const values: string[] = [];
    for (const cell of Array.from(row.getElementsByTagName('c'))) {
      const ref = cell.getAttribute('r') || '';
      const letters = ref.match(/^[A-Z]+/)?.[0] || '';
      let column = 0;
      for (const letter of letters) column = column * 26 + letter.charCodeAt(0) - 64;
      column--;
      const type = cell.getAttribute('t');
      const value = type === 'inlineStr' ? cell.querySelector('is t')?.textContent || '' : cell.querySelector('v')?.textContent || '';
      values[column] = type === 's' ? (sharedStrings[Number(value)] || '') : type === 'b' ? (value === '1' ? 'true' : 'false') : value;
    }
    return values;
  });
}

async function readXlsx(file: File): Promise<string[][]> {
  const zip = await unzip(await file.arrayBuffer());
  const decode = (name: string) => {
    const value = zip.get(name);
    return value ? new TextDecoder().decode(value) : '';
  };
  const sharedStrings = decode('xl/sharedStrings.xml');
  const strings = sharedStrings ? Array.from(new DOMParser().parseFromString(sharedStrings, 'application/xml').getElementsByTagName('si')).map((item) => Array.from(item.getElementsByTagName('t')).map((node) => node.textContent || '').join('')) : [];
  const workbook = new DOMParser().parseFromString(decode('xl/workbook.xml'), 'application/xml');
  const sheet = workbook.getElementsByTagName('sheet')[0];
  if (!sheet) throw new Error('No worksheet was found in this workbook.');
  const relId = sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || sheet.getAttribute('r:id');
  const relations = new DOMParser().parseFromString(decode('xl/_rels/workbook.xml.rels'), 'application/xml');
  const relation = Array.from(relations.getElementsByTagName('Relationship')).find((item) => item.getAttribute('Id') === relId);
  const target = relation?.getAttribute('Target');
  if (!target) throw new Error('The first worksheet could not be located.');
  const sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
  const xml = decode(sheetPath);
  if (!xml) throw new Error('The first worksheet is empty or missing.');
  return sheetRows(xml, strings);
}

const splitLines = (value: string) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
const splitStructured = (value: string) => splitLines(value).map((line) => {
  const splitAt = line.indexOf(' :: ');
  return splitAt < 0 ? [line, ''] : [line.slice(0, splitAt).trim(), line.slice(splitAt + 4).trim()];
});
const cleanNumber = (value: string, fallback: number) => value.trim() ? Number(value.replace(/[₹,\s]/g, '')) || 0 : fallback;
const headerKey = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

export async function importProductSpreadsheet(file: File, currentProducts: Product[]): Promise<{ products: Product[]; changed: number; added: number }> {
  const isCsv = file.name.toLowerCase().endsWith('.csv');
  const rows = isCsv ? parseCsv(await file.text()) : await readXlsx(file);
  if (rows.length < 2) throw new Error('The spreadsheet needs a header row and at least one product row.');
  const headers = rows[0].map(headerKey);
  if (!headers.includes('name') || !headers.includes('category')) throw new Error('The Products sheet must include Name and Category columns. Download the Farminix template for the supported columns.');
  const existing = [...currentProducts];
  let changed = 0, added = 0;
  for (const row of rows.slice(1)) {
    const values: Record<string, string> = {};
    headers.forEach((key, index) => { values[key] = row[index] || ''; });
    if (!values.name?.trim()) continue;
    const match = existing.find((product) => (values.id && product.id === values.id.trim()) || product.name.trim().toLowerCase() === values.name.trim().toLowerCase());
    const base: Product = match || {
      id: values.id?.trim() || `prod-${crypto.randomUUID()}`, name: '', category: 'Grocery', price: 0, oldPrice: 0, discountPercentage: 0, weight: '', weightOptions: [], image: '',
      galleryImages: [], deliveryTime: '', inStock: false, stockCount: 0, brand: '', description: '', enabled: true, catalogOnly: true,
      ingredients: [], benefits: [], highlights: [], specifications: [], howToUse: [], badges: [], faqs: [], storageInstructions: '',
      nutritionalInfo: { energy: '', protein: '', carbs: '', fat: '' },
    };
    const take = (key: string, fallback: string) => values[headerKey(key)]?.trim() ? values[headerKey(key)] : fallback;
    const getList = (key: string, fallback: string[] = []) => values[headerKey(key)]?.trim() ? splitLines(values[headerKey(key)]) : fallback;
    const [energy, protein, carbs, fat, fiber, sugar, sodium] = ['energy', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'].map((key) => take(key, base.nutritionalInfo?.[key as keyof NonNullable<Product['nutritionalInfo']>] || ''));
    const [storyHeadline, storySubheadline, storyCalloutTitle, storyCalloutDesc] = ['storyHeadline', 'storySubheadline', 'storyCalloutTitle', 'storyCalloutDesc'].map((key) => take(key, ''));
    const stockCount = Math.max(0, Math.floor(cleanNumber(take('stockCount', String(base.stockCount)), base.stockCount)));
    const price = Math.max(0, cleanNumber(take('price', String(base.price)), base.price));
    const oldPrice = Math.max(0, cleanNumber(take('oldPrice', String(base.oldPrice)), base.oldPrice));
    const discountPercentage = Math.max(0, cleanNumber(take('discountPercentage', String(base.discountPercentage || 0)), base.discountPercentage || 0));
    const highlights = values.highlights?.trim() ? splitStructured(values.highlights).filter(([title, desc]) => title && desc).map(([title, desc]) => ({ icon: 'leaf', title, desc })) : base.highlights || [];
    const specifications = values.specifications?.trim() ? splitStructured(values.specifications).filter(([label, value]) => label && value).map(([label, value]) => ({ label, value })) : base.specifications || [];
    const faqs = values.faqs?.trim() ? splitStructured(values.faqs).filter(([question, answer]) => question && answer).map(([question, answer]) => ({ question, answer })) : base.faqs || [];
    const enabledValue = values.enabled?.trim().toLowerCase();
    const product: Product = {
      ...base,
      id: values.id?.trim() || base.id,
      name: take('name', base.name), category: take('category', base.category), brand: take('brand', base.brand),
      price, oldPrice, discountPercentage, weight: take('weight', base.weight), weightOptions: getList('weightOptions', base.weightOptions),
      image: take('image', base.image), galleryImages: getList('galleryImages', base.galleryImages), deliveryTime: take('deliveryTime', base.deliveryTime),
      stockCount, inStock: stockCount > 0, description: take('description', base.description), ingredients: getList('ingredients', base.ingredients),
      highlights, benefits: getList('benefits', base.benefits), nutritionBasis: take('nutritionBasis', base.nutritionBasis || ''),
      nutritionalInfo: { energy, protein, carbs, fat, fiber, sugar, sodium }, badges: getList('badges', base.badges), specifications,
      howToUse: getList('howToUse', base.howToUse), storageInstructions: take('storageInstructions', base.storageInstructions || ''),
      origin: take('origin', base.origin || ''), shelfLife: take('shelfLife', base.shelfLife || ''), faqs,
      enabled: enabledValue === 'true' || enabledValue === 'yes' || enabledValue === '1' ? true : enabledValue === 'false' || enabledValue === 'no' || enabledValue === '0' ? false : base.enabled,
      catalogOnly: !(price > 0 && take('weight', base.weight).trim() && take('image', base.image).trim()),
      storySection: { ...(base.storySection || {}), ...(storyHeadline ? { headline: storyHeadline } : {}), ...(storySubheadline ? { subheadline: storySubheadline } : {}), ...(storyCalloutTitle ? { calloutTitle: storyCalloutTitle } : {}), ...(storyCalloutDesc ? { calloutDesc: storyCalloutDesc } : {}) },
    };
    if (match) { existing[existing.indexOf(match)] = product; changed++; }
    else { existing.push(product); added++; }
  }
  if (changed + added === 0) throw new Error('No product rows with a name were found.');
  return { products: existing, changed, added };
}
