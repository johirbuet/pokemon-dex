import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import Fuse from 'fuse.js';

function SearchBar({ value, onChange, onSelect, hideSuggestions = false }) {
  const [list, setList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [missed, setMissed] = useState(false);
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
      if (value && suggestions.length === 0) {
        setMissed(true);
      }
    }
  }, [hideSuggestions, suggestions.length, value]);

  useEffect(() => {
    if (!open && value && suggestions.length === 0) {
      setMissed(true);
    }
  }, [open, value, suggestions.length]);

  useEffect(() => {
    if (!missed) return;
    playMissSound();
    const id = window.setTimeout(() => setMissed(false), 600);
    return () => window.clearTimeout(id);
  }, [missed]);

  function playMissSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {
      // ignore audio errors
    }
  }

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
    <div className={`search-bar${missed ? ' missed' : ''}`} style={{ position: 'relative' }}>
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
