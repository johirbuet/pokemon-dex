function PokemonCard({ data }) {
  return (
    <div className="card">
      <h2>{data.name.toUpperCase()}</h2>

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
    </div>
  );
}

export default PokemonCard;
