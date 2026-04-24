// SVGs ilustrativos para slides de tipo actividad, pregunta y debate

export function IlustracionActividad() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      {/* Fondo circular */}
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

      {/* Destellos pequeños */}
      <circle cx="152" cy="60" r="4" fill="#00E676" opacity="0.5" />
      <circle cx="48" cy="68" r="3" fill="#D85A30" opacity="0.4" />
      <circle cx="158" cy="148" r="3" fill="#f4f4f5" opacity="0.3" />
    </svg>
  )
}

export function IlustracionPregunta() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[260px] max-h-[260px]">
      {/* Fondo */}
      <circle cx="100" cy="100" r="92" fill="#18181b" />

      {/* Anillo exterior sutil */}
      <circle cx="100" cy="100" r="78" fill="none" stroke="#00E676" strokeWidth="1" opacity="0.15" />

      {/* Signo ? */}
      <text
        x="100" y="122"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="96"
        fontWeight="bold"
        fill="#00E676"
      >
        ?
      </text>

      {/* Círculos orbitando */}
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
      {/* Fondo */}
      <circle cx="100" cy="100" r="92" fill="#18181b" />

      {/* Burbuja superior derecha — verde */}
      <rect x="55" y="38" width="98" height="60" rx="16" fill="#00E676" />
      {/* Cola de la burbuja verde (abajo derecha) */}
      <polygon points="128,98 148,116 124,98" fill="#00E676" />
      {/* Líneas de texto simuladas dentro de la burbuja verde */}
      <rect x="70" y="55" width="68" height="7" rx="3.5" fill="#005a2f" opacity="0.35" />
      <rect x="70" y="68" width="50" height="7" rx="3.5" fill="#005a2f" opacity="0.25" />

      {/* Burbuja inferior izquierda — zinc */}
      <rect x="48" y="106" width="98" height="60" rx="16" fill="#52525b" />
      {/* Cola de la burbuja zinc (arriba izquierda) */}
      <polygon points="72,106 52,88 76,106" fill="#52525b" />
      {/* Líneas de texto simuladas dentro de la burbuja zinc */}
      <rect x="63" y="122" width="68" height="7" rx="3.5" fill="#27272a" opacity="0.45" />
      <rect x="63" y="135" width="44" height="7" rx="3.5" fill="#27272a" opacity="0.30" />
    </svg>
  )
}
