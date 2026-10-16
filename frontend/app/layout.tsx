import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'AgentPay Guard — deliberate spending', description: 'AI purchasing proposals, deterministic policies, and human-approved PayPal sandbox checkout.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
