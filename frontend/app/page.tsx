'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Metric, PurchaseLifecycle } from './components/fintech-ui';

type Product = { sku: string; name: string; category: string; cents: number; currency: string; merchant: string; attributes: string[] };
type Proposal = { id: string; product: Product; quantity: number; total_cents: number; budget_cents: number; policy: Record<string, boolean>; reasoning: string; mode: string; state: string; order_id: string | null; audit: { event: string; at: string }[] };
type Config = { payments_enabled: boolean; capture_enabled: boolean; client_id: string };
type Buttons = { render: (element: HTMLElement) => Promise<void>; close: () => Promise<void> };
declare global { interface Window { paypal?: { Buttons: (options: { createOrder: () => Promise<string>; onApprove: () => Promise<void>; onCancel: () => void; onError: () => void }) => Buttons } } }
const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n / 100);

export default function Home() {
  const [tab, setTab] = useState('Workspace');
  const [token, setToken] = useState('');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [config, setConfig] = useState<Config>({ payments_enabled: false, capture_enabled: false, client_id: '' });
  const [request, setRequest] = useState('Find a quiet wireless keyboard for my home office');
  const [budget, setBudget] = useState('80');
  const [quantity, setQuantity] = useState('1');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [history, setHistory] = useState<Proposal[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const checkout = useRef<HTMLDivElement>(null);
  const api = useCallback(async (path: string, body?: unknown) => {
    const r = await fetch('/api' + path, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await r.json();
    if (r.status === 401) sessionStorage.removeItem('guard-session');
    if (!r.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Please check your inputs and try again.');
    return data;
  }, [token]);
  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const [c, settings] = await Promise.all([fetch('/api/catalog').then(r => r.json()), fetch('/api/config').then(r => r.json())]);
        let saved = sessionStorage.getItem('guard-session');
        if (!saved) { const r = await fetch('/api/sessions', { method: 'POST' }); if (!r.ok) throw new Error(); saved = (await r.json()).token as string; sessionStorage.setItem('guard-session', saved); }
        if (active) { setCatalog(c); setConfig(settings); setToken(saved); setReady(true); }
      } catch { if (active) setNotice('Cannot reach the backend. Start FastAPI, then reload this page.'); }
    }
    void initialize(); return () => { active = false; };
  }, []);
  const perform = useCallback(async (action: () => Promise<void>) => {
    setBusy(true); setNotice('');
    try { await action(); } catch (e) { setNotice(e instanceof Error ? e.message : 'Request failed. Please retry.'); } finally { setBusy(false); }
  }, []);
  useEffect(() => {
    if (tab !== 'Workspace' || !proposal || proposal.state !== 'APPROVED' || !config.payments_enabled || !checkout.current) return;
    let buttons: Buttons | undefined;
    let disposed = false;
    const target = checkout.current;
    const id = proposal.id;
    function render() {
      if (disposed || !window.paypal) return;
      buttons = window.paypal.Buttons({
        createOrder: async () => (await api(`/proposals/${id}/order`, {})).id,
        onApprove: async () => { await perform(async () => { const p = await api(`/proposals/${id}/buyer-approval`, {}); setProposal(p); setNotice('PayPal buyer approval verified. Capture remains separately controlled.'); }); },
        onCancel: () => setNotice('Checkout cancelled. No completed payment has been verified.'),
        onError: () => setNotice('PayPal checkout failed. Check transaction status before trying again.')
      });
      void buttons.render(target).catch(() => setNotice('Could not display PayPal checkout.'));
    }
    let script: HTMLScriptElement | undefined;
    if (window.paypal) render(); else {
      script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.client_id)}&currency=USD&intent=capture&components=buttons`;
      script.onload = render; script.onerror = () => setNotice('Could not load the PayPal SDK.'); document.body.appendChild(script);
    }
    return () => { disposed = true; void buttons?.close(); script?.remove(); };
  }, [proposal, config, api, perform, tab]);
  async function navigate(name: string) { setTab(name); if (name === 'History') await perform(async () => setHistory(await api('/transactions'))); }
  return <div className="shell">
    <aside><Link className="brand" href="/" aria-label="AgentPay Guard home"><span className="brand-mark">G</span> AgentPay<span>Guard</span></Link><div className="workspace-label">PURCHASING CONSOLE</div><nav>{['Workspace', 'Catalog', 'History', 'Demo guide'].map((name, i) => <button className={tab === name ? 'nav active' : 'nav'} key={name} onClick={() => void navigate(name)}><span aria-hidden="true">{['◇', '▦', '◷', '↗'][i]}</span>{name}</button>)}</nav><div className="sidebar-note"><span className="dot" /> Sandbox environment<p>Deliberate decisions.<br />You stay in control.</p><small>Demo catalog · USD only</small></div></aside>
    <main><header><span>YOUR WORKSPACE / <strong>{tab.toUpperCase()}</strong></span><span className="pill">SANDBOX ONLY · NO REAL MONEY</span></header>
      {tab === 'Workspace' && <><section className="intro"><div className="eyebrow">INTELLIGENCE WITH BOUNDARIES</div><h1>Let AI find it.<br /><span>You make the call.</span></h1><p>Turn a purchasing request into an explainable proposal.<br />Check the rules. Approve the amount. Pay with confidence.</p></section>
      <div className="overview-strip" aria-label="Product assurances">
        <Metric label="CATALOG" value="Grounded" detail="Authoritative SKUs and prices" />
        <Metric label="POLICY" value="Server-side" detail="Budget and merchant controls" />
        <Metric label="PAYMENT" value="Human-led" detail="Explicit approval before checkout" />
      </div>
      <PurchaseLifecycle state={proposal?.state} />
      <div className="work-grid"><section className="card request-card"><div className="card-heading"><h2>Your next purchase</h2><span className="mini">HUMAN-LED</span></div><form onSubmit={e => { e.preventDefault(); void perform(async () => { setProposal(null); const result = await api('/proposals', { request, budget_cents: Math.round(Number(budget) * 100), quantity: Number(quantity) }); if (result.clarification) setNotice(result.clarification + ' · ' + result.mode); else setProposal(result); }); }}><label htmlFor="request">What does your workspace need?</label><textarea id="request" value={request} onChange={e => setRequest(e.target.value)} maxLength={1000} minLength={3} required /><div className="fields"><div><label htmlFor="budget">Maximum total (USD)</label><input id="budget" type="number" min="0.01" max="1000" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} required /></div><div><label htmlFor="quantity">Quantity</label><input id="quantity" type="number" min="1" max="10" value={quantity} onChange={e => setQuantity(e.target.value)} required /></div></div><button className="primary" disabled={busy || !ready}>{busy ? 'Working…' : 'Find my best fit'} <span aria-hidden="true">→</span></button></form><p className="fine">The explicit budget above controls spending. No purchase happens when you ask for a recommendation.</p><div className="suggestions"><span>Try a request</span>{['Noise cancelling headphones', 'Compact keyboard', 'USB-C hub'].map(s => <button key={s} onClick={() => setRequest('Find ' + s.toLowerCase())}>{s} ↗</button>)}</div></section>
      <section className="card decision"><div className="card-heading"><h2>Decision brief</h2><span className="mini">{proposal ? proposal.state.replaceAll('_', ' ') : 'AWAITING REQUEST'}</span></div>{!proposal ? <div className="empty"><div className="orbit" aria-hidden="true">◇</div><h3>A good purchase starts<br />with a clear decision.</h3><p>Your recommendation, evidence, and policy checks will appear here.</p><div className="trust-row"><span>✓ Budget checked</span><span>✓ Human approved</span></div></div> : <><span className="mode">{proposal.mode}</span><div className="product-title"><div><small>{proposal.product.sku} / {proposal.product.merchant}</small><h3>{proposal.product.name}</h3></div><strong>{money(proposal.total_cents)}</strong></div><p>{proposal.reasoning}</p><div className="attributes">{proposal.product.attributes.map(a => <span key={a}>{a}</span>)}</div><div className="checks">{Object.entries(proposal.policy).map(([name, pass]) => <div key={name}><span>{name.replaceAll('_', ' ')}</span><strong>{pass ? '✓ Pass' : '✕ Blocked'}</strong></div>)}</div><p className="fine">{proposal.quantity} item(s) · USD · Budget {money(proposal.budget_cents)} · Proposal expires in 30 minutes.</p>{proposal.state === 'PROPOSED' && <button className="primary" disabled={busy} onClick={() => void perform(async () => setProposal(await api(`/proposals/${proposal.id}/approve`, { total_cents: proposal.total_cents, currency: 'USD', confirmed: true })))}>Approve {money(proposal.total_cents)} USD</button>}{proposal.state === 'APPROVED' && <><p className="approval">✓ Your approval is recorded. PayPal buyer approval is the next step.</p>{!config.payments_enabled && <p className="config-note">Sandbox checkout is disabled until the owner configures credentials and enables payments.</p>}<div ref={checkout} /></>}{proposal.state === 'BUYER_APPROVED' && <><p className="approval">✓ PayPal buyer approval verified. No capture has occurred.</p>{config.capture_enabled ? <button className="primary" disabled={busy} onClick={() => void perform(async () => setProposal(await api(`/proposals/${proposal.id}/capture`, { confirmed: true })))}>Capture approved sandbox payment</button> : <p className="config-note">Capture is locked until the owner separately enables and authorizes it.</p>}</>}{proposal.state === 'COMPLETED' && <p className="approval">✓ Sandbox capture verified</p>}<details><summary>View decision audit</summary>{proposal.audit.map((e, i) => <p className="audit" key={i}>{e.event} <time>{new Date(e.at).toLocaleString()}</time></p>)}</details></> }</section></div>
      <section className="principles"><div><span>01 / GROUNDED</span><h3>A real catalog. Clear prices.</h3><p>Recommendations reference controlled demo inventory, with no invented prices.</p></div><div><span>02 / GOVERNED</span><h3>Rules outside the model.</h3><p>Budget, merchant, availability, and price checks run on the server.</p></div><div><span>03 / APPROVED</span><h3>The final say is yours.</h3><p>A proposal is never a payment. You approve before checkout begins.</p></div></section></>}
      {tab === 'Catalog' && <section><div className="eyebrow">CONTROLLED DEMO INVENTORY</div><h1>Compare your options.</h1><p>Fictional products for sandbox demonstration. No goods are fulfilled.</p><div className="catalog">{catalog.map(p => <article className="card" key={p.sku}><div className="product-icon" aria-hidden="true">{p.category === 'keyboard' ? '⌨' : p.category === 'headphones' ? '◉' : '▣'}</div><small>{p.sku} · {p.category}</small><h2>{p.name}</h2><strong className="price">{money(p.cents)}</strong><ul>{p.attributes.map(a => <li key={a}>{a}</li>)}</ul><p className="fine">{p.merchant}</p><button className="secondary" onClick={() => { setRequest(`Find ${p.attributes[0].toLowerCase()} ${p.category}`); setTab('Workspace'); }}>Use these preferences →</button></article>)}</div></section>}
      {tab === 'History' && <section><div className="eyebrow">YOUR SESSION ONLY</div><h1>Every decision, accounted for.</h1><p>Proposals and approvals are distinct from verified payments.</p>{history.length === 0 ? <div className="card"><h2>No decisions yet</h2><p>Create your first proposal in the workspace.</p></div> : history.map(p => <article className="card history" key={p.id}><div><span className="mini">{p.state.replaceAll('_',' ')}</span><h2>{p.product.name} · {money(p.total_cents)}</h2><small>{p.order_id ? `Sandbox order ${p.order_id}` : 'No PayPal order created'}</small></div><button className="secondary" disabled={busy} onClick={() => void perform(async () => { const updated = await api(`/proposals/${p.id}/status`); setHistory(items => items.map(item => item.id === p.id ? updated : item)); })}>Refresh verified status</button><details><summary>Decision audit</summary>{p.audit.map((e, i) => <p key={i}>{e.event} · {new Date(e.at).toLocaleString()}</p>)}</details></article>)}</section>}
      {tab === 'Demo guide' && <section className="guide"><div className="eyebrow">A SAFE WAY TO EXPLORE</div><h1>See the guardrails work.</h1><div className="card"><h2>1. Ask for a keyboard</h2><p>Use “quiet wireless keyboard” with an $80 budget. Inspect the SKU, attributes, total, and policy checks.</p><h2>2. Try a constraint</h2><p>Lower the budget to $20. The system asks you to adjust the request instead of proposing an over-budget purchase.</p><h2>3. Approve deliberately</h2><p>Review the exact amount and merchant. Approval records your consent; it does not complete a payment.</p><h2>4. Use sandbox checkout</h2><p>The owner must first configure PayPal sandbox credentials. Use a sandbox buyer account, never a real payment account. A payment is marked complete only after the server verifies the capture.</p><h2>5. Inspect the evidence</h2><p>Open History and expand the audit. The recommendation mode explicitly identifies hosted AI or the deterministic non-AI fallback.</p><p className="config-note">This build uses fictional catalog inventory. No real goods, refunds, shipping, or live payments.</p></div></section>}
      {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></div>}
      <footer><span>AgentPay Guard</span><span>AI proposes. Policy checks. You approve.</span></footer>
    </main>
  </div>;
}
