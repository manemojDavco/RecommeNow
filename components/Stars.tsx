export default function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? 'var(--amber)' : 'var(--faint)' }}>
          ★
        </span>
      ))}
    </span>
  )
}
