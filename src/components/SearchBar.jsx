import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import Fuse from 'fuse.js';

function SearchBar({ value, onChange, onSelect, hideSuggestions = false }) {
  const [list, setList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const fuseRef = useRef(null);
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const [portalStyle, setPortalStyle] = useState({});

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

  useEffect(() => {
    if (hideSuggestions) {
      setOpen(false);
    }
  }, [hideSuggestions]);

  useEffect(() => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    rootRef.current = el;
    return () => {
      if (rootRef.current) document.body.removeChild(rootRef.current);
      rootRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!inputRef.current) return;

    function updatePos() {
      const rect = inputRef.current.getBoundingClientRect();
      setPortalStyle({
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.bottom}px`,
        width: `${rect.width}px`,
        zIndex: 2147483647,
      });
    }

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, suggestions]);

  const dropdown = (
    <ul className="suggestions" style={{ ...portalStyle, marginTop: 0 }}>
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
  );

  return (
    <div className="search-bar" style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value && setOpen(true)}
        placeholder="Enter Pokémon name..."
      />
      {open && suggestions.length > 0 && rootRef.current && createPortal(dropdown, rootRef.current)}
    </div>
  );
}

export default SearchBar;
