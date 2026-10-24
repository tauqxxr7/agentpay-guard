import type { ReactNode } from 'react';
import { humanize } from '../lib/format';

export function Icon({ name, size = 18 }: { name: 'grid' | 'spark' | 'catalog' | 'history' | 'guide' | 'shield' | 'arrow' | 'check' | 'clock' | 'lock' | 'menu' | 'close'; size?: number }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
    catalog: <><path d="M4 5.5 12 2l8 3.5-8 3.5-8-3.5Z"/><path d="M4 5.5v9L12 19l8-4.5v-9M12 9v10"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    guide: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5ZM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function StatusBadge({ state, children }: { state?: string; children?: ReactNode }) {
  const tone = ['COMPLETED', 'BUYER_APPROVED'].includes(state || '') ? 'verified' : ['FAILED', 'EXPIRED'].includes(state || '') ? 'blocked' : ['ORDER_CREATED', 'APPROVED'].includes(state || '') ? 'pending' : 'neutral';
  return <span className={`status-badge ${tone}`}><span className="status-dot" />{children || humanize(state || 'Ready')}</span>;
}

const stages = [['REQUEST', 'Intent'], ['PROPOSAL', 'AI recommendation'], ['POLICY', 'Rules verified'], ['HUMAN', 'Approval'], ['PAYPAL', 'Buyer approval'], ['CAPTURE', 'Capture']] as const;

export function PurchaseLifecycle({ state, compact = false, paymentsEnabled = true }: { state?: string; compact?: boolean; paymentsEnabled?: boolean }) {
  const complete = state === 'COMPLETED' ? 6 : state === 'BUYER_APPROVED' ? 5 : state === 'ORDER_CREATED' || state === 'APPROVED' ? 4 : state === 'PROPOSED' ? 3 : 1;
  return <section className={`lifecycle ${compact ? 'compact' : ''}`} aria-label="Purchase lifecycle">
    {!compact && <div className="section-intro"><span className="kicker">CONTROL SEQUENCE</span><h2>One decision. Six explicit gates.</h2><p>Each stage advances only from verified backend state.</p></div>}
    <ol>{stages.map(([code, label], index) => { const disabled = !paymentsEnabled && index >= 4; const status = disabled ? 'disabled' : index < complete ? 'done' : index === complete ? 'current' : 'waiting'; return <li key={code} className={status} aria-current={status === 'current' ? 'step' : undefined}>
      <span className="stage-rail"/><span className="stage-index">{status === 'done' ? <Icon name="check" size={14}/> : String(index + 1).padStart(2, '0')}</span><span className="stage-copy"><small>{code}</small><strong>{label}</strong>{disabled && <em>Public demo disabled</em>}</span>
    </li>; })}</ol>
  </section>;
}

export function EmptyState({ icon = 'spark', title, children }: { icon?: 'spark' | 'history' | 'shield'; title: string; children: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name={icon} size={24}/></div><h3>{title}</h3><p>{children}</p></div>;
}

export function Skeleton({ lines = 3 }: { lines?: number }) { return <div className="skeleton" aria-label="Loading"><span/>{Array.from({ length: lines }, (_, index) => <i key={index}/>)}</div>; }
