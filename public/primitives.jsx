// Reveal primitives + small UI helpers

const useInView = (opts = {}) => {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (opts.once !== false) io.disconnect();
        } else if (opts.once === false) {
          setInView(false);
        }
      },
      { threshold: opts.threshold ?? 0.2, rootMargin: opts.rootMargin ?? "0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
};

// Reveal text word-by-word
const RevealWords = ({ text, delay = 0, stagger = 60, className = "", as: As = "span" }) => {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const words = String(text).split(" ");
  return (
    <As ref={ref} className={className} style={{ display: "inline" }}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            marginRight: "0.25em",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: inView ? "translateY(0%)" : "translateY(110%)",
              opacity: inView ? 1 : 0,
              transition: `transform 900ms cubic-bezier(.2,.7,.1,1) ${delay + i * stagger}ms, opacity 700ms ${delay + i * stagger}ms`,
            }}
          >
            {w}
          </span>
        </span>
      ))}
    </As>
  );
};

// Reveal letter-by-letter (used sparingly)
const RevealLetters = ({ text, delay = 0, stagger = 25, className = "" }) => {
  const [ref, inView] = useInView({ threshold: 0.4 });
  return (
    <span ref={ref} className={className}>
      {String(text).split("").map((c, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20%)",
            transition: `opacity 600ms ${delay + i * stagger}ms, transform 600ms ${delay + i * stagger}ms`,
          }}
        >
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </span>
  );
};

// Generic fade/slide in
const Reveal = ({ children, delay = 0, y = 24, className = "", style = {}, once = true }) => {
  const [ref, inView] = useInView({ threshold: 0.15, once });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 900ms cubic-bezier(.2,.7,.1,1) ${delay}ms, transform 900ms cubic-bezier(.2,.7,.1,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Typewriter (used for closing line of team section)
const Typewriter = ({ text, speed = 28, className = "", startWhenInView = true }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const [out, setOut] = React.useState("");
  React.useEffect(() => {
    if (!inView && startWhenInView) return;
    let i = 0;
    setOut("");
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [inView, text]);
  return (
    <span ref={ref} className={className}>
      {out}
      <span className="nl-caret" />
    </span>
  );
};

// Strikethrough text that draws when in view
const StrikeThrough = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({ threshold: 0.4 });
  return (
    <span
      ref={ref}
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      <span style={{ opacity: inView ? 0.45 : 1, transition: `opacity 800ms ${delay + 600}ms` }}>{children}</span>
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "55%",
          height: "0.08em",
          background: "currentColor",
          transformOrigin: "left center",
          transform: inView ? "scaleX(1)" : "scaleX(0)",
          transition: `transform 700ms cubic-bezier(.7,0,.3,1) ${delay}ms`,
        }}
      />
    </span>
  );
};

Object.assign(window, { useInView, RevealWords, RevealLetters, Reveal, Typewriter, StrikeThrough });
