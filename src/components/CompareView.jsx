import { useState } from 'react';
import PokemonCard from './PokemonCard';

function CompareView({ onFetch }) {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [dataLeft, setDataLeft] = useState(null);
  const [dataRight, setDataRight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const fetchBoth = async () => {
    try {
      setLoading(true);
      const l = await onFetch(left);
      const r = await onFetch(right);
      setDataLeft(l);
      setDataRight(r);
    } catch (_e) {
      // ignore errors
    }
    setLoading(false);
  };

  if (collapsed) {
    return (
      <div className="compare">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Compare Pokémon</h3>
          <button onClick={() => setCollapsed(false)}>Expand</button>
        </div>
      </div>
    );
  }

  return (
    <div className="compare">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Compare Pokémon</h3>
        <button onClick={() => setCollapsed(true)}>Minimize</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input placeholder="Left name" value={left} onChange={(e) => setLeft(e.target.value)} />
        <input placeholder="Right name" value={right} onChange={(e) => setRight(e.target.value)} />
        <button onClick={fetchBoth}>Compare</button>
      </div>
      {loading && <p>Loading...</p>}
      <div style={{ display: 'flex', gap: 16 }}>
        {dataLeft && <PokemonCard data={dataLeft} />}
        {dataRight && <PokemonCard data={dataRight} />}
      </div>
    </div>
  );
}

export default CompareView;
