import { useEffect, useState, useRef } from 'react';
import Fuse from 'fuse.js';

function SearchBar({ value, onChange, onSelect }) {
  const [list, setList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const fuseRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch('https://pokeapi.co/api/v2/pokemon?limit=2000')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const names = data.results.map((r) => r.name);
        setList(names);
        fuseRef.current = new Fuse(names, { threshold: 0.35 });
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!value) return setSuggestions([]);
    if (fuseRef.current) {
      const res = fuseRef.current.search(value).slice(0, 6).map((r) => r.item);
      setSuggestions(res);
      setOpen(true);
    } else {
      const res = list.filter((n) => n.includes(value.toLowerCase())).slice(0, 6);
      setSuggestions(res);
      setOpen(true);
    }
  }, [value, list]);

  return (
    <div className="search-bar" style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value && setOpen(true)}
        placeholder="Enter Pokémon name..."
      />
      {open && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s) => (
            <li
              key={s}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(s);
                setOpen(false);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
