// Text pill (UI-SPEC "Provenance Badges"). The text is the meaning; the variant colour only
// doubles it. Variants: neutral (default), ok ("computed in-page"), attention (fallback).
const VARIANTS = new Set(['neutral', 'ok', 'attention']);

export default function Badge({ variant = 'neutral', mono = false, children }) {
  const v = VARIANTS.has(variant) ? variant : 'neutral';
  return <span className={`badge badge-${v}${mono ? ' badge-mono' : ''}`}>{children}</span>;
}
