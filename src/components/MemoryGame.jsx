import { useEffect, useState, useRef } from 'react';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function MemoryGame({ pairs = 6 }) {
  const [cards, setCards] = useState([]);
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [showPoint, setShowPoint] = useState(false);
  const [mismatchIds, setMismatchIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startNewGame();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (first && second) {
      setDisabled(true);
      setMoves((m) => m + 1);
      if (first.pokemon === second.pokemon) {
        // mark matched, keep flipped
        setCards((prev) => prev.map((c) => (c.pokemon === first.pokemon ? { ...c, matched: true, flipped: true } : c)));
        // award points and play sound
        setScore((s) => s + 10);
        setShowPoint(true);
        playMatchSound();
        setTimeout(() => setShowPoint(false), 800);
        setTimeout(() => resetTurn(), 300);
        setMatches((m) => m + 1);
      } else {
        // animate mismatch, play sound, then flip back
        setMismatchIds([first.id, second.id]);
        playMissSound();
        setTimeout(() => {
          setCards((prev) => prev.map((c) => {
            if (c.matched) return c;
            if (c.id === first.id || c.id === second.id) return { ...c, flipped: false };
            return c;
          }));
          setMismatchIds([]);
          resetTurn();
        }, 700);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [second]);

  useEffect(() => {
    if (matches === pairs && !loading) {
      clearInterval(timerRef.current);
    }
  }, [matches, pairs, loading]);

  function resetTurn() {
    setFirst(null);
    setSecond(null);
    setDisabled(false);
  }

  function playMatchSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, ctx.currentTime);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // ignore audio errors
    }
  }

  function playMissSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (e) {
      // ignore audio errors
    }
  }

  async function startNewGame() {
    setLoading(true);
    clearInterval(timerRef.current);
    setTime(0);
    setMoves(0);
    setMatches(0);
    setFirst(null);
    setSecond(null);

    try {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
      const data = await res.json();
      const list = data.results.map((r) => {
        // extract id from url
        const parts = r.url.split('/').filter(Boolean);
        const id = parts[parts.length - 1];
        return { name: r.name, id };
      });

      shuffle(list);
      const selected = list.slice(0, pairs);

      // build card set
      let set = [];
      selected.forEach((p) => {
        const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
        set.push({ id: `${p.name}-a`, pokemon: p.name, image, matched: false });
        set.push({ id: `${p.name}-b`, pokemon: p.name, image, matched: false });
      });

      shuffle(set);
      setCards(set.map((c) => ({ ...c, flipped: false })));
      setLoading(false);

      // start timer
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  function handleFlip(card) {
    if (disabled) return;
    if (card.matched) return;
    if (first && first.id === card.id) return;

    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c)));

    if (!first) setFirst(card);
    else setSecond(card);
  }

  function resetGame() {
    startNewGame();
  }

  return (
    <div className="memory-game">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Picture Memory</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
          <div style={{ color: 'var(--muted)' }}>Time: {time}s</div>
          <div style={{ color: 'var(--muted)' }}>Moves: {moves}</div>
          <div style={{ color: 'var(--muted)' }}>Score: {score}</div>
          <button onClick={resetGame}>Restart</button>
          {showPoint && <div className="point-badge">+10</div>}
        </div>
      </div>

      {loading && <p>Loading game...</p>}

      <div className="memory-grid" style={{ marginTop: 12 }}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`memory-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''} ${mismatchIds.includes(card.id) ? 'mismatch' : ''}`}
            onClick={() => handleFlip(card)}
          >
            <div className="card-inner">
              <div className="card-front" />
              <div className="card-back">
                {card.image ? (
                  <img src={card.image} alt={card.pokemon} onError={(e) => (e.target.style.opacity = 0.4)} />
                ) : (
                  <div style={{ color: 'var(--muted)' }}>{card.pokemon}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryGame;
