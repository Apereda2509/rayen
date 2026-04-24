// SVGs ilustrativos para slides del modo pizarra

// ── Tipos originales ─────────────────────────────────────────

export function IlustracionActividad() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      <circle cx="100" cy="100" r="92" fill="#27272a" />

      {/* Lápiz izquierdo — verde, inclinado -22° */}
      <g transform="translate(100,100) rotate(-22) translate(-10,-52)">
        <rect x="0" y="0" width="20" height="72" rx="3" fill="#00E676" />
        <polygon points="0,72 20,72 10,92" fill="#c4a882" />
        <circle cx="10" cy="89" r="3" fill="#d4b896" />
        <rect x="0" y="0" width="20" height="11" rx="2" fill="#111" />
        <rect x="0" y="11" width="20" height="6" fill="#e5e5e5" />
      </g>

      {/* Lápiz central — coral, vertical */}
      <g transform="translate(100,100) rotate(0) translate(-10,-62)">
        <rect x="0" y="0" width="20" height="84" rx="3" fill="#D85A30" />
        <polygon points="0,84 20,84 10,104" fill="#c4a882" />
        <circle cx="10" cy="101" r="3" fill="#d4b896" />
        <rect x="0" y="0" width="20" height="11" rx="2" fill="#111" />
        <rect x="0" y="11" width="20" height="6" fill="#e5e5e5" />
      </g>

      {/* Lápiz derecho — blanco, inclinado +22° */}
      <g transform="translate(100,100) rotate(22) translate(-10,-52)">
        <rect x="0" y="0" width="20" height="72" rx="3" fill="#f4f4f5" />
        <polygon points="0,72 20,72 10,92" fill="#c4a882" />
        <circle cx="10" cy="89" r="3" fill="#d4b896" />
        <rect x="0" y="0" width="20" height="11" rx="2" fill="#111" />
        <rect x="0" y="11" width="20" height="6" fill="#d4d4d8" />
      </g>

      <circle cx="152" cy="60" r="4" fill="#00E676" opacity="0.5" />
      <circle cx="48" cy="68" r="3" fill="#D85A30" opacity="0.4" />
      <circle cx="158" cy="148" r="3" fill="#f4f4f5" opacity="0.3" />
    </svg>
  )
}

export function IlustracionPregunta() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      <circle cx="100" cy="100" r="92" fill="#18181b" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="#00E676" strokeWidth="1" opacity="0.15" />
      <text
        x="100" y="122"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="96"
        fontWeight="bold"
        fill="#00E676"
      >?</text>
      <circle cx="168" cy="52"  r="9" fill="#00E676" opacity="0.45" />
      <circle cx="178" cy="108" r="5" fill="#00E676" opacity="0.25" />
      <circle cx="148" cy="162" r="7" fill="#00E676" opacity="0.35" />
      <circle cx="32"  cy="62"  r="6" fill="#00E676" opacity="0.28" />
      <circle cx="28"  cy="138" r="8" fill="#00E676" opacity="0.20" />
      <circle cx="92"  cy="22"  r="5" fill="#00E676" opacity="0.30" />
    </svg>
  )
}

export function IlustracionDebate() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      <circle cx="100" cy="100" r="92" fill="#18181b" />

      {/* Burbuja superior derecha — verde */}
      <rect x="55" y="38" width="98" height="60" rx="16" fill="#00E676" />
      <polygon points="128,98 148,116 124,98" fill="#00E676" />
      <rect x="70" y="55" width="68" height="7" rx="3.5" fill="#005a2f" opacity="0.35" />
      <rect x="70" y="68" width="50" height="7" rx="3.5" fill="#005a2f" opacity="0.25" />

      {/* Burbuja inferior izquierda — zinc */}
      <rect x="48" y="106" width="98" height="60" rx="16" fill="#52525b" />
      <polygon points="72,106 52,88 76,106" fill="#52525b" />
      <rect x="63" y="122" width="68" height="7" rx="3.5" fill="#27272a" opacity="0.45" />
      <rect x="63" y="135" width="44" height="7" rx="3.5" fill="#27272a" opacity="0.30" />
    </svg>
  )
}

// ── Tipos nuevos ─────────────────────────────────────────────

export function IlustracionMapa() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      <circle cx="100" cy="100" r="92" fill="#27272a" />

      {/* Silueta estilizada de Chile — franja larga y angosta */}
      <path
        d="M 108 20 C 116 28 119 44 116 60 C 120 78 121 97 118 114 C 121 132 118 150 114 164 C 111 174 107 182 102 186 C 98 190 93 188 90 183 C 87 176 89 168 90 160 C 88 149 86 139 88 129 C 85 119 84 109 86 99 C 83 89 82 79 85 69 C 88 59 91 49 96 39 C 100 30 105 21 108 20 Z"
        fill="#00E676"
        opacity="0.9"
      />

      {/* Punto capital (Santiago ~centro del país) */}
      <circle cx="90" cy="108" r="4" fill="#ffffff" opacity="0.7" />
      <circle cx="90" cy="108" r="8" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />

      {/* Andes — línea paralela a la derecha */}
      <path
        d="M 115 32 C 120 50 122 70 120 90 C 122 110 120 130 116 148"
        fill="none"
        stroke="#00E676"
        strokeWidth="2"
        opacity="0.25"
        strokeDasharray="4 4"
      />

      {/* Océano Pacífico — ondas a la izquierda */}
      <path d="M 62 80 Q 68 76 74 80 Q 80 84 86 80" fill="none" stroke="#00E676" strokeWidth="1.5" opacity="0.3" />
      <path d="M 58 95 Q 64 91 70 95 Q 76 99 82 95" fill="none" stroke="#00E676" strokeWidth="1.5" opacity="0.25" />
      <path d="M 60 110 Q 66 106 72 110 Q 78 114 84 110" fill="none" stroke="#00E676" strokeWidth="1.5" opacity="0.2" />
    </svg>
  )
}

export function IlustracionPeligro() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      <circle cx="100" cy="100" r="92" fill="#18181b" />

      {/* Triángulo exterior — halo */}
      <polygon
        points="100,30 172,158 28,158"
        fill="none"
        stroke="#D85A30"
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.2"
      />

      {/* Triángulo principal */}
      <polygon
        points="100,38 166,152 34,152"
        fill="#1c1009"
        stroke="#D85A30"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Signo ! — barra */}
      <rect x="93" y="72" width="14" height="48" rx="7" fill="#D85A30" />

      {/* Signo ! — punto */}
      <circle cx="100" cy="136" r="8" fill="#D85A30" />
    </svg>
  )
}

export function IlustracionLey() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      <circle cx="100" cy="100" r="92" fill="#18181b" />

      {/* Mango del martillo */}
      <rect
        x="93" y="85"
        width="14" height="80"
        rx="7"
        fill="#71717a"
        transform="rotate(-38 100 125)"
      />

      {/* Cabeza del martillo */}
      <rect
        x="58" y="52"
        width="74" height="30"
        rx="8"
        fill="#a1a1aa"
        transform="rotate(-38 95 67)"
      />

      {/* Banda central de la cabeza */}
      <rect
        x="88" y="52"
        width="18" height="30"
        rx="0"
        fill="#71717a"
        transform="rotate(-38 97 67)"
      />

      {/* Bloque de golpe */}
      <rect x="44" y="154" width="112" height="14" rx="5" fill="#52525b" />
      <rect x="52" y="162" width="96" height="6" rx="3" fill="#71717a" opacity="0.4" />
    </svg>
  )
}

export function IlustracionEcosistema() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      <circle cx="100" cy="100" r="92" fill="#18181b" />

      {/* Copa superior */}
      <polygon points="100,28 138,90 62,90" fill="#00E676" opacity="0.9" />

      {/* Copa media — más ancha */}
      <polygon points="100,55 148,115 52,115" fill="#00E676" opacity="0.85" />

      {/* Copa inferior — la más ancha */}
      <polygon points="100,80 155,138 45,138" fill="#00E676" opacity="0.8" />

      {/* Tronco */}
      <rect x="92" y="136" width="16" height="30" rx="3" fill="#00E676" opacity="0.6" />

      {/* Raíces */}
      <path d="M 100 166 L 78 182" stroke="#00E676" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <path d="M 100 166 L 100 185" stroke="#00E676" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M 100 166 L 122 182" stroke="#00E676" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
      <path d="M 93 172 L 80 188" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
      <path d="M 107 172 L 120 188" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  )
}

export function IlustracionDatos() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      <circle cx="100" cy="100" r="92" fill="#18181b" />

      {/* Eje Y */}
      <line x1="40" y1="30" x2="40" y2="158" stroke="#52525b" strokeWidth="2" />
      {/* Eje X */}
      <line x1="38" y1="158" x2="172" y2="158" stroke="#52525b" strokeWidth="2" />

      {/* Barras descendentes — representan colapso poblacional */}
      <rect x="50"  y="50"  width="26" height="108" rx="3" fill="#D85A30" opacity="0.95" />
      <rect x="84"  y="82"  width="26" height="76"  rx="3" fill="#D85A30" opacity="0.75" />
      <rect x="118" y="110" width="26" height="48"  rx="3" fill="#D85A30" opacity="0.55" />
      <rect x="152" y="136" width="14" height="22"  rx="3" fill="#D85A30" opacity="0.40" />

      {/* Flecha tendencia hacia abajo */}
      <path
        d="M 63 44 L 97 76 L 131 104 L 159 130"
        fill="none"
        stroke="#D85A30"
        strokeWidth="2"
        strokeDasharray="4 3"
        opacity="0.5"
      />
      <polygon points="159,130 150,122 162,120" fill="#D85A30" opacity="0.5" />

      {/* Etiqueta — 90% */}
      <text x="44" y="44" fontFamily="monospace" fontSize="12" fill="#D85A30" opacity="0.7">−90%</text>
    </svg>
  )
}
