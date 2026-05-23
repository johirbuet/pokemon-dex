import { useState } from 'react';
import PokemonCard from './components/PokemonCard';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonData, setPokemonData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPokemon = async (name) => {
    try {
      setLoading(true);
      setError('');
      setPokemonData(null);

      const query = String(name).toLowerCase();
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (!res.ok) throw new Error('Pokémon not found');

      const data = await res.json();
      setPokemonData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (pokemonName.trim()) fetchPokemon(pokemonName);
  };

  const randomPokemon = () => {
    const randomId = Math.floor(Math.random() * 151) + 1;
    fetchPokemon(randomId);
  };

  return (
    <div className="container">
      <h1>Pokémon Explorer</h1>

      <div className="search">
        <input
          type="text"
          placeholder="Enter Pokémon name..."
          value={pokemonName}
          onChange={(e) => setPokemonName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={randomPokemon}>Random</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {pokemonData && <PokemonCard data={pokemonData} />}
    </div>
  );
}

export default App;
