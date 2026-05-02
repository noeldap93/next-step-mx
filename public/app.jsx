// Main app — orchestrates sections, snap scroll, i18n, theme, tweaks
const TWEAKS_DEFAULT = /*EDITMODE-BEGIN*/{
  "accent": "#f4f3ef",
  "bgMode": "neural",
  "typo": "sans",
  "theme": "dark",
  "density": "normal",
  "intensity": 0.8,
  "locale": "es",
  "viewport": "auto"
}/*EDITMODE-END*/;

const SECTION_KEYS = ["hero", "problem", "solution", "products", "method", "pricing", "closing"];

const VIEWPORTS = {
  auto:           { label: "Auto (fluido)",     w: null, h: null },
  desktop_wide:   { label: "Desktop wide",      w: 1920, h: 1080 },
  desktop_small:  { label: "Desktop small",     w: 1280, h: 800 },
  tablet_land:    { label: "Tablet horizontal", w: 1180, h: 820 },
  tablet_port:    { label: "Tablet vertical",   w: 820,  h: 1180 },
  iphone_pro_max: { label: "iPhone 17 Pro Max", w: 440,  h: 956 },
  iphone:         { label: "iPhone 17",         w: 393,  h: 852 },
  low_res:        { label: "Low-res phone",     w: 320,  h: 568 },
};

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULT);
  const [active, setActive] = React.useState(0);
  const [shrunk, setShrunk] = React.useState(false);
  const scrollRef = React.useRef(null);

  const lang = tweaks.locale || "es";
  const t = window.NL_I18N[lang];
  window.__NL_T = t;

  // Apply theme/density/typo to document
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    document.documentElement.setAttribute("data-typo", tweaks.typo);
    document.documentElement.setAttribute("data-density", tweaks.density);
    document.documentElement.style.setProperty("--nl-accent", tweaks.accent);
  }, [tweaks.theme, tweaks.typo, tweaks.density, tweaks.accent]);

  const vp = VIEWPORTS[tweaks.viewport] || VIEWPORTS.auto;
  const isFramed = !!vp.w;

  // Section IO + scroll progress
  React.useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const sections = root.querySelectorAll("[data-screen-label]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.5) {
          const idx = Number(e.target.dataset.idx);
          setActive(idx);
        }
      });
    }, { threshold: [0.5], root });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [lang]);

  // FAB shrink after scrolling past hero
  React.useEffect(() => {
    setShrunk(active > 0);
  }, [active]);

  const goTo = (idx) => {
    const root = scrollRef.current;
    if (!root) return;
    const target = root.querySelectorAll("[data-screen-label]")[idx];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onCTA = () => {
    const msg = lang === "es"
      ? "Hola Next Step, me gustaría agendar una consultoría."
      : "Hi Next Step, I'd like to book a consultation.";
    const url = "https://wa.me/528336322300?text=" + encodeURIComponent(msg);
    const fab = document.querySelector(".nl-fab");
    if (fab) {
      fab.style.transform = "scale(.94)";
      setTimeout(() => (fab.style.transform = ""), 200);
    }
    window.open(url, "_blank", "noopener");
  };

  const toggleLocale = () => setTweak("locale", lang === "es" ? "en" : "es");

  const navKeys = ["problem", "solution", "products", "method", "pricing"];
  const sectionLabels = {
    es: ["00 · Inicio", "01 · Problema", "02 · Solución", "03 · Servicios", "04 · Método", "05 · Inversión", "06 · Contacto"],
    en: ["00 · Home", "01 · Problem", "02 · Solution", "03 · Services", "04 · Method", "05 · Pricing", "06 · Contact"],
  };

  // progress for counter bar
  const progress = ((active + 1) / SECTION_KEYS.length) * 100;

  return (
    <div className={"nl-app" + (isFramed ? " nl-app--framed" : "")}>
      {isFramed && (
        <div className="nl-frame-meta">
          <span>{vp.label}</span>
          <span className="nl-frame-meta-dot">·</span>
          <span>{vp.w} × {vp.h}</span>
        </div>
      )}
      <div
        className={"nl-viewport" + (isFramed ? " nl-viewport--framed" : "")}
        style={isFramed ? { width: vp.w + "px", height: vp.h + "px" } : undefined}
      >
      <ParticleField
        density={1}
        intensity={tweaks.intensity}
        mode={tweaks.bgMode}
        theme={tweaks.theme}
        paused={false}
      />

      {/* Topbar */}
      <header className="nl-topbar">
        <div className="nl-mark">
          <span className="nl-mark-dot" />
          <span>Next Step</span>
          <span className="nl-mark-sub">· AI Automation</span>
        </div>
        <nav className="nl-nav">
          <span className={"nl-nav-link" + (active === 1 ? " is-active" : "")} onClick={() => goTo(1)}>{t.nav.think}</span>
          <span className={"nl-nav-link" + (active === 2 ? " is-active" : "")} onClick={() => goTo(2)}>{t.nav.design}</span>
          <span className={"nl-nav-link" + (active === 3 ? " is-active" : "")} onClick={() => goTo(3)}>{t.nav.develop}</span>
          <span className={"nl-nav-link" + (active === 4 ? " is-active" : "")} onClick={() => goTo(4)}>{t.nav.manifesto}</span>
          <span className={"nl-nav-link" + (active === 5 ? " is-active" : "")} onClick={() => goTo(5)}>{t.nav.studio}</span>
        </nav>
        <div className="nl-topbar-right">
          <button className="nl-locale" onClick={toggleLocale}>
            <span className="nl-locale-now">{t.locale}</span>
            <span className="nl-locale-sep">/</span>
            <span className="nl-locale-alt">{t.altLocale}</span>
          </button>
        </div>
      </header>

      {/* Side rail */}
      <div className="nl-rail">
        {SECTION_KEYS.map((k, i) => (
          <button
            key={k}
            aria-label={k}
            className={"nl-rail-dot" + (active === i ? " is-active" : "")}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="nl-counter">
        <span className="nl-counter-num">{String(active + 1).padStart(2, "0")}</span>
        <span className="nl-counter-bar" style={{ "--nl-progress": progress + "%" }} />
        <span>{String(SECTION_KEYS.length).padStart(2, "0")}</span>
        <span style={{ marginLeft: 12 }}>{sectionLabels[lang][active]?.split(" · ")[1]}</span>
      </div>

      {/* Floating CTA */}
      <button className={"nl-fab" + (shrunk ? " is-shrunk" : "")} onClick={onCTA}>
        <WhatsappIcon />
        <span className="nl-fab-label-long">{t.cta_whatsapp}</span>
        <span className="nl-fab-label-short">{t.cta_short}</span>
      </button>

      {/* Sections */}
      <main ref={scrollRef} className="nl-scroll">
        <section data-screen-label="00 Hero" data-idx="0"><HeroSection onCTA={onCTA} /></section>
        <section data-screen-label="01 Problem" data-idx="1"><ProblemSection /></section>
        <section data-screen-label="02 Solution" data-idx="2"><SolutionSection /></section>
        <section data-screen-label="03 Products" data-idx="3"><ProductsSection /></section>
        <section data-screen-label="04 Method" data-idx="4"><MethodSection /></section>
        <section data-screen-label="05 Pricing" data-idx="5"><PricingSection /></section>
        <section data-screen-label="06 Closing" data-idx="6"><ClosingSection onCTA={onCTA} /></section>
      </main>
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Vista previa">
          <TweakSelect
            label="Viewport"
            value={tweaks.viewport}
            options={Object.entries(VIEWPORTS).map(([v, o]) => ({
              value: v,
              label: o.w ? `${o.label} — ${o.w}×${o.h}` : o.label,
            }))}
            onChange={(v) => setTweak("viewport", v)}
          />
        </TweakSection>
        <TweakSection title="Apariencia">
          <TweakRadio
            label="Tema"
            value={tweaks.theme}
            options={[{ value: "dark", label: "Oscuro" }, { value: "light", label: "Claro" }]}
            onChange={(v) => setTweak("theme", v)}
          />
          <TweakRadio
            label="Tipografía"
            value={tweaks.typo}
            options={[{ value: "sans", label: "Sans" }, { value: "serif", label: "Serif" }]}
            onChange={(v) => setTweak("typo", v)}
          />
          <TweakRadio
            label="Densidad"
            value={tweaks.density}
            options={[{ value: "normal", label: "Amplio" }, { value: "compact", label: "Compacto" }]}
            onChange={(v) => setTweak("density", v)}
          />
        </TweakSection>
        <TweakSection title="Fondo animado">
          <TweakSelect
            label="Estilo"
            value={tweaks.bgMode}
            options={[
              { value: "neural", label: "Red neuronal" },
              { value: "grid", label: "Constelación densa" },
              { value: "blobs", label: "Orbes lentos" },
            ]}
            onChange={(v) => setTweak("bgMode", v)}
          />
          <TweakSlider
            label="Intensidad"
            min={0.2} max={1.4} step={0.1}
            value={tweaks.intensity}
            onChange={(v) => setTweak("intensity", v)}
          />
        </TweakSection>
        <TweakSection title="Color de acento">
          <TweakColor
            label="Acento"
            value={tweaks.accent}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
        <TweakSection title="Idioma">
          <TweakRadio
            label="Locale"
            value={tweaks.locale}
            options={[{ value: "es", label: "ES" }, { value: "en", label: "EN" }]}
            onChange={(v) => setTweak("locale", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
