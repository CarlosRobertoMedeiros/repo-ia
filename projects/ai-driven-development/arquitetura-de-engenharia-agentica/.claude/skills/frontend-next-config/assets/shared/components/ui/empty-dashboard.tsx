export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
      <svg
        viewBox="0 0 480 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-md opacity-90"
        aria-hidden
      >
        {/* Container */}
        <rect width="480" height="300" rx="16" fill="#18181b" />

        {/* Metric cards */}
        <rect x="12" y="12" width="104" height="58" rx="8" fill="#27272a" />
        <rect x="124" y="12" width="104" height="58" rx="8" fill="#27272a" />
        <rect x="236" y="12" width="104" height="58" rx="8" fill="#27272a" />
        <rect x="348" y="12" width="120" height="58" rx="8" fill="#27272a" />

        <rect x="22" y="24" width="52" height="5" rx="2.5" fill="#3f3f46" />
        <rect x="134" y="24" width="52" height="5" rx="2.5" fill="#3f3f46" />
        <rect x="246" y="24" width="52" height="5" rx="2.5" fill="#3f3f46" />
        <rect x="358" y="24" width="52" height="5" rx="2.5" fill="#3f3f46" />

        <rect x="22" y="38" width="38" height="10" rx="3" fill="#52525b" />
        <rect x="134" y="38" width="38" height="10" rx="3" fill="#52525b" />
        <rect x="246" y="38" width="38" height="10" rx="3" fill="#52525b" />
        <rect x="358" y="38" width="38" height="10" rx="3" fill="#52525b" />

        <circle cx="100" cy="26" r="4" fill="#f59e0b" opacity="0.9" />
        <circle cx="212" cy="26" r="4" fill="#34d399" opacity="0.9" />
        <circle cx="324" cy="26" r="4" fill="#60a5fa" opacity="0.9" />
        <circle cx="452" cy="26" r="4" fill="#a78bfa" opacity="0.9" />

        {/* Bar chart panel */}
        <rect x="12" y="82" width="300" height="206" rx="8" fill="#27272a" />
        <rect x="24" y="94" width="80" height="6" rx="3" fill="#3f3f46" />
        <rect x="24" y="106" width="52" height="4" rx="2" fill="#3f3f46" opacity="0.5" />

        {/* Grid lines */}
        <line x1="24" y1="198" x2="300" y2="198" stroke="#3f3f46" strokeWidth="1" />
        <line x1="24" y1="174" x2="300" y2="174" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="24" y1="150" x2="300" y2="150" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="24" y1="126" x2="300" y2="126" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />

        {/* Bars */}
        <rect x="38" y="162" width="26" height="36" rx="4" fill="#f59e0b" opacity="0.6" />
        <rect x="72" y="148" width="26" height="50" rx="4" fill="#f59e0b" opacity="0.75" />
        <rect x="106" y="168" width="26" height="30" rx="4" fill="#f59e0b" opacity="0.6" />
        <rect x="140" y="140" width="26" height="58" rx="4" fill="#f59e0b" />
        <rect x="174" y="154" width="26" height="44" rx="4" fill="#f59e0b" opacity="0.75" />
        <rect x="208" y="130" width="26" height="68" rx="4" fill="#f59e0b" />
        <rect x="242" y="144" width="26" height="54" rx="4" fill="#f59e0b" opacity="0.75" />

        {/* X-axis labels */}
        <rect x="38" y="206" width="20" height="4" rx="2" fill="#52525b" />
        <rect x="72" y="206" width="20" height="4" rx="2" fill="#52525b" />
        <rect x="106" y="206" width="20" height="4" rx="2" fill="#52525b" />
        <rect x="140" y="206" width="20" height="4" rx="2" fill="#52525b" />
        <rect x="174" y="206" width="20" height="4" rx="2" fill="#52525b" />
        <rect x="208" y="206" width="20" height="4" rx="2" fill="#52525b" />
        <rect x="242" y="206" width="20" height="4" rx="2" fill="#52525b" />

        {/* Donut panel */}
        <rect x="320" y="82" width="148" height="110" rx="8" fill="#27272a" />
        <rect x="332" y="94" width="64" height="6" rx="3" fill="#3f3f46" />

        <g transform="rotate(-90 394 148)">
          <circle cx="394" cy="148" r="26" stroke="#3f3f46" strokeWidth="14" fill="none" />
          <circle cx="394" cy="148" r="26" stroke="#f59e0b" strokeWidth="14" fill="none"
            strokeDasharray="49 114" strokeLinecap="round" />
          <circle cx="394" cy="148" r="26" stroke="#60a5fa" strokeWidth="14" fill="none"
            strokeDasharray="29 134" strokeDashoffset="-49" strokeLinecap="round" />
          <circle cx="394" cy="148" r="26" stroke="#34d399" strokeWidth="14" fill="none"
            strokeDasharray="20 143" strokeDashoffset="-78" strokeLinecap="round" />
        </g>

        {/* List panel */}
        <rect x="320" y="200" width="148" height="88" rx="8" fill="#27272a" />
        <rect x="332" y="212" width="64" height="5" rx="2.5" fill="#3f3f46" />

        <circle cx="340" cy="230" r="4" fill="#f59e0b" opacity="0.9" />
        <rect x="350" y="227" width="58" height="4" rx="2" fill="#3f3f46" />
        <rect x="430" y="227" width="26" height="4" rx="2" fill="#52525b" />

        <circle cx="340" cy="246" r="4" fill="#60a5fa" opacity="0.9" />
        <rect x="350" y="243" width="48" height="4" rx="2" fill="#3f3f46" />
        <rect x="430" y="243" width="26" height="4" rx="2" fill="#52525b" />

        <circle cx="340" cy="262" r="4" fill="#34d399" opacity="0.9" />
        <rect x="350" y="259" width="52" height="4" rx="2" fill="#3f3f46" />
        <rect x="430" y="259" width="26" height="4" rx="2" fill="#52525b" />

        <circle cx="340" cy="278" r="4" fill="#a78bfa" opacity="0.9" />
        <rect x="350" y="275" width="44" height="4" rx="2" fill="#3f3f46" />
        <rect x="430" y="275" width="26" height="4" rx="2" fill="#52525b" />
      </svg>

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-semibold text-foreground">Dashboard Vazio</h2>
        <p className="max-w-sm text-sm text-zinc-500">
          Este dashboard ainda não foi implementado. Substitua este componente pela visualização real dos dados.
        </p>
      </div>
    </div>
  );
}
