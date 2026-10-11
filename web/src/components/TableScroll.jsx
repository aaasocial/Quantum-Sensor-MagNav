// Horizontally scrollable table wrapper (A11Y-03, axe scrollable-region-focusable). A keyboard
// user must be able to reach a scroll container to scroll it, so the wrapper is a named,
// focusable region; App's global playback keys skip `.table-scroll`, so arrows, Home/End and
// Space scroll the table natively while it has focus. Focus ring comes from :focus-visible.
export default function TableScroll({ label, children }) {
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}
