import type { ReactNode } from 'react';

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'pending' }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

const stages = [
  ['AI', 'Recommendation'], ['POLICY', 'Validated'], ['HUMAN', 'Approval'],
  ['ORDER', 'Create order'], ['BUYER', 'PayPal approval'], ['CAPTURE', 'Verify capture'],
] as const;

export function PurchaseLifecycle({ state }: { state?: string }) {
  const complete = state === 'COMPLETED' ? 6 : state === 'BUYER_APPROVED' ? 5 : state === 'ORDER_CREATED' ? 4 : state === 'APPROVED' ? 3 : state === 'PROPOSED' ? 2 : 0;
  return <section className="lifecycle" aria-label="Purchase lifecycle">
    <div className="lifecycle-copy"><span>CONTROL SEQUENCE</span><strong>Every step is explicit</strong></div>
    <ol>{stages.map(([code, label], index) => <li key={code} className={index < complete ? 'done' : index === complete ? 'current' : ''}>
      <span className="stage-index">{index < complete ? '✓' : String(index + 1).padStart(2, '0')}</span>
      <span><small>{code}</small><strong>{label}</strong></span>
    </li>)}</ol>
  </section>;
}

export function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}
