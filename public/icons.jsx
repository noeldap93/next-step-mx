// Thin-line monochrome icons. All use stroke="currentColor" so they pick up theme.
const ICON_PROPS = {
  width: 28, height: 28, viewBox: "0 0 32 32",
  fill: "none", stroke: "currentColor", strokeWidth: 1.2,
  strokeLinecap: "round", strokeLinejoin: "round",
};

const IconCircuit = () => (
  <svg {...ICON_PROPS}>
    <rect x="5" y="5" width="22" height="22" rx="1" />
    <path d="M5 12h6M21 12h6M5 20h6M21 20h6M12 5v6M20 5v6M12 21v6M20 21v6" />
    <circle cx="16" cy="16" r="2.5" />
  </svg>
);
const IconCash = () => (
  <svg {...ICON_PROPS}>
    <rect x="4" y="9" width="24" height="14" rx="1" />
    <circle cx="16" cy="16" r="3.5" />
    <path d="M8 9V7M24 9V7M8 23v2M24 23v2" />
  </svg>
);
const IconTrend = () => (
  <svg {...ICON_PROPS}>
    <path d="M4 24l8-9 5 5 11-13" />
    <path d="M28 7v6h-6" />
    <path d="M4 28h24" />
  </svg>
);
const IconClock = () => (
  <svg {...ICON_PROPS}>
    <circle cx="16" cy="16" r="11" />
    <path d="M16 9v7l5 3" />
  </svg>
);
const IconGear = () => (
  <svg {...ICON_PROPS}>
    <circle cx="16" cy="16" r="4" />
    <path d="M16 4v3M16 25v3M28 16h-3M7 16H4M24.5 7.5l-2.1 2.1M9.6 22.4l-2.1 2.1M24.5 24.5l-2.1-2.1M9.6 9.6L7.5 7.5" />
  </svg>
);
const IconRocket = () => (
  <svg {...ICON_PROPS}>
    <path d="M14 22l-4 4-2-2 4-4" />
    <path d="M22 4c-7 1-12 6-15 13l5 5c7-3 12-8 13-15l-3-3z" />
    <circle cx="20" cy="12" r="2" />
  </svg>
);
const IconBot = () => (
  <svg {...ICON_PROPS}>
    <rect x="6" y="10" width="20" height="14" rx="2" />
    <path d="M16 4v6" />
    <circle cx="16" cy="4" r="1.2" />
    <circle cx="12" cy="16" r="1.2" />
    <circle cx="20" cy="16" r="1.2" />
    <path d="M12 20h8" />
    <path d="M2 16h4M26 16h4" />
  </svg>
);
const IconAgent = () => (
  <svg {...ICON_PROPS}>
    <circle cx="16" cy="11" r="4" />
    <path d="M7 26c1-5 5-7 9-7s8 2 9 7" />
    <path d="M22 5l3 3-3 3" />
  </svg>
);
const IconAuto = () => (
  <svg {...ICON_PROPS}>
    <path d="M5 16a11 11 0 0118-8" />
    <path d="M27 16a11 11 0 01-18 8" />
    <path d="M22 5v5h-5M10 27v-5h5" />
  </svg>
);
const IconChat = () => (
  <svg {...ICON_PROPS}>
    <path d="M5 9a3 3 0 013-3h13a3 3 0 013 3v8a3 3 0 01-3 3h-7l-6 5v-5h-0a3 3 0 01-3-3V9z" />
    <path d="M11 13h7M11 17h4" />
  </svg>
);
const IconApp = () => (
  <svg {...ICON_PROPS}>
    <rect x="5" y="6" width="22" height="20" rx="2" />
    <path d="M5 11h22" />
    <path d="M9 17h6M9 21h10" />
    <circle cx="9" cy="8.5" r="0.6" />
    <circle cx="11.5" cy="8.5" r="0.6" />
  </svg>
);
const IconFlow = () => (
  <svg {...ICON_PROPS}>
    <circle cx="6" cy="8" r="2" />
    <circle cx="6" cy="24" r="2" />
    <circle cx="26" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
    <path d="M8 8h6c1 0 2 1 2 2v4M8 24h6c1 0 2-1 2-2v-4M18 16h6" />
  </svg>
);

const IconWeb = () => (
  <svg {...ICON_PROPS}>
    <circle cx="16" cy="16" r="11" />
    <ellipse cx="16" cy="16" rx="5" ry="11" />
    <path d="M5 16h22" />
    <path d="M7 10h18M7 22h18" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 7h16M11 1l6 6-6 6" />
  </svg>
);
const WhatsappIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21l1.7-5.1A8.5 8.5 0 1 1 8.1 19.3L3 21z" />
    <path d="M9 8.5c0 .3.1.7.2 1 .4 1.2 1.3 2.3 2.4 3 .8.5 1.6.8 2.2.9.4 0 .8-.1 1.1-.4l.6-.6c.2-.2.4-.2.6-.1l1.4.7c.2.1.3.3.3.5 0 .9-.7 1.7-1.6 1.9-.6.1-1.2 0-2.7-.6-1.9-.8-3.4-2.2-4.4-4-.5-.9-.7-1.5-.7-2 0-.9.7-1.7 1.6-1.9.2 0 .4 0 .5.3l.6 1.4c.1.2.1.4-.1.6l-.5.6c-.2.2-.3.4-.5.7z" />
  </svg>
);

Object.assign(window, {
  IconCircuit, IconCash, IconTrend, IconClock,
  IconGear, IconRocket, IconBot,
  IconAgent, IconAuto, IconChat, IconApp, IconFlow, IconWeb,
  ArrowIcon, WhatsappIcon,
});
