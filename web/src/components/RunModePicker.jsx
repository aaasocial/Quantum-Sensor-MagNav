// "Run mode" radio group (UI-05, UI-SPEC A-11): exactly two entries, live first (default).
import { useId } from 'react';

export const RUN_MODES = [
  { value: 'live', label: 'UAV (live, IonQ-drawn motor)' },
  { value: 'replay', label: 'UAV (recorded replay)' },
];

export default function RunModePicker({ value, onChange, disabled = false }) {
  const base = useId();
  return (
    <fieldset className="picker" disabled={disabled}>
      <legend>Run mode</legend>
      <div className="picker-options">
        {RUN_MODES.map((m) => {
          const id = `${base}-${m.value}`;
          return (
            <label key={m.value} className="radio-row" htmlFor={id}>
              <input
                id={id}
                type="radio"
                name={`${base}-mode`}
                value={m.value}
                checked={m.value === value}
                onChange={() => onChange(m.value)}
              />
              <span className="radio-main">{m.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
