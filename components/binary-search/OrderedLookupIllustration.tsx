export function OrderedLookupIllustration() {
  return (
    <figure style={{ margin: "34px 0 42px" }}>
      <svg
        viewBox="0 0 760 260"
        role="img"
        aria-labelledby="ordered-title ordered-desc"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title id="ordered-title">Opening a sorted directory near the middle</title>
        <desc id="ordered-desc">
          A simple hand-drawn directory with the middle pages marked as a better starting point than scanning from the beginning.
        </desc>
        <path d="M92 62c73-22 144-15 211 18v133c-69-31-140-38-211-15z" fill="#fff" stroke="#171717" strokeWidth="4" strokeLinejoin="round" />
        <path d="M303 80c67-33 139-40 215-18v136c-75-23-147-16-215 15z" fill="#fff" stroke="#171717" strokeWidth="4" strokeLinejoin="round" />
        <path d="M303 80v133" stroke="#171717" strokeWidth="3" />
        <path d="M118 95c54-11 103-3 153 14M118 119c54-11 103-3 153 14M118 143c54-11 103-3 153 14M335 109c47-17 96-22 150-13M335 134c47-17 96-22 150-13M335 159c47-17 96-22 150-13" stroke="#817d76" strokeWidth="3" strokeLinecap="round" opacity=".65" />
        <path d="M302 44v30" stroke="#A62424" strokeWidth="4" strokeLinecap="round" />
        <path d="m293 59 9 15 9-15" fill="none" stroke="#A62424" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="270" y="31" fill="#A62424" fontFamily="ui-monospace, monospace" fontSize="16">middle</text>
        <path d="M38 205c12-70 25-105 47-129" fill="none" stroke="#171717" strokeWidth="3" strokeDasharray="6 8" strokeLinecap="round" />
        <text x="18" y="228" fill="#55524d" fontFamily="ui-monospace, monospace" fontSize="15">scan from start</text>
        <path d="M570 196c52-6 98-4 135 8" fill="none" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
        <circle cx="582" cy="159" r="24" fill="#FCFBF7" stroke="#171717" strokeWidth="4" />
        <path d="M575 154h3M588 154h3M576 169c5 4 10 4 15 0" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
        <path d="M582 183v36M554 245c7-21 17-32 28-32s21 11 29 32" fill="none" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
        <path d="M544 209 506 157" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
        <text x="550" y="94" fill="#171717" fontFamily="ui-sans-serif, sans-serif" fontSize="17">Sorted data gives you a clue:</text>
        <text x="550" y="119" fill="#55524d" fontFamily="ui-sans-serif, sans-serif" fontSize="16">you can safely rule out whole regions.</text>
      </svg>
      <figcaption style={{ color: "var(--muted)", fontSize: ".85rem", lineHeight: 1.5 }}>
        Original AgoCode illustration: sorted structure lets a search start strategically instead of inspecting every entry.
      </figcaption>
    </figure>
  );
}
