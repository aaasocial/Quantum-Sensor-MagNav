// Benchmark over N seeded motor draws (D-05). Heading, caption and row labels come verbatim from
// data/benchmark_summary.json through benchmarkView; no benchmark number is typed here. The
// recorded IonQ seeds are a separate table because they are not part of the mean (D-06).
import { memo, useId, useMemo } from 'react';
import { benchmarkView } from '../lib/benchmark.js';

function BenchmarkTable({ benchmark }) {
  const headingId = useId();
  const loading = benchmark?.status === 'loading';
  const bv = useMemo(
    () => (benchmark?.status === 'ok' ? benchmarkView(benchmark.record) : benchmarkView(null)),
    [benchmark],
  );
  if (loading) return null;
  if (bv.error) {
    return (
      <section className="benchmark">
        <p className="help">{bv.error}</p>
      </section>
    );
  }
  return (
    <section className="benchmark" aria-labelledby={headingId}>
      <h3 id={headingId}>{bv.heading}</h3>
      <div className="table-scroll">
        <table className="data-table benchmark-table">
          <caption>{bv.caption}</caption>
          <thead>
            <tr>
              <th scope="col">Sensor</th>
              <th scope="col">CEP50</th>
              <th scope="col">CEP95</th>
              <th scope="col">% under 556 m</th>
            </tr>
          </thead>
          <tbody>
            {bv.rows.map((r) => (
              <tr key={r.key || r.label}>
                <th scope="row">{r.label}</th>
                <td>{r.cep50}</td>
                <td>{r.cep95}</td>
                <td>{r.pct556}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bv.recorded.length > 0 && (
        <div className="table-scroll">
          <table className="data-table benchmark-recorded">
            <caption>Recorded IonQ seeds (not in the mean)</caption>
            <thead>
              <tr>
                <th scope="col">Bits</th>
                <th scope="col">Job</th>
                <th scope="col">Seed</th>
                <th scope="col">Scenario</th>
                <th scope="col">Baseline CEP50</th>
                <th scope="col">Quantum CEP50</th>
              </tr>
            </thead>
            <tbody>
              {bv.recorded.map((r) => (
                <tr key={r.key}>
                  <th scope="row">{r.label}</th>
                  <td><code>{r.jobShort}</code></td>
                  <td><code>{r.seedHex}</code></td>
                  <td>{r.scenarioLabel}</td>
                  <td>{r.cep50Baseline}</td>
                  <td>{r.cep50Quantum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default memo(BenchmarkTable);
