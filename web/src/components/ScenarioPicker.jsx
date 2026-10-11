// "Map scenario" radio group (UI-SPEC A-11, D-B). Built from the artifact's scenarios[] in
// artifact order; label and map_label are rendered verbatim, never retyped here.
import { useId } from 'react';

export default function ScenarioPicker({
  scenarios, value, onChange, disabled = false, lockHelp = null, focusRef = null,
}) {
  const base = useId();
  const helpId = `${base}-lock`;
  const selected = scenarios.find((s) => s.id === value) ?? scenarios[0] ?? null;
  return (
    <fieldset className="picker" disabled={disabled} aria-describedby={lockHelp ? helpId : undefined}>
      <legend>Map scenario</legend>
      <div className="picker-options">
        {scenarios.map((sc, k) => {
          const id = `${base}-${k}`;
          const subId = `${id}-map`;
          return (
            <label key={sc.id} className="radio-row radio-row-tall" htmlFor={id}>
              <input
                id={id}
                type="radio"
                name={`${base}-scenario`}
                value={sc.id}
                checked={sc.id === value}
                onChange={() => onChange(sc.id)}
                aria-describedby={subId}
                ref={sc.id === value ? focusRef : undefined}
              />
              <span className="radio-text">
                <span className="radio-main">{sc.label}</span>
                <span id={subId} className="radio-sub">{sc.map_label}</span>
              </span>
            </label>
          );
        })}
      </div>
      {lockHelp && <p id={helpId} className="help">{lockHelp}</p>}
      {selected && (
        <details className="scenario-notes">
          <summary>Scenario notes</summary>
          <ul>
            {(selected.notes ?? []).map((note) => <li key={note}>{note}</li>)}
          </ul>
          {selected.map?.sha256 && (
            <p className="help">
              Map file sha256 <span className="mono">{String(selected.map.sha256).slice(0, 12)}</span>
            </p>
          )}
        </details>
      )}
    </fieldset>
  );
}
