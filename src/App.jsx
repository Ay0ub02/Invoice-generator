import React, { useState, useRef, useEffect } from 'react';
import { Printer, Plus, Trash2, RotateCcw, FileText, ScanLine, Languages, Loader2 } from 'lucide-react';

/* ============================================================
   Scan par image : appel à l'API Claude (vision).
   - Dans l'aperçu Claude.ai, l'appel fonctionne tel quel.
   - Dans votre propre projet, ne mettez JAMAIS la clé API dans
     le navigateur : pointez SCAN_ENDPOINT vers votre serveur
     (proxy) qui ajoute la clé et relaie la requête.
   ============================================================ */
const SCAN_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const SCAN_MODEL = 'claude-sonnet-4-6';

/* ============================ Traductions ============================ */
const I18N = {
  fr: {
    appTitle: 'Générateur de facture commerciale',
    appSub: 'Format A4, identique au modèle PDF',
    reset: 'Réinitialiser',
    print: 'Imprimer / Enregistrer en PDF',
    language: 'Langue',
    tabItems: 'Marchandises',
    tabParties: 'Adresses',
    tabGeneral: 'Détails et poids',
    articles: 'Articles',
    add: 'Ajouter',
    article: 'Article',
    removeItem: "Supprimer l'article",
    newItem: 'NOUVEL ARTICLE',
    description: 'Description',
    customsCode: 'Code douanier',
    quantity: 'Quantité',
    unitPrice: 'Prix unitaire (€) :',
    sender: 'Expéditeur (SHIP FROM)',
    recipient: 'Destinataire (SHIP TO)',
    name: 'Nom',
    company: 'Société',
    street: 'Rue',
    cityPostal: 'Ville, code postal',
    country: 'Pays',
    phone: 'Téléphone',
    awb: 'Numéro AWB',
    invoiceDate: 'Date de la facture',
    netWeight: 'Poids net',
    grossWeight: 'Poids brut',
    pieces: 'Nombre de pièces',
    transport: 'Frais de transport (€)',
    declared: 'Valeur déclarée (vide = total calculé :',
    preview: 'Aperçu de la page (A4)',
    scanTitle: 'Remplir depuis une image',
    scanHint: 'Importez, glissez ou collez (Ctrl+V) n’importe quelle image : photo, capture, scan, JPG, PNG, WebP, HEIC, BMP, TIFF, GIF, AVIF, SVG ou PDF. Les champs se remplissent automatiquement.',
    scanFormat: 'Format d’image non lisible. Convertissez-la en JPG ou PNG puis réessayez.',
    scanBtn: 'Scanner une image',
    scanning: 'Analyse en cours…',
    scanOk: 'Champs remplis. Vérifiez les valeurs avant d’imprimer.',
    scanEmpty: 'Aucune donnée reconnue dans cette image.',
    scanErr: 'Échec du scan :',
  },
  en: {
    appTitle: 'Commercial Invoice Generator',
    appSub: 'A4 format, identical to the PDF template',
    reset: 'Reset',
    print: 'Print / Save as PDF',
    language: 'Language',
    tabItems: 'Goods',
    tabParties: 'Addresses',
    tabGeneral: 'Details & weight',
    articles: 'Items',
    add: 'Add',
    article: 'Item',
    removeItem: 'Remove item',
    newItem: 'NEW ITEM',
    description: 'Description',
    customsCode: 'Commodity code',
    quantity: 'Quantity',
    unitPrice: 'Unit price (€):',
    sender: 'Sender (SHIP FROM)',
    recipient: 'Recipient (SHIP TO)',
    name: 'Name',
    company: 'Company',
    street: 'Street',
    cityPostal: 'City, postal code',
    country: 'Country',
    phone: 'Phone',
    awb: 'AWB number',
    invoiceDate: 'Invoice date',
    netWeight: 'Net weight',
    grossWeight: 'Gross weight',
    pieces: 'Number of pieces',
    transport: 'Transport charges (€)',
    declared: 'Declared value (empty = calculated total:',
    preview: 'Page preview (A4)',
    scanTitle: 'Fill from an image',
    scanHint: 'Upload, drag or paste (Ctrl+V) any image: photo, screenshot, scan, JPG, PNG, WebP, HEIC, BMP, TIFF, GIF, AVIF, SVG or PDF. The fields are filled in automatically.',
    scanFormat: 'Unreadable image format. Convert it to JPG or PNG and try again.',
    scanBtn: 'Scan an image',
    scanning: 'Analyzing…',
    scanOk: 'Fields filled in. Check the values before printing.',
    scanEmpty: 'No data recognized in this image.',
    scanErr: 'Scan failed:',
  },
  it: {
    appTitle: 'Generatore di fattura commerciale',
    appSub: 'Formato A4, identico al modello PDF',
    reset: 'Reimposta',
    print: 'Stampa / Salva in PDF',
    language: 'Lingua',
    tabItems: 'Merci',
    tabParties: 'Indirizzi',
    tabGeneral: 'Dettagli e peso',
    articles: 'Articoli',
    add: 'Aggiungi',
    article: 'Articolo',
    removeItem: "Elimina l'articolo",
    newItem: 'NUOVO ARTICOLO',
    description: 'Descrizione',
    customsCode: 'Codice doganale',
    quantity: 'Quantità',
    unitPrice: 'Prezzo unitario (€):',
    sender: 'Mittente (SHIP FROM)',
    recipient: 'Destinatario (SHIP TO)',
    name: 'Nome',
    company: 'Società',
    street: 'Via',
    cityPostal: 'Città, CAP',
    country: 'Paese',
    phone: 'Telefono',
    awb: 'Numero AWB',
    invoiceDate: 'Data della fattura',
    netWeight: 'Peso netto',
    grossWeight: 'Peso lordo',
    pieces: 'Numero di colli',
    transport: 'Spese di trasporto (€)',
    declared: 'Valore dichiarato (vuoto = totale calcolato:',
    preview: 'Anteprima della pagina (A4)',
    scanTitle: 'Compila da un’immagine',
    scanHint: 'Carica, trascina o incolla (Ctrl+V) qualsiasi immagine: foto, screenshot, scansione, JPG, PNG, WebP, HEIC, BMP, TIFF, GIF, AVIF, SVG o PDF. I campi vengono compilati automaticamente.',
    scanFormat: 'Formato immagine non leggibile. Convertila in JPG o PNG e riprova.',
    scanBtn: 'Scansiona un’immagine',
    scanning: 'Analisi in corso…',
    scanOk: 'Campi compilati. Controlla i valori prima di stampare.',
    scanEmpty: 'Nessun dato riconosciuto in questa immagine.',
    scanErr: 'Scansione non riuscita:',
  },
};

const LANGS = [
  ['fr', 'Français'],
  ['en', 'English'],
  ['it', 'Italiano'],
];

/* ============================ Données ============================ */
const initialInvoiceData = {
  awb: '2567692562',
  invoiceDate: '29/10/2026',
  sender: {
    name: 'HICHAM ABBASSI',
    company: 'DHL BENI MELLAL MAROC',
    cityPostal: 'BENI MELLAL, 23999',
    country: 'MOROCCO',
    phone: '+212632777320',
  },
  recipient: {
    name: 'SALAH ABOU FARISS',
    company: 'SALAH ABOU FARISS',
    street: 'VIA ERNESTO TEODORO MONETA 20 20',
    cityPostal: 'BESANA IN BRIANZA, 20832',
    country: 'ITALY',
    phone: '+393517563811',
  },
  items: [
    { id: '1', description: 'TRACKSUITS', commodityCode: '611090', quantity: '1 PCS', unitValue: 7, subtotal: 7 },
    { id: '2', description: 'T SHIRT MEN’S', commodityCode: '61091000090', quantity: '1 PCS', unitValue: 7, subtotal: 7 },
    { id: '3', description: 'SUIT SHIRT MEN’S', commodityCode: '', quantity: '1 PCS', unitValue: 7, subtotal: 7 },
  ],
  weights: {
    declaredValueManual: '',
    netWeight: '4.5 Kg',
    piecesCount: '2',
    grossWeight: '4.5 kg',
    transportCharges: '40',
  },
};

const fmt = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return n;
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
};

const qtyOf = (q) => {
  const m = String(q).match(/\d+/);
  return m ? parseFloat(m[0]) : 1;
};

const readAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error('Lecture du fichier impossible'));
    r.readAsDataURL(file);
  });

const MAX_SIDE = 2000; // taille max (px) envoyée à l'API : allège les photos de téléphone

const isHeic = (file) => /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

const loadBitmap = (blob) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url;
  });

/* Charge la bibliothèque heic2any depuis un CDN uniquement quand un fichier HEIC est importé
   (aucune installation npm nécessaire). */
let heicPromise = null;
const loadHeic2any = () => {
  if (window.heic2any) return Promise.resolve(window.heic2any);
  if (!heicPromise) {
    heicPromise = new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      el.onload = () => resolve(window.heic2any);
      el.onerror = () => { heicPromise = null; reject(new Error('heic2any')); };
      document.head.appendChild(el);
    });
  }
  return heicPromise;
};

/* Convertit N'IMPORTE QUELLE image lisible par le navigateur en JPEG (formats
   acceptés par l'API : jpeg, png, gif, webp). Les PDF sont envoyés tels quels. */
async function prepareScanInput(file) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    return { kind: 'document', media_type: 'application/pdf', data: await readAsBase64(file) };
  }

  let source = file;
  if (isHeic(file)) {
    try {
      const heic2any = await loadHeic2any();
      const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
      source = Array.isArray(out) ? out[0] : out;
    } catch (_) {
      source = file; // Safari sait lire le HEIC nativement
    }
  }

  const img = await loadBitmap(source);
  const w0 = img.naturalWidth || img.width || 1000;
  const h0 = img.naturalHeight || img.height || 1000;
  const ratio = Math.min(1, MAX_SIDE / Math.max(w0, h0));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w0 * ratio);
  canvas.height = Math.round(h0 * ratio);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // fond blanc pour les PNG/SVG transparents
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  return { kind: 'image', media_type: 'image/jpeg', data: dataUrl.split(',')[1] };
}

const SCAN_PROMPT = `Extract the data of this shipping invoice / label / document and answer with ONE JSON object only (no text, no markdown), using exactly this shape. Use "" for anything not visible, never invent values. Keep names and addresses in UPPERCASE as written.
{
  "awb": "",
  "invoiceDate": "DD/MM/YYYY",
  "sender": { "name": "", "company": "", "cityPostal": "", "country": "", "phone": "" },
  "recipient": { "name": "", "company": "", "street": "", "cityPostal": "", "country": "", "phone": "" },
  "items": [ { "description": "", "commodityCode": "", "quantity": "1 PCS", "unitValue": 0 } ],
  "weights": { "netWeight": "", "grossWeight": "", "piecesCount": "", "transportCharges": "" }
}
"unitValue" is the price of ONE unit in EUR (a number). "transportCharges" is a number without currency.`;

const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  fontSize: '12px',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const tabStyle = (active) => ({
  padding: '8px 12px',
  border: 'none',
  background: 'none',
  borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
  color: active ? '#2563eb' : '#64748b',
  fontWeight: 'bold',
  cursor: 'pointer',
});

/* ============================ Composant ============================ */
export default function App() {
  const [data, setData] = useState(initialInvoiceData);
  const [activeTab, setActiveTab] = useState('items');
  const [lang, setLang] = useState('fr');
  const [scan, setScan] = useState({ status: 'idle', message: '' }); // idle | loading | ok | error
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const t = I18N[lang];

  const handlePartyChange = (party, field, value) =>
    setData((prev) => ({ ...prev, [party]: { ...prev[party], [field]: value } }));

  const handleWeightChange = (field, value) =>
    setData((prev) => ({ ...prev, weights: { ...prev.weights, [field]: value } }));

  const handleItemChange = (index, field, value) => {
    setData((prev) => {
      const items = [...prev.items];
      const item = { ...items[index], [field]: value };
      if (field === 'unitValue' || field === 'quantity') {
        item.subtotal = qtyOf(item.quantity) * (parseFloat(item.unitValue) || 0);
      }
      items[index] = item;
      return { ...prev, items };
    });
  };

  const addItem = () =>
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: String(Date.now()), description: t.newItem, commodityCode: '', quantity: '1 PCS', unitValue: 10, subtotal: 10 },
      ],
    }));

  const removeItem = (index) =>
    setData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  /* ---------- Scan d'image ---------- */
  const applyScan = (r) => {
    const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';
    const mergeObj = (base, src) => {
      const out = { ...base };
      Object.keys(base).forEach((k) => {
        if (src && has(src[k])) out[k] = String(src[k]).trim();
      });
      return out;
    };

    let filled = false;
    setData((prev) => {
      const next = { ...prev };
      if (has(r.awb)) { next.awb = String(r.awb).trim(); filled = true; }
      if (has(r.invoiceDate)) { next.invoiceDate = String(r.invoiceDate).trim(); filled = true; }
      if (r.sender) { next.sender = mergeObj(prev.sender, r.sender); filled = true; }
      if (r.recipient) { next.recipient = mergeObj(prev.recipient, r.recipient); filled = true; }
      if (r.weights) {
        next.weights = { ...mergeObj(prev.weights, r.weights), declaredValueManual: '' };
        filled = true;
      }
      if (Array.isArray(r.items) && r.items.length > 0) {
        next.items = r.items.map((it, i) => {
          const quantity = has(it.quantity) ? String(it.quantity).trim() : '1 PCS';
          const unitValue = parseFloat(it.unitValue) || 0;
          return {
            id: String(Date.now() + i),
            description: String(it.description || '').trim().toUpperCase(),
            commodityCode: String(it.commodityCode || '').trim(),
            quantity,
            unitValue,
            subtotal: qtyOf(quantity) * unitValue,
          };
        });
        filled = true;
      }
      return next;
    });
    return filled;
  };

  const processScanFile = async (file) => {
    if (!file) return;
    setScan({ status: 'loading', message: t.scanning });
    try {
      let prepared;
      try {
        prepared = await prepareScanInput(file);
      } catch (_) {
        throw new Error(t.scanFormat);
      }
      const block = { type: prepared.kind, source: { type: 'base64', media_type: prepared.media_type, data: prepared.data } };

      const res = await fetch(SCAN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: SCAN_MODEL,
          max_tokens: 1000,
          messages: [{ role: 'user', content: [block, { type: 'text', text: SCAN_PROMPT }] }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const text = (json.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

      const filled = applyScan(parsed);
      setScan(filled ? { status: 'ok', message: t.scanOk } : { status: 'error', message: t.scanEmpty });
    } catch (err) {
      setScan({ status: 'error', message: `${t.scanErr} ${err.message}` });
    }
  };

  const handleScanFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    processScanFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processScanFile(e.dataTransfer.files && e.dataTransfer.files[0]);
  };

  // Coller une image (capture d'écran, copie) avec Ctrl+V
  useEffect(() => {
    const onPaste = (e) => {
      const items = Array.from((e.clipboardData && e.clipboardData.items) || []);
      const item = items.find((i) => i.kind === 'file' && (i.type.startsWith('image/') || i.type === 'application/pdf'));
      if (item) {
        e.preventDefault();
        processScanFile(item.getAsFile());
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* ---------- Calculs ---------- */
  const calculatedTotal = data.items.reduce((acc, it) => acc + (parseFloat(it.subtotal) || 0), 0);
  const declaredValue = data.weights.declaredValueManual !== '' ? data.weights.declaredValueManual : calculatedTotal;

  const partyLines = (p, keys) => keys.map((k) => p[k]).filter((v) => v !== undefined && String(v).trim() !== '');

  const scanColor = scan.status === 'ok' ? '#059669' : scan.status === 'error' ? '#dc2626' : '#475569';

  return (
    <div className="app-shell" style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* ───────── Barre supérieure (non imprimée) ───────── */}
      <header
        className="no-print"
        style={{ backgroundColor: '#0f172a', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#3b82f6', borderRadius: '8px', padding: '6px 10px', display: 'flex' }}>
            <FileText size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{t.appTitle}</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{t.appSub}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1' }}>
            <Languages size={16} aria-hidden="true" />
            <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{t.language}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label={t.language}
              style={{ padding: '7px 10px', background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
            >
              {LANGS.map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => setData(initialInvoiceData)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            <RotateCcw size={16} /> {t.reset}
          </button>
          <button
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <Printer size={16} /> {t.print}
          </button>
        </div>
      </header>

      <div className="app-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* ───────── Formulaire (en haut) ───────── */}
        <div className="no-print" style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Scan d'image */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '12px 14px', marginBottom: '16px', border: dragOver ? '2px solid #2563eb' : '1px dashed #93c5fd', borderRadius: '8px', backgroundColor: dragOver ? '#dbeafe' : '#eff6ff' }}
          >
            <div style={{ flex: '1 1 260px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a' }}>{t.scanTitle}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{t.scanHint}</div>
              {scan.message && (
                <div role="status" style={{ fontSize: '12px', fontWeight: 600, color: scanColor, marginTop: '6px' }}>{scan.message}</div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.heic,.heif,.tif,.tiff,.bmp,.avif,.svg,.jfif,application/pdf" onChange={handleScanFile} style={{ display: 'none' }} />
            <button
              onClick={() => fileRef.current && fileRef.current.click()}
              disabled={scan.status === 'loading'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', background: scan.status === 'loading' ? '#94a3b8' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: scan.status === 'loading' ? 'wait' : 'pointer' }}
            >
              {scan.status === 'loading' ? <Loader2 size={16} className="spin" /> : <ScanLine size={16} />}
              {scan.status === 'loading' ? t.scanning : t.scanBtn}
            </button>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('items')} style={tabStyle(activeTab === 'items')}>{t.tabItems}</button>
            <button onClick={() => setActiveTab('parties')} style={tabStyle(activeTab === 'parties')}>{t.tabParties}</button>
            <button onClick={() => setActiveTab('general')} style={tabStyle(activeTab === 'general')}>{t.tabGeneral}</button>
          </div>

          {activeTab === 'items' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{t.articles} ({data.items.length})</span>
                <button
                  onClick={addItem}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 10px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Plus size={14} /> {t.add}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {data.items.map((item, index) => (
                  <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>{t.article} {index + 1}</span>
                      <button onClick={() => removeItem(index)} aria-label={t.removeItem} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input style={{ ...inputStyle, marginBottom: '6px' }} placeholder={t.description} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                      <input style={inputStyle} placeholder={t.customsCode} value={item.commodityCode} onChange={(e) => handleItemChange(index, 'commodityCode', e.target.value)} />
                      <input style={inputStyle} placeholder={t.quantity} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>{t.unitPrice}</label>
                      <input type="number" style={inputStyle} value={item.unitValue} onChange={(e) => handleItemChange(index, 'unitValue', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'parties' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '13px' }}>{t.sender}</h4>
                {['name', 'company', 'cityPostal', 'country', 'phone'].map((f) => (
                  <input key={f} style={{ ...inputStyle, marginBottom: '6px' }} placeholder={t[f]} aria-label={t[f]} value={data.sender[f]} onChange={(e) => handlePartyChange('sender', f, e.target.value)} />
                ))}
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '13px' }}>{t.recipient}</h4>
                {['name', 'company', 'street', 'cityPostal', 'country', 'phone'].map((f) => (
                  <input key={f} style={{ ...inputStyle, marginBottom: '6px' }} placeholder={t[f]} aria-label={t[f]} value={data.recipient[f]} onChange={(e) => handlePartyChange('recipient', f, e.target.value)} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {[
                [t.awb, data.awb, (v) => setData({ ...data, awb: v })],
                [t.invoiceDate, data.invoiceDate, (v) => setData({ ...data, invoiceDate: v })],
              ].map(([label, value, onChange]) => (
                <div key={label}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>{label} :</label>
                  <input style={{ ...inputStyle, marginTop: '4px' }} value={value} onChange={(e) => onChange(e.target.value)} />
                </div>
              ))}
              {[
                [t.netWeight, 'netWeight'],
                [t.grossWeight, 'grossWeight'],
                [t.pieces, 'piecesCount'],
                [t.transport, 'transportCharges'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>{label} :</label>
                  <input style={{ ...inputStyle, marginTop: '4px' }} value={data.weights[key]} onChange={(e) => handleWeightChange(key, e.target.value)} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>{t.declared} {fmt(calculatedTotal)} EUR) :</label>
                <input style={{ ...inputStyle, marginTop: '4px' }} value={data.weights.declaredValueManual} onChange={(e) => handleWeightChange('declaredValueManual', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* ───────── Feuille A4 (en bas) : le document reste en anglais, comme le modèle PDF ───────── */}
        <div className="preview-wrap" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div className="no-print" style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '10px', textAlign: 'center' }}>
            {t.preview}
          </div>
          <div id="printable-invoice" className="invoice-page" style={{ margin: '0 auto' }}>
            <h1 className="inv-title">FACTURE</h1>

            <div className="inv-parties">
              <div className="inv-party">
                <div className="inv-party-title">SHIP FROM</div>
                {partyLines(data.sender, ['name', 'company', 'cityPostal', 'country', 'phone']).map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
              <div className="inv-party">
                <div className="inv-party-title">SHIP TO</div>
                {partyLines(data.recipient, ['name', 'company', 'street', 'cityPostal', 'country', 'phone']).map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </div>

            <div className="inv-awb">
              <span>AWB : {data.awb}</span>
              <span className="inv-date">Invoice Date : {data.invoiceDate}</span>
            </div>

            <table className="inv-table">
              <colgroup>
                <col style={{ width: '23%' }} />
                <col style={{ width: '18.1%' }} />
                <col style={{ width: '19%' }} />
                <col style={{ width: '19.9%' }} />
                <col style={{ width: '19.9%' }} />
              </colgroup>
              <thead>
                <tr className="inv-head-row">
                  <th>FULL DESCRIPTION<br />OF GOODS</th>
                  <th>COMMODITY<br />CODE</th>
                  <th>QUANTITY</th>
                  <th>UNITE<br />VALUE(EUR)</th>
                  <th>SUBTOTALE<br />VALUE</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="inv-row">
                    <td>{item.description}</td>
                    <td>{item.commodityCode}</td>
                    <td>{item.quantity}</td>
                    <td>{fmt(item.unitValue)} EUR</td>
                    <td>{fmt(item.subtotal)} EUR</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="inv-summary">
              <div className="inv-summary-row" style={{ paddingRight: '8.5mm' }}>
                <span>DECLARAE VALUE : {fmt(declaredValue)} EUR</span>
                <span>NET WEIGHT : {data.weights.netWeight}</span>
              </div>
              <div className="inv-summary-row" style={{ paddingRight: '4.3mm', borderBottom: '0.45mm solid #000' }}>
                <span>NUMBER OF PIECE : {data.weights.piecesCount}</span>
                <span>TOTAL GROSS WEIGHT : {data.weights.grossWeight}</span>
              </div>
            </div>

            <div className="inv-transport">Total Trasnport charges (EUR) : {data.weights.transportCharges}€</div>

            <div className="inv-signature">Signature :</div>
          </div>
        </div>
      </div>

      {/* Animation du bouton de scan */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>

      
<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

        /* ===== Feuille A4 ===== */
        .invoice-page {
          width: 210mm;
          height: 296mm;               /* 1 mm de moins que A4 : évite la 2e page blanche */
          box-sizing: border-box;
          padding: 11mm 10mm 0;
          background: #fff;
          color: #000;
          font-family: 'Open Sans', 'Noto Sans', Arial, Helvetica, sans-serif;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);
          overflow: hidden;
          flex-shrink: 0;
        }

        .inv-title {
          text-align: center;
          font-size: 16pt;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 1.2mm;
          margin: 0 0 19mm;
          line-height: 1.2;
        }

        .inv-parties {
          display: grid;
          grid-template-columns: 59% 41%;  /* SHIP TO commence à la même position que sur le PDF */
          height: 66mm;                /* espace fixe avant la ligne AWB */
          padding: 0;                  /* aucun retrait : le texte démarre au bord gauche du tableau */
        }
        .inv-party {
          font-size: 8.5pt;
          font-weight: 700;
          line-height: 1.55;
          text-align: left;
          padding: 0;
          margin: 0;
        }
        .inv-party-title {
          font-size: 12pt;
          text-decoration: underline;
          text-underline-offset: 0.8mm;
          margin-bottom: 1.5mm;
          line-height: 1.3;
        }

        .inv-awb {
          display: flex;
          justify-content: space-between;
          font-size: 10pt;
          font-weight: 700;
          line-height: 5mm;
          margin-bottom: 1.5mm;
          padding-right: 14mm;         /* la date s'arrête avant le bord du tableau */
        }

        /* ===== Tableau ===== */
        .inv-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }
        .inv-table th,
        .inv-table td {
          border: 0.45mm solid #000;
          text-align: center;
          vertical-align: middle;
          padding: 0 2mm;
        }
        .inv-head-row th {
          height: 18mm;
          font-size: 8.5pt;
          font-weight: 700;
          line-height: 1.4;
        }
        .inv-row td {
          height: 14.2mm;
          font-size: 9.5pt;
          font-weight: 400;
          word-break: break-word;
        }

        /* ===== Bloc valeur déclarée / poids ===== */
        .inv-summary {
          width: 58.8%;
          margin-left: 41.2%;
          box-sizing: border-box;
          border-left: 0.45mm solid #000;
          border-right: 0.45mm solid #000;
        }
        .inv-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 13.8mm;
          box-sizing: border-box;
          padding: 0 4.3mm 0 2.5mm;
          font-size: 9pt;
          font-weight: 700;
          border-bottom: 0.45mm solid #000;
        }

        .inv-transport {
          margin: 24mm 0 0 76mm;       /* décalé comme sur le modèle */
          font-size: 9pt;
          font-weight: 700;
        }
        .inv-signature {
          margin: 36mm 0 0 129mm;
          font-size: 9.5pt;
          font-weight: 400;
        }

        /* ===== Impression ===== */
        @page { size: A4 portrait; margin: 0; }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .app-shell, .app-body, .preview-wrap {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
            max-width: none !important;
            width: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }
          .invoice-page {
            box-shadow: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 296mm !important;
            break-after: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}