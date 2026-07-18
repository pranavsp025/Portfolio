import { useEffect, useMemo, useRef, useState } from "react";
import { PixelChar } from "./PixelChar";

const RAIL_W = 128;
const CHAR_W = 18;
const CHAR_H = 22;
const GRAVITY = 0.55;
const MOVE_SPEED = 2.2;
const JUMP_V = -9.5;

type Platform = { x: number; y: number; w: number };

function buildPlatforms(railH: number): Platform[] {
  // Bottom "ground" plus a staggered tower of platforms zig-zagging left/right.
  const plats: Platform[] = [
    { x: 0, y: railH - 10, w: RAIL_W }, // ground
  ];
  // Pseudo-random but stable layout
  const seed = [0.15, 0.62, 0.28, 0.75, 0.4, 0.08, 0.55, 0.9, 0.32, 0.7, 0.2, 0.58];
  const step = 74; // vertical spacing
  let y = railH - 70;
  let i = 0;
  while (y > 90) {
    const w = 44 + Math.round(seed[i % seed.length] * 22);
    const maxX = RAIL_W - w - 4;
    const x = Math.round(seed[(i * 3 + 1) % seed.length] * maxX);
    plats.push({ x, y, w });
    y -= step - Math.round(seed[(i + 2) % seed.length] * 14);
    i++;
  }
  return plats;
}

export function PixelGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [railH, setRailH] = useState(600);
  const [platforms, setPlatforms] = useState<Platform[]>(() => buildPlatforms(600));
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Sorted bottom → top so index 0 = ground, last = highest platform
  const sortedPlats = useMemo(
    () => [...platforms].sort((a, b) => b.y - a.y),
    [platforms],
  );

  // Character state kept in refs to avoid re-render churn from rAF loop
  const posRef = useRef({ x: RAIL_W / 2 - CHAR_W / 2, y: 0, vx: 0, vy: 0, onGround: false });
  const keysRef = useRef({ left: false, right: false, jump: false });
  const facingRef = useRef<1 | -1>(1);
  // Displayed position (drives render). Physics writes here in manual mode;
  // scroll-progress interpolation writes here in auto mode.
  const displayRef = useRef({ x: RAIL_W / 2 - CHAR_W / 2, y: 0 });
  const reachedIdxRef = useRef(0);
  const scrollLockRef = useRef(0); // timestamp to avoid feedback loops
  const [, force] = useState(0);

  // Measure rail height & rebuild platforms on resize
  useEffect(() => {
    const update = () => {
      const h = containerRef.current?.clientHeight ?? window.innerHeight;
      setRailH(h);
      const p = buildPlatforms(h);
      setPlatforms(p);
      // Drop char onto the ground initially
      posRef.current.x = RAIL_W / 2 - CHAR_W / 2;
      posRef.current.y = h - 10 - CHAR_H;
      posRef.current.vx = 0;
      posRef.current.vy = 0;
      displayRef.current.x = posRef.current.x;
      displayRef.current.y = posRef.current.y;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Mode switch: click inside game = manual, outside = auto. Esc also drops to auto.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const inside = containerRef.current?.contains(e.target as Node);
      setMode(inside ? "manual" : "auto");
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  // On switching to manual, seed physics from current on-screen position
  useEffect(() => {
    if (mode === "manual") {
      posRef.current.x = displayRef.current.x;
      posRef.current.y = displayRef.current.y;
      posRef.current.vx = 0;
      posRef.current.vy = 0;
      posRef.current.onGround = false;
      // Sync reached index to current scroll position
      const N = sortedPlats.length;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      reachedIdxRef.current = Math.round(p * (N - 1));
    }
  }, [mode, sortedPlats]);

  // Key handling — only intercepts arrows/space in manual mode.
  // In auto mode we let the browser scroll naturally.
  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
    const down = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === "Escape") {
        setMode("auto");
        return;
      }
      if (modeRef.current !== "manual") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        keysRef.current.left = true;
        facingRef.current = -1;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        keysRef.current.right = true;
        facingRef.current = 1;
      } else if (e.key === " " || e.key === "ArrowUp" || e.key === "Spacebar") {
        e.preventDefault();
        keysRef.current.jump = true;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      else if (e.key === "ArrowRight") keysRef.current.right = false;
      else if (e.key === " " || e.key === "ArrowUp" || e.key === "Spacebar") keysRef.current.jump = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Main loop: auto = drive from scroll progress; manual = physics + drive scroll
  useEffect(() => {
    let raf = 0;
    const N = sortedPlats.length;
    const tick = () => {
      if (modeRef.current === "auto") {
        // Snap character to the platform matching scroll progress — no free-flow arc.
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const prog = Math.max(0, Math.min(1, window.scrollY / maxScroll));
        const idx = Math.round(prog * (N - 1));
        if (sortedPlats[idx]) {
          const pl = sortedPlats[idx];
          const tx = pl.x + pl.w / 2 - CHAR_W / 2;
          const ty = pl.y - CHAR_H;
          if (idx !== reachedIdxRef.current) {
            facingRef.current = tx >= displayRef.current.x ? 1 : -1;
            reachedIdxRef.current = idx;
          }
          displayRef.current.x = tx;
          displayRef.current.y = ty;
        }
      } else {
        // Manual physics
        const p = posRef.current;
        const k = keysRef.current;
        if (k.left && !k.right) p.vx = -MOVE_SPEED;
        else if (k.right && !k.left) p.vx = MOVE_SPEED;
        else p.vx = 0;
        if (k.jump && p.onGround) {
          p.vy = JUMP_V;
          p.onGround = false;
        }
        p.vy += GRAVITY;
        if (p.vy > 14) p.vy = 14;
        p.x += p.vx;
        if (p.x < 0) p.x = 0;
        if (p.x > RAIL_W - CHAR_W) p.x = RAIL_W - CHAR_W;
        const prevBottom = p.y + CHAR_H;
        p.y += p.vy;
        const newBottom = p.y + CHAR_H;
        p.onGround = false;
        if (p.vy >= 0) {
          for (const pl of platforms) {
            const withinX = p.x + CHAR_W > pl.x + 2 && p.x < pl.x + pl.w - 2;
            if (withinX && prevBottom <= pl.y && newBottom >= pl.y) {
              p.y = pl.y - CHAR_H;
              p.vy = 0;
              p.onGround = true;
              // If landing on a different platform, sync scroll to it
              const idx = sortedPlats.indexOf(pl);
              if (idx !== reachedIdxRef.current && idx >= 0) {
                reachedIdxRef.current = idx;
                const maxScroll = Math.max(
                  1,
                  document.documentElement.scrollHeight - window.innerHeight,
                );
                const target = (idx / (N - 1)) * maxScroll;
                scrollLockRef.current = performance.now();
                window.scrollTo({ top: target, behavior: "smooth" });
              }
              break;
            }
          }
        }
        if (p.y > railH) {
          p.y = railH - 10 - CHAR_H;
          p.vy = 0;
          p.onGround = true;
        }
        displayRef.current.x = p.x;
        displayRef.current.y = p.y;
      }
      force((n) => (n + 1) % 1000000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [platforms, sortedPlats, railH]);

  const d = displayRef.current;

  return (
    <aside
      aria-label="Pixel platformer"
      className="fixed right-4 top-0 z-30 hidden h-screen w-32 md:block"
    >
      <div
        ref={containerRef}
        className={`relative h-full w-full overflow-hidden transition-all cursor-pointer ${
          mode === "manual"
            ? "bg-background/40 ring-1 ring-primary/40 rounded-md"
            : ""
        }`}
        style={{ width: RAIL_W }}
      >
        {/* Faint side rails for game feel */}
        <div className="absolute inset-y-0 left-0 w-px bg-border/40" />
        <div className="absolute inset-y-0 right-0 w-px bg-border/40" />

        {/* Mode indicator */}
        <div className="pointer-events-none absolute top-20 left-0 right-0 text-center text-[8px] uppercase tracking-widest">
          <span
            className={
              mode === "manual"
                ? "text-primary"
                : "text-muted-foreground/70"
            }
          >
            {mode === "manual" ? "● playing" : "auto · click to play"}
          </span>
        </div>

        {/* Platforms */}
        {platforms.map((pl, i) => (
          <div
            key={i}
            className="absolute rounded-[2px]"
            style={{
              left: pl.x,
              top: pl.y,
              width: pl.w,
              height: i === 0 ? 10 : 6,
              background:
                i === 0
                  ? "linear-gradient(180deg, var(--primary) 0%, transparent 100%)"
                  : "var(--accent)",
              boxShadow:
                i === 0
                  ? "0 0 12px var(--primary)"
                  : "0 0 8px color-mix(in oklch, var(--accent) 60%, transparent)",
              opacity: i === 0 ? 0.35 : 0.9,
            }}
          />
        ))}

        {/* Character */}
        <div
          className={`absolute ${mode === "auto" ? "transition-all duration-500 ease-out" : ""}`}
          style={{
            left: d.x,
            top: d.y,
            width: CHAR_W,
            height: CHAR_H,
            transform: `scaleX(${facingRef.current})`,
          }}
        >
          <PixelChar squashing={mode === "manual" && !posRef.current.onGround} />
        </div>

        {/* Controls hint */}
        <div className="pointer-events-auto absolute bottom-2 left-0 right-0 text-center text-[8px] uppercase tracking-widest text-muted-foreground/70">
          <div className="mb-1 flex justify-center gap-1">
            <kbd className="rounded border border-border bg-card px-1 py-0.5">←</kbd>
            <kbd className="rounded border border-border bg-card px-1 py-0.5">→</kbd>
            <kbd className="rounded border border-border bg-card px-1 py-0.5">␣</kbd>
          </div>
          {mode === "manual" ? "move · jump" : "scroll = auto play"}
        </div>
      </div>
    </aside>
  );
}
