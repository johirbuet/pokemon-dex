import { useState } from 'react';
import EvolutionChain from './EvolutionChain';

function PokemonCard({ data, isFavorite = false, onToggleFavorite }) {
  const [showEvolution, setShowEvolution] = useState(false);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{data.name.toUpperCase()}</h2>
        <button onClick={() => onToggleFavorite && onToggleFavorite(data.name)}>
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <img src={data.sprites.front_default} alt={data.name} />

      <div className="types">
        {data.types.map((t) => (
          <span key={t.type.name}>{t.type.name}</span>
        ))}
      </div>

      <h3>Stats</h3>
      <ul>
        {data.stats.map((stat) => (
          <li key={stat.stat.name}>
            {stat.stat.name}: {stat.base_stat}
          </li>
        ))}
      </ul>

      <h3>Abilities</h3>
      <ul>
        {data.abilities.map((a) => (
          <li key={a.ability.name}>{a.ability.name}</li>
        ))}
      </ul>

      <div style={{ marginTop: 8 }}>
        <button onClick={() => setShowEvolution((s) => !s)}>
          {showEvolution ? 'Hide Evolution' : 'Show Evolution'}
        </button>
        {showEvolution && <EvolutionChain speciesUrl={data.species.url} />}
      </div>
    </div>
  );
}

export default PokemonCard;
