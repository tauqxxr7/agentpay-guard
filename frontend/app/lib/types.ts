export type Product = { sku: string; name: string; category: string; cents: number; currency: string; merchant: string; attributes: string[] };
export type AuditEvent = { event: string; at: string };
export type Proposal = { id: string; product: Product; quantity: number; total_cents: number; budget_cents: number; policy: Record<string, boolean>; reasoning: string; mode: string; state: string; order_id: string | null; created_at?: string; audit: AuditEvent[] };
export type AppConfig = { payments_enabled: boolean; capture_enabled: boolean; client_id: string };
export type ViewName = 'Command' | 'Studio' | 'Catalog' | 'History' | 'Demo';
