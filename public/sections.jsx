// Sections — each rendered inside a snap section wrapper
const T = () => window.__NL_T;

// ============ HERO ============
const HeroSection = ({ onCTA }) => {
  const t = T().hero;
  return (
    <div className="nl-section nl-hero">
      <div className="nl-hero-inner">
        <Reveal delay={200}>
          <div className="nl-eyebrow">{t.eyebrow}</div>
        </Reveal>
        <h1 className="nl-display nl-h1">
          <span className="nl-display-line">
            <RevealWords text={t.title_a} delay={400} stagger={70} />
          </span>
          <span className="nl-display-line nl-display-line--accent">
            <RevealWords text={t.title_b} delay={900} stagger={70} />
          </span>
        </h1>
        <Reveal delay={1700} y={16}>
          <p className="nl-sub">{t.sub}</p>
        </Reveal>
        <Reveal delay={2000} y={12}>
          <button className="nl-btn nl-btn--primary nl-btn--pulse" onClick={onCTA}>
            <span>{t.cta}</span>
            <ArrowIcon />
          </button>
        </Reveal>
      </div>

      <div className="nl-hero-pillars">
        {t.pillars.map((p, i) => (
          <Reveal key={p} delay={2200 + i * 120} y={8}>
            <div className="nl-pillar-row">
              <span className="nl-pillar-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="nl-pillar-name">{p}</span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={2600}>
        <div className="nl-scroll-indicator">
          <span>{t.scroll}</span>
          <span className="nl-scroll-line" />
        </div>
      </Reveal>
    </div>
  );
};

// ============ PROBLEM ============
const ProblemSection = () => {
  const t = T().problem;
  return (
    <div className="nl-section nl-problem">
      <Reveal>
        <div className="nl-section-label">{t.label}</div>
      </Reveal>
      <h2 className="nl-display nl-h2">
        <span className="nl-display-line"><RevealWords text={t.title_a} stagger={60} delay={150} /></span>
        <span className="nl-display-line nl-muted-strong"><RevealWords text={t.title_b} stagger={60} delay={500} /></span>
      </h2>
      <Reveal delay={1100}>
        <p className="nl-bridge">{t.bridge}</p>
      </Reveal>
      <div className="nl-problem-grid">
        {t.blocks.map((b, i) => (
          <Reveal key={i} delay={1300 + i * 220} y={28}>
            <div className="nl-problem-card">
              <div className="nl-problem-num">0{i + 1}</div>
              <div className="nl-problem-icon">
                {[<IconCircuit />, <IconCash />, <IconTrend />, <IconClock />][i]}
              </div>
              <div className="nl-problem-t">{b.t}</div>
              <div className="nl-problem-d">{b.d}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={2400}>
        <div className="nl-problem-close">{t.close}</div>
      </Reveal>
    </div>
  );
};

// ============ SOLUTION ============
const SolutionSection = () => {
  const t = T().solution;
  return (
    <div className="nl-section nl-solution">
      <Reveal>
        <div className="nl-section-label">{t.label}</div>
      </Reveal>
      <h2 className="nl-display nl-h2 nl-solution-title">
        <span className="nl-display-line nl-muted-strong">
          <StrikeThrough delay={400}>{t.strike}</StrikeThrough>
        </span>
        <span className="nl-display-line">
          <RevealWords text={t.title} delay={1500} stagger={70} />
        </span>
      </h2>
      <Reveal delay={2200}>
        <p className="nl-sub nl-sub--center">{t.body}</p>
      </Reveal>
    </div>
  );
};

// ============ TEAM ============
const TeamSection = () => {
  const t = T().team;
  return (
    <div className="nl-section nl-team">
      <Reveal>
        <div className="nl-section-label">{t.label}</div>
      </Reveal>
      <h2 className="nl-display nl-h2">
        <span className="nl-display-line"><RevealWords text={t.title_a} delay={100} /></span>
        <span className="nl-display-line"><RevealWords text={t.title_b} delay={500} /></span>
        <span className="nl-display-line nl-muted-strong"><RevealWords text={t.title_c} delay={900} /></span>
      </h2>
      <div className="nl-team-grid">
        <Reveal delay={1500} y={0} className="nl-team-card nl-team-card--left">
          <div className="nl-portrait">
            <span className="nl-portrait-init">N</span>
            <span className="nl-portrait-corner">01</span>
            <span className="nl-portrait-line" />
          </div>
          <div className="nl-team-meta">
            <div className="nl-team-name">{t.noel.name}</div>
            <div className="nl-team-role">{t.noel.role}</div>
            <div className="nl-team-bio">{t.noel.bio}</div>
          </div>
        </Reveal>
        <Reveal delay={1700} y={0} className="nl-team-card nl-team-card--right">
          <div className="nl-portrait">
            <span className="nl-portrait-init">S</span>
            <span className="nl-portrait-corner">02</span>
            <span className="nl-portrait-line" />
          </div>
          <div className="nl-team-meta">
            <div className="nl-team-name">{t.sam.name}</div>
            <div className="nl-team-role">{t.sam.role}</div>
            <div className="nl-team-bio">{t.sam.bio}</div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={2200}>
        <div className="nl-team-close">
          <Typewriter text={t.close} />
        </div>
      </Reveal>
    </div>
  );
};

// ============ PRODUCTS ============
const ProductsSection = () => {
  const t = T().products;
  const [active, setActive] = React.useState(null);
  return (
    <div className="nl-section nl-products">
      <Reveal>
        <div className="nl-section-label">{t.label}</div>
      </Reveal>
      <h2 className="nl-display nl-h2 nl-products-title">
        <span className="nl-display-line"><RevealWords text={t.title_a} delay={100} /></span>
        <span className="nl-display-line"><RevealWords text={t.title_b} delay={400} /></span>
        <span className="nl-display-line nl-muted-strong"><RevealWords text={t.title_c} delay={700} /></span>
      </h2>
      <Reveal delay={1300}>
        <p className="nl-bridge">{t.bridge}</p>
      </Reveal>
      <div className="nl-products-grid">
        {t.cards.map((c, i) => (
          <Reveal key={i} delay={1500 + i * 140} y={28}>
            <div
              className={"nl-product-card" + (active === i ? " is-active" : "")}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <div className="nl-product-num">{c.n}</div>
              <div className="nl-product-icon">
                {{ app: <IconApp />, flow: <IconFlow />, auto: <IconAuto />, web: <IconWeb />, agent: <IconAgent /> }[c.icon]}
              </div>
              <div className="nl-product-t">{c.t}</div>
              <div className="nl-product-front">{c.does}</div>
              <div className="nl-product-back">
                <div className="nl-product-back-label">{t.hover_label}</div>
                <div className="nl-product-back-text">{c.gain}</div>
              </div>
              <div className="nl-product-arrow"><ArrowIcon /></div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

// ============ METHOD ============
const MethodSection = () => {
  const t = T().method;
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <div className="nl-section nl-method">
      <Reveal>
        <div className="nl-section-label">{t.label}</div>
      </Reveal>
      <h2 className="nl-display nl-h2">
        <RevealWords text={t.title} delay={150} stagger={60} />
      </h2>
      <Reveal delay={900}>
        <p className="nl-bridge">{t.bridge}</p>
      </Reveal>
      <div ref={ref} className="nl-method-timeline">
        <div
          className="nl-method-track"
          style={{
            transform: inView ? "scaleX(1)" : "scaleX(0)",
            transition: "transform 1800ms cubic-bezier(.7,0,.3,1) 600ms",
          }}
        />
        {t.steps.map((s, i) => (
          <div
            key={i}
            className="nl-method-step"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 700ms ${1000 + i * 350}ms, transform 700ms ${1000 + i * 350}ms`,
            }}
          >
            <div className="nl-method-node" />
            <div className="nl-method-num">{s.n}</div>
            <div className="nl-method-t">{s.t}</div>
            <div className="nl-method-d">{s.d}</div>
          </div>
        ))}
      </div>
      <Reveal delay={2400}>
        <div className="nl-method-close"><span className="nl-underline">{t.close}</span></div>
      </Reveal>
    </div>
  );
};

// ============ PRICING (now Contact / Consultation) ============
const PricingSection = () => {
  const t = T().pricing;
  return (
    <div className="nl-section nl-pricing">
      <Reveal>
        <div className="nl-section-label">{t.label}</div>
      </Reveal>
      <h2 className="nl-display nl-h2">
        <RevealWords text={t.title} delay={150} stagger={60} />
      </h2>
      <Reveal delay={1100}>
        <p className="nl-bridge">{t.sub}</p>
      </Reveal>
      <div className="nl-pricing-grid">
        {t.tiers.map((tier, i) => (
          <Reveal key={i} delay={1300 + i * 200} y={28}>
            <div className={"nl-tier" + (tier.featured ? " nl-tier--featured" : "")}>
              {tier.featured && <div className="nl-tier-badge">{tier.badge}</div>}
              <div className="nl-tier-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="nl-tier-name">{tier.name}</div>
              <div className="nl-tier-tag">{tier.tagline}</div>
              <div className="nl-tier-point">{tier.point}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={2000}>
        <div className="nl-pricing-meta">
          <div className="nl-pricing-meta-item">
            <span className="nl-pricing-meta-label">{t.labels.duration}</span>
            <span className="nl-pricing-meta-value">{t.labels.thirty}</span>
          </div>
          <div className="nl-pricing-meta-item">
            <span className="nl-pricing-meta-label">{t.labels.format}</span>
            <span className="nl-pricing-meta-value">{t.labels.videocall}</span>
          </div>
          <div className="nl-pricing-meta-item">
            <span className="nl-pricing-meta-label">{t.labels.commitment}</span>
            <span className="nl-pricing-meta-value">{t.labels.none}</span>
          </div>
        </div>
      </Reveal>
      <Reveal delay={2200}>
        <div className="nl-pricing-note">{t.note}</div>
      </Reveal>
    </div>
  );
};

// ============ CLOSING ============
const ClosingSection = ({ onCTA }) => {
  const t = T().closing;
  const f = T().footer;
  return (
    <div className="nl-section nl-closing">
      <Reveal>
        <div className="nl-section-label">{t.label}</div>
      </Reveal>
      <h2 className="nl-display nl-h1 nl-closing-title">
        <span className="nl-display-line"><RevealWords text={t.title_a} delay={150} stagger={70} /></span>
        <span className="nl-display-line nl-muted-strong"><RevealWords text={t.title_b} delay={900} stagger={70} /></span>
        <span className="nl-display-line nl-emphasis"><RevealWords text={t.title_c} delay={1700} stagger={80} /></span>
      </h2>
      <Reveal delay={2200}>
        <p className="nl-sub nl-sub--center">{t.body}</p>
      </Reveal>
      <Reveal delay={2500}>
        <button className="nl-btn nl-btn--primary nl-btn--big" onClick={onCTA}>
          <WhatsappIcon />
          <span>{t.cta}</span>
        </button>
      </Reveal>
      <Reveal delay={2700}>
        <div className="nl-closing-below">{t.below}</div>
      </Reveal>

      <div className="nl-footer">
        <Reveal delay={3000}>
          <div className="nl-footer-tag">
            <span className="nl-footer-mark">Next Step</span>
            <span className="nl-footer-tagline">{f.tagline}</span>
          </div>
        </Reveal>
        <Reveal delay={3100}>
          <div className="nl-footer-row">
            <div className="nl-footer-contact">
              {f.contact.map((c, i) => (
                <a key={i} href="#" className="nl-footer-link">{c}</a>
              ))}
            </div>
            <div className="nl-footer-legal">{f.legal}</div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};

Object.assign(window, {
  HeroSection, ProblemSection, SolutionSection, TeamSection,
  ProductsSection, MethodSection, PricingSection, ClosingSection,
});
