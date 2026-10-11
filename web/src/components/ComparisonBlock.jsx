// "Both scenarios, as found" (UI-SPEC A-14): the recorded artifact's comparison, never live
// results. The statement, verdict and rule are rendered verbatim and every number is read from
// comparison.rows through comparisonView; this component adds no interpretive text of its own.
import { memo, useId, useMemo } from 'react';
import Badge from './Badge.jsx';
import { comparisonView } from '../lib/artifactV2.js';
import { SERIES } from '../theme.js';

const cellText = (key, cell) => {
  if (cell.value === null || cell.value === undefined) return 'n/a';
  if (key === 'matches_lost') return cell.windows === null ? String(cell.value) : `${cell.value} of ${cell.windows}`;
  return String(cell.value);
};

function ComparisonBlock({ artifact }) {
  const headingId = useId();
  const cv = useMemo(() => comparisonView(artifact), [artifact]);
  return (
    <section className="comparison" aria-labelledby={headingId}>
      <h3 id={headingId}>Both scenarios, as found</h3>
      {!cv ? (
        <p className="help">The scenario comparison is not in this artifact.</p>
      ) : (
        <>
          <p className="help">
            {`Recorded flights with the stored motor draw, S = ${artifact.S} shots, scored once under a rule fixed before the run. A live run does not change this table.`}
          </p>
          <blockquote className="verdict-statement">
            <p>{cv.statement}</p>
          </blockquote>
          <div className="badge-row">
            <Badge>{`verdict: ${cv.verdict}`}</Badge>
          </div>
          <div className="table-scroll">
            <table className="data-table comparison-table">
              <caption>Navigation and signal results for both maps, as found</caption>
              <thead>
                <tr>
                  <th scope="col">Measure</th>
                  {cv.columns.map((c) => (
                    <th key={c.id} scope="col">
                      <span className="col-main">{c.label}</span>
                      <br />
                      <span className="col-sub">{c.mapLabel}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              {cv.groups.map((g) => (
                <tbody key={g.estimator}>
                  <tr className="rowgroup-head">
                    <th scope="rowgroup" colSpan={cv.columns.length + 1}>{SERIES[g.estimator]?.label ?? g.estimator}</th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.key}>
                      <th scope="row">{r.label}</th>
                      {r.cells.map((cell, i) => <td key={cv.columns[i].id}>{cellText(r.key, cell)}</td>)}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <details className="comparison-rule">
            <summary>Comparison rule</summary>
            <p>{cv.rule}</p>
          </details>
        </>
      )}
    </section>
  );
}

export default memo(ComparisonBlock);
