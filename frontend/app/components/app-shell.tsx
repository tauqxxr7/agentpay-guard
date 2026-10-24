'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from './fintech-ui';
import type { ViewName } from '../lib/types';

const navigation: { name: ViewName; label: string; icon: 'grid' | 'spark' | 'catalog' | 'history' | 'guide' }[] = [
  { name: 'Command', label: 'Command center', icon: 'grid' },
  { name: 'Studio', label: 'Shopping studio', icon: 'spark' },
  { name: 'Catalog', label: 'Catalog', icon: 'catalog' },
  { name: 'History', label: 'Audit & history', icon: 'history' },
  { name: 'Demo', label: 'Demo guide', icon: 'guide' },
];

export function AppShell({ view, onNavigate, ready, children }: { view: ViewName; onNavigate: (view: ViewName) => void; ready: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = (name: ViewName) => { onNavigate(name); setOpen(false); };
  return <div className="app-shell">
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <div className="sidebar-top"><Link className="brand" href="/" aria-label="AgentPay Guard home" onClick={() => navigate('Command')}><span className="brand-mark"><Icon name="shield" size={18}/></span><span>AgentPay <b>Guard</b></span></Link><button className="mobile-close" aria-label="Close navigation" onClick={() => setOpen(false)}><Icon name="close"/></button></div>
      <div className="workspace-label">PURCHASING CONTROL</div>
      <nav aria-label="Primary navigation">{navigation.map(item => <button className={view === item.name ? 'nav active' : 'nav'} aria-current={view === item.name ? 'page' : undefined} key={item.name} onClick={() => navigate(item.name)}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav>
      <div className="sidebar-status"><div className="environment"><span className={ready ? 'pulse online' : 'pulse'}/><span><strong>{ready ? 'Systems ready' : 'Connecting'}</strong><small>Sandbox environment</small></span></div><p>Policy-controlled purchasing with an auditable human decision at every critical step.</p><span className="environment-tag">USD · DEMO CATALOG</span></div>
    </aside>
    {open && <button className="scrim" aria-label="Close navigation" onClick={() => setOpen(false)}/>} 
    <div className="main-wrap">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Icon name="menu"/></button><div className="breadcrumb"><span>AGENTPAY GUARD</span><i>/</i><strong>{navigation.find(item => item.name === view)?.label}</strong></div><div className="sandbox-pill"><span/>SANDBOX · NO REAL MONEY</div></header>
      <main id="main-content" className="view" key={view}>{children}</main>
      <footer><span>AgentPay Guard</span><span>AI proposes · Policy verifies · You approve</span></footer>
    </div>
  </div>;
}
