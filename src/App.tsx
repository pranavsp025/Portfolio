import { useEffect, useRef, useState, useCallback } from "react";
import { Section } from "./components/Section";
import { SectionHeader } from "./components/SectionHeader";
// import { PixelGame } from "./components/PixelGame";

const SECTIONS = [
  { id: "home", label: "home" },
  { id: "about", label: "about" },
  { id: "work", label: "work" },
  { id: "stack", label: "stack" },
  { id: "contact", label: "contact" },
];

const PROJECTS = [
  {
    name: "TrackPlay",
    tag: "Gaming Utilities",
    desc: "A high-performance session tracking dashboard for gamers. Live telemetry parsing, visual game-stat analytics, and low-latency data streams baked in.",
    stack: ["React", "TypeScript", "Vite", "Tailwind"],
    url: "https://track-play-drab.vercel.app/"
  },
];

const STACK = [
  "TypeScript", "React", "Next.js", "Vite",
  "Tailwind", "GSAP", "Redux Toolkit", "ShadCN",
  "Node.js", "Material UI", "CSS3", "HTML5"
];

export default function App() {
  const [active, setActive] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActive(idx);
          }
        });
      },
      { threshold: 0.55 },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, idx));
    sectionRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
      }
      if (e.key === "PageUp") {
        e.preventDefault();
        scrollToSection(active - 1);
      } else if (e.key === "PageDown") {
        e.preventDefault();
        scrollToSection(active + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, scrollToSection]);

  return (
    <div className="relative min-h-screen bg-background text-foreground font-mono selection:bg-primary selection:text-primary-foreground">
      {/* Grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />

      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/60 backdrop-blur-md bg-background/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
            <span className="font-semibold tracking-wider">pranav.p</span>
            <span className="text-muted-foreground">/ front-end engineer</span>
          </div>
          <nav className="hidden gap-6 text-xs uppercase tracking-widest text-muted-foreground md:flex">
            {SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(i)}
                className={`transition-colors hover:text-foreground ${active === i ? "text-primary" : ""}`}
              >
                {String(i + 1).padStart(2, "0")}. {s.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Right-side game rail */}
      {/* <PixelGame /> */}

      {/* <main className="relative mx-auto max-w-6xl px-6 pr-6 md:pr-40"> */}
      <main className="relative mx-auto max-w-6xl px-6 pr-6 md:pr-6">
        <Section id={SECTIONS[0].id} idx={0} refCb={(el) => (sectionRefs.current[0] = el)}>
          <div className="flex min-h-screen flex-col justify-center py-24">
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-primary">
              &gt; portfolio.init()
            </p>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              I build <span className="text-primary">interfaces</span>
              <br />
              that feel <span className="text-accent italic">alive</span>.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Associate software engineer with 2 years of experience turning heavy data loads, like live AI streaming and complex dashboards into seamless user interfaces.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => scrollToSection(2)}
                className="rounded-md border border-primary bg-primary/10 px-4 py-2 font-medium uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_24px_var(--primary)]"
              >
                See work →
              </button>
              <span className="text-muted-foreground">
                scroll to explore · play the{" "}
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5">←</kbd>
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5">→</kbd>
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5">space</kbd>{" "}
                game →
              </span>
            </div>
          </div>
        </Section>

        <Section id={SECTIONS[1].id} idx={1} refCb={(el) => (sectionRefs.current[1] = el)}>
          <div className="flex min-h-screen flex-col justify-center py-24">
            <SectionHeader num="01" title="about" />
            <div className="mt-10 grid gap-10 md:grid-cols-5">
              <div className="md:col-span-3 space-y-5 text-base leading-relaxed text-muted-foreground">
                <p>
                  I'm <span className="text-foreground">Pranav</span>,
                  Frontend Engineer building scalable web apps and responsive UIs using React, Next.js, Vite, TypeScript, Tailwind, Shadcn, and Material UI.</p>
                <p>
                  Experienced in engineering low-latency streaming tools and AI chatbots via <span className="text-foreground">SSE</span>, <span className="text-foreground">WebSockets</span>, and <span className="text-foreground">Event-JSON</span> parsing secured with Keycloak Auth. </p>
                <p>
                  Skilled in optimizing data-heavy dashboards and complex async API traffic using GraphQL (Apollo), Redux Toolkit (RTK), and REST APIs.</p>
              </div>
              <div className="md:col-span-2 rounded-lg border border-border bg-card/60 p-6 backdrop-blur">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  now
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-muted-foreground">location</span><span>Kerala, India</span></li>
                  <li className="flex justify-between"><span className="text-muted-foreground">role</span><span>Associate Software Engineer</span></li>
                  {/* <li className="flex justify-between"><span className="text-muted-foreground">availability</span><span className="text-primary">open Q3</span></li> */}
                  <li className="flex justify-between"><span className="text-muted-foreground">timezone</span><span>IST / UTC+5:30</span></li>
                </ul>
              </div>
            </div>
          </div>
        </Section>

        <Section id={SECTIONS[2].id} idx={2} refCb={(el) => (sectionRefs.current[2] = el)}>
          <div className="flex min-h-screen flex-col justify-center py-24">
            <SectionHeader num="02" title="selected work" />
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {PROJECTS.map((p) => (
                <article
                  key={p.name}
                  onClick={() => window.open(p.url, "_blank")}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card/70 p-6 backdrop-blur transition-all hover:border-primary hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_var(--primary)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-accent">
                        {p.tag}
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold">{p.name}</h3>
                    </div>
                    <span className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="rounded border border-border bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section id={SECTIONS[3].id} idx={3} refCb={(el) => (sectionRefs.current[3] = el)}>
          <div className="flex min-h-screen flex-col justify-center py-24">
            <SectionHeader num="03" title="stack" />
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {STACK.map((s, i) => (
                <div
                  key={s}
                  className="rounded-lg border border-border bg-card/60 p-4 backdrop-blur transition-colors hover:border-primary hover:text-primary"
                >
                  <p className="text-[10px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-sm font-medium">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id={SECTIONS[4].id} idx={4} refCb={(el) => (sectionRefs.current[4] = el)}>
          <div className="flex min-h-screen flex-col justify-center py-24">
            <SectionHeader num="04" title="contact" />
            <div className="mt-10 max-w-2xl">
              <p className="text-3xl leading-snug md:text-4xl">
                Got a product with a{" "}
                <span className="text-primary">tricky interface</span> or a{" "}
                <span className="text-accent">wild idea</span>? Let's talk.
              </p>
              <div className="mt-10 space-y-3 text-sm">
                <a
                  href="mailto:pranavsp025@gmail.com"
                  className="group flex items-center justify-between rounded-lg border border-border bg-card/60 p-4 backdrop-blur transition-colors hover:border-primary"
                  target="_blank"
                >
                  <span><span className="text-muted-foreground">email —</span> pranavsp025@gmail.com</span>
                  <span className="text-muted-foreground group-hover:text-primary">→</span>
                </a>
                <a
                  href="https://github.com/pranavsp025"
                  className="group flex items-center justify-between rounded-lg border border-border bg-card/60 p-4 backdrop-blur transition-colors hover:border-primary"
                  target="_blank"
                >
                  <span><span className="text-muted-foreground">github —</span> @pranavsp025</span>
                  <span className="text-muted-foreground group-hover:text-primary">→</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/p-pranav-721023235/"
                  className="group flex items-center justify-between rounded-lg border border-border bg-card/60 p-4 backdrop-blur transition-colors hover:border-primary"
                  target="_blank"
                >
                  <span><span className="text-muted-foreground">linkedin —</span> @p-pranav-721023235</span>
                  <span className="text-muted-foreground group-hover:text-primary">→</span>
                </a>
              </div>
              <p className="mt-16 text-xs text-muted-foreground">
                © 2026 Pranav · built with too much coffee and a pixel friend
              </p>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}


