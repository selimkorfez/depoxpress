type P = { className?: string; size?: number }

const base = (size = 20) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
})

export const ArrowRight = ({ className, size = 18 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const ArrowUpRight = ({ className, size = 16 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)
export const Check = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
export const CheckCircle = ({ className, size = 18 }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.5 2.5L16 9.5" />
  </svg>
)
export const Cross = ({ className, size = 18 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
export const Plus = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const Menu = ({ className, size = 22 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
export const Parcel = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3Z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9M7.8 5.2l8.4 4.6" />
  </svg>
)
export const Warehouse = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3 21V9l9-5 9 5v12" />
    <path d="M7 21v-8h10v8M7 17h10" />
  </svg>
)
export const Barcode = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6v12M7 6v12M10 6v12M14 6v12M16 6v12M20 6v12M4 4h3M17 4h3M4 20h3M17 20h3" />
  </svg>
)
export const Truck = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7z" />
    <circle cx="6" cy="17.5" r="1.8" />
    <circle cx="17.5" cy="17.5" r="1.8" />
  </svg>
)
export const Returns = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-3" />
  </svg>
)
export const Layers = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
)
export const Hand = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 14v-3a2 2 0 0 1 4 0M8 11V6a2 2 0 0 1 4 0v5M12 10V5a2 2 0 0 1 4 0v6M16 9a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a8 8 0 0 1-8-7" />
  </svg>
)
export const Building = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M2 21h20" />
    <path d="M8 8h3M8 12h3M8 16h3" />
  </svg>
)
export const Mail = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </svg>
)
export const Phone = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z" />
  </svg>
)
export const Pin = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)
export const Globe = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
)
export const Bolt = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
)
export const Chat = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </svg>
)
export const Target = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)
export const Expand = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
)
export const Sliders = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
)
export const Store = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
  </svg>
)
export const Cpu = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </svg>
)
export const Doc = ({ className, size = 24 }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
)
export const WhatsApp = ({ className, size = 22 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.2-1.4A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.1.8.83-3-.2-.31a8.2 8.2 0 1 1 6.97 3.84Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.55.12-.16.25-.63.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-3.34-2.92c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.04 4.76 4.76 0 0 0 1 2.53 10.9 10.9 0 0 0 4.18 3.7c1.56.67 2.17.73 2.95.62.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
)
export const Instagram = ({ className, size = 20 }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)
export const Facebook = ({ className, size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
  </svg>
)

/** Brand mark: an isometric parcel on a signal-blue tile (matches the current site's mark). */
export const LogoMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#2457e6" />
    <path d="M16 5 6 10v12l10 5 10-5V10L16 5Z" fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="2" />
    <path d="M6 10l10 5 10-5M16 15v12" fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="2" />
    <path d="M11 7.5l10 5" fill="none" stroke="#d9b98b" strokeWidth="2" />
  </svg>
)
