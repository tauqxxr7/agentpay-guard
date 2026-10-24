import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'AgentPay Guard — AI purchasing under control', description: 'Grounded AI purchasing proposals, deterministic policy enforcement, and explicit human approval.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
