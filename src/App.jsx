import { useState } from 'react';
import PokemonCard from './components/PokemonCard';
import SearchBar from './components/SearchBar';
import Favorites from './components/Favorites';
import CompareView from './components/CompareView';
import MemoryGame from './components/MemoryGame';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [pokemonData, setPokemonData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem('favorites');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryTotalCards, setMemoryTotalCards] = useState(12);
  const memoryColumns = memoryTotalCards === 12 ? 3 : memoryTotalCards === 16 ? 4 : memoryTotalCards === 24 ? 6 : 6;

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
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
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
      <h1>Zayd's Pokémon Explorer</h1>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button onClick={() => setShowMemory((s) => !s)}>{showMemory ? 'Close Game' : 'Play Memory Game'}</button>
          </div>
          {showMemory && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <label style={{ color: 'var(--muted)', fontSize: 14 }}>Difficulty:</label>
                <select value={memoryTotalCards} onChange={(e) => setMemoryTotalCards(Number(e.target.value))}>
                  <option value={12}>Easy — 3×4 (12 cards)</option>
                  <option value={16}>Normal — 4×4 (16 cards)</option>
                  <option value={24}>Hard — 6×4 (24 cards)</option>
                  <option value={36}>Extreme — 6×6 (36 cards)</option>
                </select>
              </div>
              <MemoryGame pairs={Math.floor(memoryTotalCards / 2)} columns={memoryColumns} onClose={() => setShowMemory(false)} />
            </div>
          )}
          <SearchBar
            value={pokemonName}
            onChange={setPokemonName}
            hideSuggestions={showMemory}
            onSelect={(val) => {
              setPokemonName(val);
              fetchPokemon(val);
            }}
          />
          <div style={{ marginTop: 8 }}>
            <button onClick={handleSearch}>Search</button>
            <button onClick={randomPokemon} style={{ marginLeft: 8 }}>Random</button>
          </div>
          <div style={{ marginTop: 12 }}>
            <CompareView onFetch={fetchPokemon} />
          </div>
        </div>

        <div style={{ width: 240 }}>
          {sidebarCollapsed ? (
            <div className="favorites">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Favorites</strong>
                <button onClick={() => setSidebarCollapsed(false)}>Expand</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setSidebarCollapsed(true)}>Minimize</button>
              </div>
              <Favorites
                items={favorites}
                onSelect={(name) => {
                  setPokemonName(name);
                  fetchPokemon(name);
                }}
                onRemove={(name) => {
                  const next = favorites.filter((f) => f !== name);
                  setFavorites(next);
                  localStorage.setItem('favorites', JSON.stringify(next));
                }}
              />
            </div>
          )}
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {pokemonData && (
        <PokemonCard
          data={pokemonData}
          isFavorite={favorites.includes(pokemonData.name)}
          onToggleFavorite={(name) => {
            setFavorites((prev) => {
              const exists = prev.includes(name);
              const next = exists ? prev.filter((p) => p !== name) : [name, ...prev];
              localStorage.setItem('favorites', JSON.stringify(next));
              return next;
            });
          }}
        />
      )}
    </div>
  );
}

export default App;
