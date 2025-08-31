import React, { useEffect, useMemo, useState } from 'react';
import { fetchHistory, postCalculation, clearHistory } from '../services/api';
import { evaluate } from 'mathjs';

const KEYS = [
  ['AC', '/', '*', '-'],
  ['7', '8', '9', '+'],
  ['4', '5', '6', '='],
  ['1', '2', '3', '0'],
  ['(', ')', '.', '⌫']
];

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [resultPreview, setResultPreview] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleKey = (k) => {
    if (k === 'AC') { setExpression(''); setResultPreview(''); return; }
    if (k === '⌫') { setExpression((p) => p.slice(0, -1)); return; }
    if (k === '=') { handleEvaluate(); return; }
    setExpression((p) => p + k);
  };

  const handleEvaluate = async () => {
    if (!expression.trim()) return;
    setLoading(true); setError('');
    try {
      const { data } = await postCalculation(expression);

      if (data.error) {
        setError(data.error);
        setResultPreview('');
      } else {
        setResultPreview(data.result);
        setExpression(data.expression);
      }
      await loadHistory();
    } catch (e) {
      setError(e?.response?.data?.error || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await fetchHistory(30);
      setHistory(data);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  // ✅ Cleaned live preview using mathjs
  useEffect(() => {
    try {
      if (!expression) { setResultPreview(''); return; }
      if (!/^[-+*/().\d\s]+$/.test(expression)) { setResultPreview(''); return; }

      const out = evaluate(expression);
      if (isFinite(out)) {
        // round to 10 digits, remove trailing zeros
        setResultPreview(parseFloat(out.toFixed(10)).toString());
      }
    } catch {
      setResultPreview('');
    }
  }, [expression]);

  const disabled = useMemo(() => loading, [loading]);

  return (
    <>
      <div className="top">
        <input
          type="text"
          value={expression}
          placeholder="Type or use buttons…"
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleEvaluate(); }}
        />
        <button className="action" onClick={handleEvaluate} disabled={disabled}>
          =
        </button>
      </div>

      <div className="display">
        <div className="expr">{expression || '\u00A0'}</div>
        <div className="res">{resultPreview || '\u00A0'}</div>
      </div>

      <div className="grid">
        {KEYS.flat().map((k) => (
          <button
            key={k}
            className={k === 'AC' ? 'action' : k === '=' ? 'equals' : ''}
            onClick={() => handleKey(k)}
            disabled={disabled}
            aria-label={`key-${k}`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="history">
        <div className="controls">
          <button
            className="action"
            onClick={async () => { await clearHistory(); loadHistory(); }}
          >
            Clear
          </button>
          <button onClick={loadHistory}>Refresh</button>
        </div>
        <h3>History</h3>
        {history.length === 0 && <div>No calculations yet.</div>}
        {history.map((h) => (
          <div key={h._id} className="item">
            <div>
              <strong>{h.expression}</strong>
            </div>
            {h.error ? (
              <div style={{ color: 'red' }}>Error: {h.error}</div>
            ) : (
              <div>= {h.result}</div>
            )}
            <small style={{ color: '#999' }}>
              {new Date(h.evaluatedAt).toLocaleString()} ({h.source})
            </small>
          </div>
        ))}
      </div>

      {error && <div style={{ color: '#ff8585', marginTop: '10px' }}>{error}</div>}
    </>
  );
}
