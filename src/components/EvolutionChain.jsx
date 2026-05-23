import { useEffect, useState } from 'react';

function flattenChain(chain) {
  const out = [];
  function walk(node) {
    out.push(node.species.name);
    if (node.evolves_to && node.evolves_to.length) {
      node.evolves_to.forEach(walk);
    }
  }
  walk(chain);
  return out;
}

async function fetchArtwork(name) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (
      (data.sprites && data.sprites.other && data.sprites.other['official-artwork'] && data.sprites.other['official-artwork'].front_default) ||
      data.sprites.front_default ||
      null
    );
  } catch {
    return null;
  }
}

function EvolutionChain({ speciesUrl }) {
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!speciesUrl) return;
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const spRes = await fetch(speciesUrl);
        const species = await spRes.json();
        const evoRes = await fetch(species.evolution_chain.url);
        const evo = await evoRes.json();
        const names = flattenChain(evo.chain);

        // fetch artwork for each name in parallel
        const items = await Promise.all(
          names.map(async (n) => ({ name: n, image: await fetchArtwork(n) }))
        );

        if (!mounted) return;
        setChain(items);
      } catch (_e) {
        if (!mounted) return;
        setChain([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [speciesUrl]);

  return (
    <div className="evolution-chain">
      <h4>Evolution Chain</h4>
      {loading && <p>Loading chain...</p>}
      {!loading && chain.length === 0 && <p>None found</p>}
      <div style={{ display: 'flex', gap: 12 }}>
        {chain.map((item) => (
          <div key={item.name} style={{ textAlign: 'center' }}>
            {item.image ? (
              <img src={item.image} alt={item.name} style={{ width: 72, height: 72, objectFit: 'contain' }} />
            ) : (
              <div style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>{item.name}</div>
            )}
            <div style={{ textTransform: 'capitalize', marginTop: 6 }}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvolutionChain;
