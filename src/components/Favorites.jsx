function Favorites({ items, onSelect, onRemove }) {
  return (
    <div className="favorites">
      <h3>Favorites</h3>
      {items.length === 0 && <p>No favorites yet.</p>}
      <ul>
        {items.map((p) => (
          <li key={p}>
            <button onClick={() => onSelect(p)}>{p}</button>
            <button onClick={() => onRemove(p)} style={{ marginLeft: 8 }}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;
