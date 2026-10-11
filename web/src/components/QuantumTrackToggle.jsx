// "Quantum track on map and charts" radio group: picks the one quantum track drawn on the map.
import { useId } from 'react';

export const QUANTUM_OPTIONS = [
  { value: 'quantum_q1', label: 'Single-qubit' },
  { value: 'quantum_ghz4', label: 'GHZ-4 entangled' },
];

export default function QuantumTrackToggle({ value, onChange, disabled = false }) {
  const base = useId();
  return (
    <fieldset className="picker" disabled={disabled}>
      <legend>Quantum track on map and charts</legend>
      <div className="picker-options picker-inline">
        {QUANTUM_OPTIONS.map((o) => {
          const id = `${base}-${o.value}`;
          return (
            <label key={o.value} className="radio-row" htmlFor={id}>
              <input
                id={id}
                type="radio"
                name={`${base}-quantum`}
                value={o.value}
                checked={o.value === value}
                onChange={() => onChange(o.value)}
              />
              <span className="radio-main">{o.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
