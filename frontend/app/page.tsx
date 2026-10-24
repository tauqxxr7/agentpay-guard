'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppShell } from './components/app-shell';
import { CatalogView, CommandCenter, DemoGuide, HistoryView, ShoppingStudio } from './components/views';
import { Icon } from './components/fintech-ui';
import { redactOrder } from './lib/format';
import type { AppConfig, Product, Proposal, ViewName } from './lib/types';

type PayPalCallbackData = { orderID?: string; orderId?: string };
type Buttons = { render: (element: HTMLElement) => Promise<void>; close: () => Promise<void> };
declare global { interface Window { paypal?: { Buttons: (options: { createOrder: () => Promise<string>; onApprove: (data: PayPalCallbackData) => Promise<void>; onCancel: (data: PayPalCallbackData) => void; onError: (error: unknown) => void }) => Buttons } } }
const backendFetch = (path: string, init?: RequestInit) => fetch('/api' + path, { ...init, signal: AbortSignal.timeout(45000) });
const checkoutLog = (stage: string, detail: Record<string, string> = {}) => console.info('[AgentPay Guard] PayPal diagnostic', { stage, ...detail });
async function responseJson(response: Response) { const data = await response.json().catch(() => ({})); if (!response.ok) { if ([502, 503, 504].includes(response.status)) throw new Error('The demo backend may be waking up. Wait a moment, then try again.'); throw new Error(typeof data.detail === 'string' ? data.detail : 'Please check your inputs and try again.'); } return data; }

export default function Home() {
  const [view, setView] = useState<ViewName>('Command');
  const [token, setToken] = useState('');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig>({ payments_enabled: false, capture_enabled: false, client_id: '' });
  const [request, setRequest] = useState('Find a quiet wireless keyboard for my home office');
  const [budget, setBudget] = useState('80');
  const [quantity, setQuantity] = useState('1');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [resumeOrderId, setResumeOrderId] = useState<string | null>(null);
  const [history, setHistory] = useState<Proposal[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const checkout = useRef<HTMLDivElement>(null);
  const api = useCallback(async (path: string, body?: unknown) => { const response = await backendFetch(path, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: body === undefined ? undefined : JSON.stringify(body) }); if (response.status === 401) sessionStorage.removeItem('guard-session'); return responseJson(response); }, [token]);

  useEffect(() => { let active = true; async function initialize() { try { const [items, settings] = await Promise.all([backendFetch('/catalog').then(responseJson), backendFetch('/config').then(responseJson)]); let saved = sessionStorage.getItem('guard-session'); if (!saved) { const response = await backendFetch('/sessions', { method: 'POST' }); saved = (await responseJson(response)).token as string; sessionStorage.setItem('guard-session', saved); } const transactions = await backendFetch('/transactions', { headers: { Authorization: 'Bearer ' + saved } }).then(responseJson); if (active) { setCatalog(items); setConfig(settings); setToken(saved); setHistory(transactions); setReady(true); } } catch (error) { if (active) setNotice(error instanceof Error ? error.message : 'The demo backend may be waking up. Wait a moment, then reload.'); } } void initialize(); return () => { active = false; }; }, []);
  useEffect(() => { const rejected = (event: PromiseRejectionEvent) => checkoutLog('browser_unhandled_rejection', { type: event.reason instanceof Error ? event.reason.name : 'unknown' }); const failed = (event: ErrorEvent) => checkoutLog('browser_error', { type: event.error instanceof Error ? event.error.name : 'unknown' }); const blocked = (event: SecurityPolicyViolationEvent) => checkoutLog('csp_violation', { directive: event.effectiveDirective || 'unknown' }); window.addEventListener('unhandledrejection', rejected); window.addEventListener('error', failed); document.addEventListener('securitypolicyviolation', blocked); checkoutLog('diagnostics_ready'); return () => { window.removeEventListener('unhandledrejection', rejected); window.removeEventListener('error', failed); document.removeEventListener('securitypolicyviolation', blocked); }; }, []);
  const perform = useCallback(async (action: () => Promise<void>) => { setBusy(true); setNotice(''); try { await action(); } catch (error) { setNotice(error instanceof Error ? error.message : 'Request failed. Please retry.'); } finally { setBusy(false); } }, []);

  useEffect(() => {
    if (view !== 'Studio' || !proposal || !['APPROVED', 'ORDER_CREATED'].includes(proposal.state) || !config.payments_enabled || !checkout.current) return;
    let buttons: Buttons | undefined; let disposed = false; let script: HTMLScriptElement | undefined; const target = checkout.current; const id = proposal.id;
    function render() { if (disposed || !window.paypal) return; let orderCreationFailed = false; buttons = window.paypal.Buttons({ createOrder: async () => { try { const order = resumeOrderId ? await api(`/proposals/${id}/resume`, {}) : await api(`/proposals/${id}/order`, {}); if (resumeOrderId && order.id !== resumeOrderId) throw new Error('Recovered order identity does not match the selected order.'); checkoutLog(resumeOrderId ? 'resumeOrder' : 'createOrder', { order: redactOrder(order.id) }); return order.id; } catch (error) { orderCreationFailed = true; checkoutLog(resumeOrderId ? 'resumeOrder_error' : 'createOrder_error'); setNotice(error instanceof Error ? error.message : 'PayPal checkout could not be prepared.'); throw error; } }, onApprove: async data => { checkoutLog('onApprove', { order: redactOrder(data.orderID) }); await perform(async () => { if (resumeOrderId && data.orderID !== resumeOrderId) throw new Error('PayPal approved a different order than the selected recovery order.'); const updated = await api(`/proposals/${id}/buyer-approval`, {}); setProposal(updated); checkoutLog('buyer_approval_verified', { order: redactOrder(data.orderID) }); setNotice('PayPal buyer approval verified. Capture remains separately controlled.'); }); }, onCancel: data => { checkoutLog('onCancel', { order: redactOrder(data.orderID || data.orderId) }); setNotice('Checkout cancelled. No completed payment has been verified.'); }, onError: error => { checkoutLog('onError', { type: error instanceof Error ? error.name : 'unknown' }); if (!orderCreationFailed) setNotice('PayPal buyer checkout failed. Check transaction status before trying again.'); } }); void buttons.render(target).catch(() => setNotice('Could not display PayPal checkout.')); }
    if (window.paypal) render(); else { script = document.createElement('script'); script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.client_id)}&currency=USD&intent=capture&components=buttons`; script.onload = () => { checkoutLog('sdk_loaded'); render(); }; script.onerror = () => { checkoutLog('sdk_load_error'); setNotice('Could not load the PayPal SDK.'); }; document.body.appendChild(script); }
    return () => { disposed = true; void buttons?.close(); script?.remove(); };
  }, [proposal, resumeOrderId, config, api, perform, view]);

  const navigate = useCallback((next: ViewName) => { setView(next); if (next === 'History' && token) void perform(async () => setHistory(await api('/transactions'))); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [api, perform, token]);
  const submitProposal = (event: React.FormEvent) => { event.preventDefault(); void perform(async () => { setProposal(null); setResumeOrderId(null); const result = await api('/proposals', { request, budget_cents: Math.round(Number(budget) * 100), quantity: Number(quantity) }); if (result.clarification) setNotice(`${result.clarification} · ${result.mode}`); else setProposal(result); }); };
  return <AppShell view={view} onNavigate={navigate} ready={ready}>
    {view === 'Command' && <CommandCenter history={history} ready={ready} config={config} onNavigate={navigate}/>}
    {view === 'Studio' && <ShoppingStudio request={request} budget={budget} quantity={quantity} proposal={proposal} config={config} busy={busy} ready={ready} resumeOrderId={resumeOrderId} checkoutRef={checkout} onRequest={setRequest} onBudget={setBudget} onQuantity={setQuantity} onSubmit={submitProposal} onApprove={() => void perform(async () => setProposal(await api(`/proposals/${proposal?.id}/approve`, { total_cents: proposal?.total_cents, currency: 'USD', confirmed: true })))} onCapture={() => void perform(async () => setProposal(await api(`/proposals/${proposal?.id}/capture`, { confirmed: true })))} onPrompt={value => setRequest(`Find ${value.toLowerCase()}`)}/>}
    {view === 'Catalog' && <CatalogView catalog={catalog} onSelect={product => { setRequest(`Find ${product.attributes[0].toLowerCase()} ${product.category}`); setBudget(String(Math.ceil(product.cents / 100 * 1.25))); navigate('Studio'); }}/>}
    {view === 'History' && <HistoryView history={history} busy={busy} onResume={item => void perform(async () => { const recovered = await api(`/proposals/${item.id}/resume`, {}); if (recovered.id !== item.order_id) throw new Error('Recovered order identity does not match the selected order.'); setResumeOrderId(recovered.id); setProposal(recovered.proposal); navigate('Studio'); })} onRefresh={item => void perform(async () => { const updated = await api(`/proposals/${item.id}/status`); setHistory(items => items.map(existing => existing.id === item.id ? updated : existing)); })}/>}
    {view === 'Demo' && <DemoGuide onStart={() => { setRequest('Find a quiet wireless keyboard for my home office'); setBudget('80'); setQuantity('1'); navigate('Studio'); }}/>}
    {notice && <div className="toast" role="status" aria-live="polite"><span className="toast-icon">!</span><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice('')}><Icon name="close"/></button></div>}
  </AppShell>;
}
