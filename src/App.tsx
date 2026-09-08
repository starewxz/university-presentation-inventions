import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const TOTAL_SLIDES = 6;

/* ─── IMAGE URLS ─── */
const IMG = {
  // Balloon: group of people around early observation balloon (Australian War Memorial)
  balloon1: "https://images.unsplash.com/photo-1695370530101-187f6e546cb2?w=1200&h=800&fit=crop&auto=format&crop=top",
  // Balloon: brown/beige vintage balloon in flight
  balloon2: "https://images.unsplash.com/photo-1556816022-902c5b1d3123?w=800&h=1000&fit=crop&auto=format",
  // Balloon: men in balloon basket
  balloon3: "https://images.unsplash.com/photo-1602186123517-f590a05dff27?w=700&h=900&fit=crop&auto=format&crop=center",
  // Anesthesia: Austrian National Library — surgical theatre audience (PERFECT archival)
  surgery1: "https://images.unsplash.com/photo-1575654402689-8f45b1ee6179?w=1200&h=800&fit=crop&auto=format",
  // Anesthesia: National Library of Medicine — group of doctors
  surgery2: "https://images.unsplash.com/photo-1676288507025-e0f001be9926?w=800&h=600&fit=crop&auto=format",
  // Anesthesia: British Library — grayscale hospital ward
  surgery3: "https://images.unsplash.com/photo-1574088332960-4d92e1f0efd0?w=800&h=500&fit=crop&auto=format",
  // Barcode: Boston Public Library — vintage grayscale store
  grocery1: "https://images.unsplash.com/photo-1583504387527-81b66b3f758e?w=1200&h=800&fit=crop&auto=format",
  // Barcode: Oregon State — vintage couple in grocery store
  grocery2: "https://images.unsplash.com/photo-1727515471796-6da186c562ca?w=800&h=600&fit=crop&auto=format",
  // Barcode: black/white woman shopping
  grocery3: "https://images.unsplash.com/photo-1635895871710-2aa29c8f4a7c?w=700&h=900&fit=crop&auto=format&crop=left",
};

/* ─── SVG ICONS ─── */
function IconBalloon({ size = 48, color = "currentColor", strokeWidth = 1.2 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* Balloon envelope */}
      <ellipse cx="24" cy="19" rx="13" ry="15" />
      {/* Gore lines */}
      <path d="M24 4 Q17 12 17 19 Q17 26 24 34" strokeOpacity="0.4" />
      <path d="M24 4 Q31 12 31 19 Q31 26 24 34" strokeOpacity="0.4" />
      <line x1="24" y1="4" x2="24" y2="34" strokeOpacity="0.3" />
      {/* Ropes */}
      <path d="M18 31 L20 38 M30 31 L28 38" />
      {/* Basket */}
      <rect x="19" y="38" width="10" height="6" rx="1" />
      {/* Basket details */}
      <line x1="22" y1="38" x2="22" y2="44" strokeOpacity="0.5" />
      <line x1="26" y1="38" x2="26" y2="44" strokeOpacity="0.5" />
    </svg>
  );
}

function IconFlask({ size = 48, color = "currentColor", strokeWidth = 1.2 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {/* Flask body */}
      <path d="M18 6 L18 22 L8 38 Q7 42 12 43 L36 43 Q41 42 40 38 L30 22 L30 6" />
      {/* Neck */}
      <line x1="15" y1="6" x2="33" y2="6" />
      {/* Liquid level */}
      <path d="M11 35 Q18 32 24 34 Q30 36 37 33" strokeOpacity="0.45" />
      {/* Bubble */}
      <circle cx="20" cy="38" r="1.5" fill={color} stroke="none" opacity="0.5" />
      <circle cx="27" cy="36" r="1" fill={color} stroke="none" opacity="0.5" />
      {/* Stopper */}
      <rect x="19" y="3" width="10" height="4" rx="1" />
    </svg>
  );
}

function IconBarcode({ size = 48, color = "currentColor" }: { size?: number; color?: string }) {
  const pattern = [2,1,3,1,2,2,1,3,1,2,1,1,3,1,2,1,3,2,1,2];
  const totalUnits = pattern.reduce((a, b) => a + b, 0);
  const unitW = 40 / totalUnits;
  let x = 4;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Bars */}
      {pattern.map((w, i) => {
        const barX = x;
        x += w * unitW;
        if (i % 2 === 0) {
          return <rect key={i} x={barX} y="6" width={w * unitW} height="34" fill={color} />;
        }
        return null;
      })}
      {/* Number line */}
      <line x1="4" y1="43" x2="44" y2="43" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <text x="24" y="47.5" textAnchor="middle" fontSize="3.5" fill={color} opacity="0.55" fontFamily="'DM Mono', monospace">0 36000 29145 2</text>
    </svg>
  );
}

/* ─── LAYOUT PRIMITIVES ─── */
function SlideWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`slide-enter relative w-full h-full overflow-hidden paper-texture ${className}`}
      style={{ background: "var(--ivory)" }}
    >
      {children}
    </div>
  );
}

function Rule({ vertical = false, opacity = 1 }: { vertical?: boolean; opacity?: number }) {
  return (
    <div
      style={
        vertical
          ? { width: "1px", height: "100%", background: `rgba(26,22,18,${0.13 * opacity})`, flexShrink: 0 }
          : { height: "1px", width: "100%", background: `rgba(26,22,18,${0.13 * opacity})` }
      }
    />
  );
}

function SlideNum({ n, total }: { n: number; total: number }) {
  return (
    <span className="font-mono text-xs tracking-widest" style={{ color: "var(--ink-muted)" }}>
      {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
  );
}

function TopBar({ label, n }: { label: string; n: number }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-3.5 z-20"
      style={{ borderBottom: "1px solid rgba(26,22,18,0.1)" }}
    >
      <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--ink-muted)", letterSpacing: "0.12em" }}>
        {label}
      </span>
      <SlideNum n={n} total={TOTAL_SLIDES} />
    </div>
  );
}

function BottomBar({ left, right }: { left: string; right?: string }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-stretch z-20"
      style={{ height: "36px", borderTop: "1px solid rgba(26,22,18,0.1)" }}
    >
      <div
        className="flex items-center justify-center px-6 flex-shrink-0"
        style={{ background: "var(--burgundy)", minWidth: "120px" }}
      >
        <span className="font-mono text-xs text-white tracking-widest">{left}</span>
      </div>
      <div className="flex items-center px-6 flex-1">
        <span className="font-mono text-xs" style={{ color: "var(--ink-muted)" }}>{right}</span>
      </div>
    </div>
  );
}

/* ─── ARCHIVAL IMAGE FRAME ─── */
function ArchivalImg({
  src, alt, caption, style = {}, className = "", tint = "sepia(65%) contrast(1.1) brightness(0.88)",
}: {
  src: string; alt: string; caption?: string; style?: React.CSSProperties; className?: string; tint?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" style={{ filter: tint }} />
      {caption && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2"
          style={{ background: "linear-gradient(transparent, rgba(26,22,18,0.72))", zIndex: 2 }}
        >
          <span className="font-mono" style={{ fontSize: "0.6rem", color: "rgba(245,240,232,0.65)", letterSpacing: "0.06em" }}>
            {caption}
          </span>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   SLIDE 1 — COVER
══════════════════════════════════════════ */
function Slide1() {
  return (
    <SlideWrapper>
      {/* Full-bleed dark background strip — right 40% */}
      <div
        className="absolute top-0 right-0 bottom-0"
        style={{ width: "42%", background: "var(--ink)", zIndex: 0 }}
      />

      {/* ── LEFT: typographic content ── */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-between pt-8 pb-8 pl-10 pr-8"
        style={{ width: "58%", zIndex: 3 }}
      >
        {/* Header row */}
        <div className="flex items-center gap-3">
          <div style={{ width: "28px", height: "2px", background: "var(--burgundy)" }} />
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--burgundy)", letterSpacing: "0.14em" }}>
            Університетська Презентація
          </span>
        </div>

        {/* Main title block */}
        <div className="flex-1 flex flex-col justify-center pr-6">
          {/* Overline */}
          <div className="font-mono text-xs mb-4" style={{ color: "var(--ink-muted)", letterSpacing: "0.08em" }}>
            Три революції, що змінили світ
          </div>

          <h1
            className="font-display leading-none mb-3"
            style={{ fontSize: "clamp(2rem, 4.8vw, 3.6rem)", color: "var(--ink)", letterSpacing: "-0.025em", fontWeight: 700 }}
          >
            Три винаходи,
          </h1>
          <h1
            className="font-display italic leading-none mb-3"
            style={{ fontSize: "clamp(2rem, 4.8vw, 3.6rem)", color: "var(--burgundy)", letterSpacing: "-0.025em", fontWeight: 600 }}
          >
            які шокували
          </h1>
          <h1
            className="font-display leading-none mb-8"
            style={{ fontSize: "clamp(2rem, 4.8vw, 3.6rem)", color: "var(--ink)", letterSpacing: "-0.025em", fontWeight: 700 }}
          >
            людство
          </h1>

          <Rule />

          <p
            className="font-body mt-5 leading-relaxed"
            style={{ fontSize: "0.875rem", color: "var(--ink-muted)", maxWidth: "380px" }}
          >
            Три абсолютно різні винаходи, після яких світ уже не міг
            залишатися таким, як раніше.
          </p>

          {/* Three invention tags */}
          <div className="flex gap-2 mt-6">
            {[
              { label: "Повітряна куля", year: "1783" },
              { label: "Анестезія", year: "1846" },
              { label: "Штрихкод", year: "1974" },
            ].map((item) => (
              <div key={item.year} className="flex flex-col" style={{ border: "1px solid rgba(26,22,18,0.15)" }}>
                <div
                  className="px-3 py-1 font-mono text-xs"
                  style={{ background: "var(--burgundy)", color: "white", letterSpacing: "0.08em" }}
                >
                  {item.year}
                </div>
                <div className="px-3 py-1.5 font-body text-xs" style={{ color: "var(--ink-muted)" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom credit */}
        <div className="flex items-end justify-between gap-6">
          <div className="font-mono text-xs" style={{ color: "rgba(26,22,18,0.3)", letterSpacing: "0.06em" }}>
            Montgolfier · Morton · Woodland & Silver
          </div>
          <div
            className="font-body text-xs"
            style={{ color: "var(--burgundy)", fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap" }}
          >
            Виконала: Десятник Тетяна
          </div>
        </div>
      </div>

      {/* ── RIGHT: image collage ── */}
      <div className="absolute top-0 right-0 bottom-0 z-2" style={{ width: "42%", zIndex: 2 }}>

        {/* Top image: balloon crowd */}
        <div className="absolute" style={{ top: 0, left: 0, right: 0, height: "48%", borderBottom: "1px solid rgba(245,240,232,0.15)" }}>
          <ArchivalImg
            src={IMG.balloon3}
            alt="Men in hot air balloon basket"
            caption="Сучасний політ · Logan Weaver, 2020"
            style={{ width: "100%", height: "100%" }}
            tint="sepia(75%) contrast(1.1) brightness(0.78)"
          />
          {/* Overlay tint */}
          <div className="absolute inset-0" style={{ background: "rgba(26,22,18,0.25)", mixBlendMode: "multiply" }} />
        </div>

        {/* Middle image: surgical theatre */}
        <div className="absolute" style={{ top: "48%", left: 0, right: "50%", height: "26%", borderRight: "1px solid rgba(245,240,232,0.15)", borderBottom: "1px solid rgba(245,240,232,0.15)" }}>
          <ArchivalImg
            src={IMG.surgery1}
            alt="19th century surgical theatre"
            style={{ width: "100%", height: "100%" }}
            tint="sepia(80%) contrast(1.15) brightness(0.7)"
          />
        </div>

        {/* Bottom-right: grocery store */}
        <div className="absolute" style={{ top: "48%", left: "50%", right: 0, height: "26%", borderBottom: "1px solid rgba(245,240,232,0.15)" }}>
          <ArchivalImg
            src={IMG.grocery1}
            alt="Vintage grocery store"
            style={{ width: "100%", height: "100%" }}
            tint="sepia(70%) contrast(1.1) brightness(0.72)"
          />
        </div>

        {/* Bottom bar: icons */}
        <div
          className="absolute flex items-center justify-around px-8"
          style={{ bottom: 0, left: 0, right: 0, height: "26%", background: "rgba(26,22,18,0.85)" }}
        >
          <div className="flex flex-col items-center gap-2">
            <IconBalloon size={32} color="rgba(245,240,232,0.7)" strokeWidth={1} />
            <span className="font-mono text-xs" style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.58rem" }}>1783</span>
          </div>
          <div style={{ width: "1px", height: "32px", background: "rgba(245,240,232,0.15)" }} />
          <div className="flex flex-col items-center gap-2">
            <IconFlask size={32} color="rgba(245,240,232,0.7)" strokeWidth={1} />
            <span className="font-mono text-xs" style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.58rem" }}>1846</span>
          </div>
          <div style={{ width: "1px", height: "32px", background: "rgba(245,240,232,0.15)" }} />
          <div className="flex flex-col items-center gap-2">
            <IconBarcode size={32} color="rgba(245,240,232,0.7)" />
            <span className="font-mono text-xs" style={{ color: "rgba(245,240,232,0.4)", fontSize: "0.58rem" }}>1974</span>
          </div>
        </div>

        {/* Vertical rule between columns */}
        <div className="absolute top-0 bottom-0 left-0" style={{ width: "1px", background: "rgba(245,240,232,0.12)" }} />
      </div>
    </SlideWrapper>
  );
}

/* ══════════════════════════════════════════
   SLIDE 2 — ПОВІТРЯНА КУЛЯ
══════════════════════════════════════════ */
function Slide2() {
  return (
    <SlideWrapper>
      <TopBar label="Винахід I — Повітроплавання" n={2} />

      {/* ── Large image — bleeds across top 55%, offset right ── */}
      <div
        className="absolute"
        style={{ top: "44px", left: "32%", right: 0, height: "54%", zIndex: 1 }}
      >
        <ArchivalImg
          src={IMG.balloon1}
          alt="Group of people around early observation balloon"
          caption="Спостережна куля біля Іпра, Перша світова війна · Australian War Memorial"
          style={{ width: "100%", height: "100%" }}
          tint="sepia(70%) contrast(1.12) brightness(0.82)"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to left, transparent 50%, var(--ivory) 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 55%, var(--ivory) 100%)" }}
        />
      </div>

      {/* Second balloon image — small inset bottom-right */}
      <div
        className="absolute"
        style={{ bottom: "36px", right: "32px", width: "22%", height: "30%", zIndex: 4, border: "1px solid rgba(26,22,18,0.12)" }}
      >
        <ArchivalImg
          src={IMG.balloon2}
          alt="Vintage hot air balloon in flight"
          caption="Disney Springs, 2019 · Katherine McAdoo"
          style={{ width: "100%", height: "100%" }}
          tint="sepia(80%) contrast(1.1) brightness(0.85)"
        />
      </div>

      {/* ── OVERSIZED YEAR — structural element ── */}
      <div
        className="absolute font-display font-black select-none pointer-events-none"
        style={{
          fontSize: "clamp(7rem, 19vw, 15rem)",
          color: "rgba(124,29,46,0.07)",
          lineHeight: 1,
          top: "30%",
          left: "-1%",
          letterSpacing: "-0.05em",
          zIndex: 0,
        }}
      >
        1783
      </div>

      {/* ── TEXT CONTENT — left column ── */}
      <div
        className="absolute flex flex-col"
        style={{ top: "44px", left: 0, width: "38%", bottom: "36px", zIndex: 5, padding: "28px 28px 24px 36px" }}
      >
        {/* Icon + year */}
        <div className="flex items-center gap-4 mb-2">
          <IconBalloon size={36} color="var(--burgundy)" strokeWidth={1.1} />
          <div>
            <div
              className="font-display font-black"
              style={{ fontSize: "2.8rem", color: "var(--burgundy)", lineHeight: 1, letterSpacing: "-0.04em" }}
            >
              1783
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--ink-muted)", letterSpacing: "0.07em" }}>
              19 вересня — випробування з тваринами
            </div>
          </div>
        </div>

        {/* Vertical rule + title */}
        <div className="flex gap-3 mt-5 mb-4">
          <div style={{ width: "2px", background: "var(--burgundy)", flexShrink: 0, alignSelf: "stretch" }} />
          <h2
            className="font-display font-bold leading-snug"
            style={{ fontSize: "clamp(1.3rem, 2.6vw, 1.9rem)", color: "var(--ink)", letterSpacing: "-0.02em" }}
          >
            Від випробування до польоту людини
          </h2>
        </div>

        <Rule />

        <p
          className="font-body leading-relaxed mt-4 mb-5"
          style={{ fontSize: "0.83rem", color: "var(--ink-muted)" }}
        >
          Брати{" "}
          <strong style={{ color: "var(--ink)" }}>Жозеф-Мішель</strong> та{" "}
          <strong style={{ color: "var(--ink)" }}>Жак-Етьєнн Монгольф'є</strong>{" "}
          показали, що куля з нагрітим повітрям може безпечно підняти живих
          пасажирів. Це випробування відкрило шлях до польоту людини.
        </p>

        {/* Fact card */}
        <div
          className="relative p-4 mb-4"
          style={{ background: "var(--ink)", borderLeft: "3px solid var(--gold)" }}
        >
          <div className="font-mono text-xs mb-1.5" style={{ color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.6rem" }}>
            Цікавий факт
          </div>
          <p className="font-display italic" style={{ fontSize: "0.95rem", color: "rgba(245,240,232,0.9)", lineHeight: 1.45 }}>
            Першими живими пасажирами стали<br />вівця, качка та півень.
          </p>
        </div>

        {/* Pull quote */}
        <div className="mt-auto">
          <Rule />
          <p className="font-body text-xs mt-3 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            21 листопада Пілатр де Розьє та маркіз д'Арланд здійснили перший
            вільний політ людини на повітряній кулі.
          </p>
        </div>
      </div>

      {/* Vertical divider */}
      <div
        className="absolute"
        style={{ top: "44px", left: "38%", bottom: "36px", width: "1px", background: "rgba(26,22,18,0.1)", zIndex: 6 }}
      />

      <BottomBar left="1783" right="19 вересня: політ тварин · 21 листопада: перший вільний політ людей" />
    </SlideWrapper>
  );
}

/* ══════════════════════════════════════════
   SLIDE 3 — АНЕСТЕЗІЯ
══════════════════════════════════════════ */
function Slide3() {
  return (
    <SlideWrapper>
      <TopBar label="Винахід II — Медицина" n={3} />

      {/* ── FULL-BLEED BG image — toned down, occupies right 60% ── */}
      <div className="absolute inset-0 z-0">
        <ArchivalImg
          src={IMG.surgery1}
          alt="19th century surgical theatre with audience"
          style={{ width: "100%", height: "100%" }}
          tint="sepia(90%) contrast(1.05) brightness(0.6)"
        />
        {/* Strong gradient: right side visible, left side ivory */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, var(--ivory) 42%, rgba(245,240,232,0.7) 58%, rgba(245,240,232,0.15) 80%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(245,240,232,0.2) 0%, transparent 30%, transparent 70%, rgba(26,22,18,0.4) 100%)" }}
        />
      </div>

      {/* Small secondary image — top right, framed */}
      <div
        className="absolute z-10"
        style={{ top: "54px", right: "24px", width: "22%", height: "32%", border: "1px solid rgba(245,240,232,0.25)" }}
      >
        <ArchivalImg
          src={IMG.surgery2}
          alt="Group of 19th century doctors"
          caption="King George Military Hospital, бл. 1915 · NLM"
          style={{ width: "100%", height: "100%" }}
          tint="sepia(85%) contrast(1.1) brightness(0.72)"
        />
      </div>

      {/* ── TEXT — left pane ── */}
      <div
        className="absolute flex flex-col"
        style={{ top: "44px", left: 0, width: "46%", bottom: "36px", zIndex: 5, padding: "24px 24px 20px 36px" }}
      >
        {/* Icon + year lockup */}
        <div className="flex items-end gap-4 mb-2">
          <IconFlask size={38} color="var(--burgundy)" strokeWidth={1.1} />
          <div>
            <div
              className="font-display font-black"
              style={{ fontSize: "3.2rem", color: "var(--burgundy)", lineHeight: 1, letterSpacing: "-0.04em" }}
            >
              1846
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--ink-muted)", letterSpacing: "0.07em" }}>
              16 жовтня — Бостон, США
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 mb-4">
          <div style={{ width: "2px", background: "var(--burgundy)", flexShrink: 0, alignSelf: "stretch" }} />
          <h2
            className="font-display font-bold leading-snug"
            style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.85rem)", color: "var(--ink)", letterSpacing: "-0.02em" }}
          >
            Операція без болю
          </h2>
        </div>

        <Rule />

        {/* Before / context */}
        <p
          className="font-body leading-relaxed mt-4 mb-4"
          style={{ fontSize: "0.83rem", color: "var(--ink-muted)" }}
        >
          До появи надійного загального знеболення біль різко обмежував
          складність і тривалість операцій. Швидкість хірурга часто мала
          вирішальне значення.
        </p>

        {/* Key event card */}
        <div
          className="p-4 mb-4"
          style={{ background: "var(--ink)" }}
        >
          <div
            className="font-mono text-xs mb-2"
            style={{ color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.6rem" }}
          >
            Ключова подія
          </div>
          <p className="font-body leading-relaxed" style={{ fontSize: "0.82rem", color: "rgba(245,240,232,0.88)" }}>
            <strong style={{ color: "white" }}>Вільям Т. Г. Мортон</strong> подав
            ефір пацієнтові Едварду Ебботту, а хірург{" "}
            <strong style={{ color: "white" }}>Джон Коллінз Воррен</strong> видалив
            пухлину шиї перед лікарями та студентами.
          </p>
        </div>

        {/* Before / After horizontal */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 p-3" style={{ border: "1px solid rgba(26,22,18,0.12)" }}>
            <div className="font-mono text-xs mb-1" style={{ color: "var(--burgundy)", fontSize: "0.6rem", textTransform: "uppercase" }}>До 1846</div>
            <p className="font-body text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              Надійного контролю болю зазвичай не було.
            </p>
          </div>
          <div className="flex-1 p-3" style={{ background: "rgba(124,29,46,0.06)", border: "1px solid rgba(124,29,46,0.2)" }}>
            <div className="font-mono text-xs mb-1" style={{ color: "var(--burgundy)", fontSize: "0.6rem", textTransform: "uppercase" }}>Після 1846</div>
            <p className="font-body text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              Операції могли тривати довше й бути точнішими.
            </p>
          </div>
        </div>

        <Rule />
        <p className="font-display italic mt-3" style={{ fontSize: "0.95rem", color: "var(--ink)" }}>
          Анестезія усунула біль, але безпека також вимагала антисептики.
        </p>
      </div>

      {/* Oversized year watermark — right side */}
      <div
        className="absolute font-display font-black select-none pointer-events-none"
        style={{
          fontSize: "clamp(6rem, 15vw, 12rem)",
          color: "rgba(245,240,232,0.18)",
          lineHeight: 1,
          bottom: "10%",
          right: "2%",
          letterSpacing: "-0.05em",
          zIndex: 8,
        }}
      >
        1846
      </div>

      {/* Caption at bottom of image area */}
      <div
        className="absolute z-10 font-mono"
        style={{ bottom: "46px", right: "24px", fontSize: "0.6rem", color: "rgba(245,240,232,0.45)", letterSpacing: "0.06em" }}
      >
        Austrian National Library · резервний госпіталь у Відні, бл. 1943
      </div>

      <BottomBar left="1846" right="Вільям Т. Г. Мортон · Джон Коллінз Воррен · Massachusetts General Hospital" />
    </SlideWrapper>
  );
}

/* ══════════════════════════════════════════
   SLIDE 4 — ШТРИХКОД
══════════════════════════════════════════ */
function LargeBarcode() {
  const groups = [
    [3,0],[1,0],[1,1],[2,0],[1,1],[1,0],[2,1],[3,0],[1,1],[2,0],[1,1],[1,0],
    [3,1],[2,0],[1,1],[2,0],[1,1],[3,0],[1,1],[2,0],[1,1],[4,0],[1,1],[2,0],
    [1,1],[3,0],[2,1],[1,0],[3,1],[1,0],[2,1],[1,0],[3,1],[2,0],
  ];
  let x = 0;
  const items: { x: number; w: number; filled: boolean }[] = [];
  groups.forEach(([w, filled]) => {
    items.push({ x, w, filled: filled === 0 });
    x += w;
  });
  const total = x;
  return (
    <svg viewBox={`0 0 ${total} 100`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      {items.map((item, i) =>
        item.filled ? (
          <rect key={i} x={item.x} y="0" width={item.w} height="100" fill="var(--ink)" />
        ) : null
      )}
    </svg>
  );
}

function Slide4() {
  return (
    <SlideWrapper>
      <TopBar label="Винахід III — Автоматизація" n={4} />

      {/* ── RIGHT 35%: barcode-dominant panel ── */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col"
        style={{ width: "35%", borderLeft: "1px solid rgba(26,22,18,0.1)", zIndex: 2, background: "var(--ivory)" }}
      >
        {/* Top: image */}
        <div className="relative flex-1 overflow-hidden">
          <ArchivalImg
            src={IMG.grocery1}
            alt="Vintage grayscale grocery store"
            caption="First National Stores, 1952 · Boston Public Library"
            style={{ width: "100%", height: "100%" }}
            tint="sepia(75%) contrast(1.1) brightness(0.78)"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 60%, var(--ivory) 100%)" }}
          />
        </div>

        {/* Bottom: large barcode graphic */}
        <div className="flex flex-col items-center px-6 pb-10 pt-4" style={{ flexShrink: 0 }}>
          <div style={{ width: "100%", height: "64px" }}>
            <LargeBarcode />
          </div>
          <div className="font-mono mt-2" style={{ fontSize: "0.62rem", color: "var(--ink-muted)", letterSpacing: "0.15em" }}>
            0  36000  29145  2
          </div>
          <div
            className="font-mono mt-3 text-center px-3 py-1.5"
            style={{ fontSize: "0.62rem", color: "white", background: "var(--burgundy)", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            Wrigley's Juicy Fruit — перший товар
          </div>
        </div>

        {/* Second image — small */}
        <div
          className="absolute"
          style={{ top: "44px", left: "12px", width: "42%", height: "28%", border: "1px solid rgba(26,22,18,0.12)", zIndex: 3 }}
        >
          <ArchivalImg
            src={IMG.grocery2}
            alt="Vintage couple in grocery store"
            caption="Berg's Supermarket, бл. 1950 · Oregon State"
            style={{ width: "100%", height: "100%" }}
            tint="sepia(80%) contrast(1.1) brightness(0.8)"
          />
        </div>
      </div>

      {/* ── LEFT/CENTER: text content ── */}
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col"
        style={{ width: "65%", zIndex: 3, padding: "54px 36px 46px 36px" }}
      >
        {/* Year + Icon lockup */}
        <div className="flex items-end gap-4 mb-2">
          <IconBarcode size={38} color="var(--burgundy)" />
          <div>
            <div
              className="font-display font-black"
              style={{ fontSize: "3.4rem", color: "var(--burgundy)", lineHeight: 1, letterSpacing: "-0.04em" }}
            >
              1974
            </div>
            <div className="font-mono text-xs" style={{ color: "var(--ink-muted)", letterSpacing: "0.07em" }}>
              26 червня — Трой, Огайо, США
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 mb-4">
          <div style={{ width: "2px", background: "var(--burgundy)", flexShrink: 0, alignSelf: "stretch" }} />
          <h2
            className="font-display font-bold leading-snug"
            style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.85rem)", color: "var(--ink)", letterSpacing: "-0.02em" }}
          >
            Винахід, який бачить машина
          </h2>
        </div>

        <Rule />

        <p
          className="font-body leading-relaxed mt-4 mb-5"
          style={{ fontSize: "0.83rem", color: "var(--ink-muted)", maxWidth: "480px" }}
        >
          <strong style={{ color: "var(--ink)" }}>Норман Джозеф Вудленд</strong> та{" "}
          <strong style={{ color: "var(--ink)" }}>Бернард Сілвер</strong> отримали
          патент на оптично зчитуваний код у 1952 році. Команда IBM під керівництвом{" "}
          <strong style={{ color: "var(--ink)" }}>Джорджа Лорера</strong> згодом
          створила прямокутний символ UPC, прийнятий у 1973 році.
        </p>

        {/* Highlight card */}
        <div
          className="relative p-4 mb-6"
          style={{ background: "var(--ink)", maxWidth: "480px", borderLeft: "3px solid var(--gold)" }}
        >
          <div className="font-mono text-xs mb-2" style={{ color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.6rem" }}>
            Перше сканування в історії
          </div>
          <p className="font-body text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.88)" }}>
            Першим товаром за UPC-кодом стала{" "}
            <strong style={{ color: "white" }}>жувальна гумка Wrigley's Juicy Fruit</strong>.
            Касир супермаркету Marsh, Трой, Огайо.
          </p>
        </div>

        {/* Timeline */}
        <div className="flex items-start gap-0 mb-4" style={{ maxWidth: "460px" }}>
          {[
            { yr: "1952", label: "Патент\nВудленда і Сілвера" },
            { yr: "1973", label: "Дизайн Лорера\nприйнято як UPC" },
            { yr: "1974", label: "Перше\nсканування" },
          ].map((item, i) => (
            <div key={item.yr} className="flex items-start" style={{ flex: 1 }}>
              <div className="flex flex-col" style={{ flex: 1 }}>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: i === 2 ? "var(--burgundy)" : "rgba(26,22,18,0.25)",
                      flexShrink: 0,
                    }}
                  />
                  {i < 2 && <div style={{ flex: 1, height: "1px", background: "rgba(26,22,18,0.15)" }} />}
                </div>
                <div
                  className="font-display font-bold mt-1"
                  style={{ fontSize: "1.1rem", color: i === 2 ? "var(--burgundy)" : "var(--ink)", letterSpacing: "-0.02em" }}
                >
                  {item.yr}
                </div>
                <div
                  className="font-mono mt-0.5"
                  style={{ fontSize: "0.62rem", color: "var(--ink-muted)", lineHeight: 1.5, whiteSpace: "pre-line" }}
                >
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Rule />
        <p className="font-display italic mt-3" style={{ fontSize: "0.95rem", color: "var(--ink)" }}>
          "Один сигнал — і машина знає, що це за товар."
        </p>
      </div>

      {/* Oversized year watermark */}
      <div
        className="absolute font-display font-black select-none pointer-events-none"
        style={{
          fontSize: "clamp(6rem, 14vw, 11rem)",
          color: "rgba(124,29,46,0.05)",
          lineHeight: 1,
          bottom: "6%",
          left: "3%",
          letterSpacing: "-0.05em",
          zIndex: 0,
        }}
      >
        1974
      </div>

      <BottomBar left="1974" right="Вудленд · Сілвер · Джордж Лорер · Трой, Огайо" />
    </SlideWrapper>
  );
}

/* ══════════════════════════════════════════
   SLIDE 5 — ВИСНОВОК  (redesigned)
══════════════════════════════════════════ */

/* Horizontal track: неможливо ────► буденність */
function StatusTrack({ from, to, pct }: { from: string; to: string; pct: number }) {
  return (
    <div className="flex flex-col gap-1" style={{ minWidth: "160px" }}>
      <div className="relative" style={{ height: "4px", background: "rgba(26,22,18,0.1)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "var(--burgundy)", transition: "width 0.6s" }} />
        {/* End dot */}
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: "8px", height: "8px", borderRadius: "50%", background: "var(--burgundy)", border: "2px solid var(--ivory)" }} />
      </div>
      <div className="flex justify-between">
        <span className="font-mono" style={{ fontSize: "0.58rem", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>{from}</span>
        <span className="font-mono" style={{ fontSize: "0.58rem", color: "var(--burgundy)", letterSpacing: "0.06em", fontWeight: 500 }}>{to}</span>
      </div>
    </div>
  );
}

const INVENTION_ROWS = [
  {
    year: "1783",
    index: "I",
    icon: (size: number) => <IconBalloon size={size} color="var(--burgundy)" strokeWidth={1.1} />,
    title: "Літати",
    subtitle: "Повітряна куля",
    from: "Фантастика",
    to: "Реальність",
    pct: 100,
    note: "Після польоту тварин у Версалі перший вільний політ людей відбувся 21 листопада 1783 року.",
    img: IMG.balloon2,
  },
  {
    year: "1846",
    index: "II",
    icon: (size: number) => <IconFlask size={size} color="var(--burgundy)" strokeWidth={1.1} />,
    title: "Операція без болю",
    subtitle: "Ефірний наркоз",
    from: "Мрія",
    to: "Стандарт",
    pct: 100,
    note: "Демонстрація ефіру зробила контроль болю відтворюваним; антисептика згодом підвищила безпеку.",
    img: IMG.surgery2,
  },
  {
    year: "1974",
    index: "III",
    icon: (size: number) => <IconBarcode size={size} color="var(--burgundy)" />,
    title: "Розпізнавання товарів",
    subtitle: "Штрихкод UPC",
    from: "Проблема",
    to: "Один сигнал",
    pct: 100,
    note: "Патент Вудленда й Сілвера, дизайн Лорера та галузевий стандарт разом дали початок UPC.",
    img: IMG.grocery3,
  },
];

function Slide5() {
  return (
    <SlideWrapper>
      <TopBar label="Висновок" n={5} />

      {/* ── Layout: left accent strip + right main ── */}

      {/* Left burgundy accent strip */}
      <div
        className="absolute top-0 bottom-0 left-0 flex flex-col items-center justify-center"
        style={{ width: "52px", background: "var(--burgundy)", zIndex: 4 }}
      >
        <span
          className="font-mono text-white select-none"
          style={{
            fontSize: "0.55rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            opacity: 0.7,
          }}
        >
          Висновок · 05
        </span>
      </div>

      {/* Right content */}
      <div
        className="absolute top-0 bottom-0 flex flex-col"
        style={{ left: "52px", right: 0, zIndex: 3 }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-8 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(26,22,18,0.1)" }}
        >
          <div>
            <div className="font-mono text-xs mb-1 flex items-center gap-2" style={{ color: "var(--burgundy)", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.6rem" }}>
              <div style={{ width: "18px", height: "1.5px", background: "var(--burgundy)" }} />
              Три революції — один висновок
            </div>
            <h2
              className="font-display font-bold leading-none"
              style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)", color: "var(--ink)", letterSpacing: "-0.025em" }}
            >
              Від{" "}
              <em style={{ color: "rgba(26,22,18,0.35)", fontStyle: "italic" }}>неможливого</em>
              {" "}—{" "}
              <em style={{ color: "var(--burgundy)" }}>до буденного</em>
            </h2>
          </div>

          {/* Sequence indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {["I", "II", "III"].map((n, i) => (
              <div key={n} className="flex items-center gap-1.5">
                <div
                  className="flex items-center justify-center font-mono"
                  style={{
                    width: "22px", height: "22px",
                    background: "var(--ink)",
                    color: "var(--ivory)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {n}
                </div>
                {i < 2 && (
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 4h9M7 1l3 3-3 3" stroke="rgba(26,22,18,0.25)" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invention rows */}
        <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
          {INVENTION_ROWS.map((inv, i) => (
            <div
              key={inv.year}
              className="flex items-stretch flex-1"
              style={{
                borderBottom: i < 2 ? "1px solid rgba(26,22,18,0.08)" : "none",
                background: i === 1 ? "rgba(26,22,18,0.022)" : "transparent",
              }}
            >
              {/* Year column */}
              <div
                className="flex flex-col items-center justify-center flex-shrink-0 px-4"
                style={{ width: "88px", borderRight: "1px solid rgba(26,22,18,0.08)" }}
              >
                <div
                  className="font-display font-black"
                  style={{ fontSize: "1.55rem", color: "var(--burgundy)", lineHeight: 1, letterSpacing: "-0.04em" }}
                >
                  {inv.year}
                </div>
                <div className="font-mono mt-1" style={{ fontSize: "0.55rem", color: "rgba(26,22,18,0.3)", letterSpacing: "0.08em" }}>
                  {inv.index}
                </div>
              </div>

              {/* Icon + title */}
              <div
                className="flex items-center gap-4 px-6 flex-shrink-0"
                style={{ width: "240px", borderRight: "1px solid rgba(26,22,18,0.08)" }}
              >
                <div style={{ flexShrink: 0 }}>{inv.icon(32)}</div>
                <div>
                  <div
                    className="font-display font-bold leading-tight"
                    style={{ fontSize: "0.95rem", color: "var(--ink)", letterSpacing: "-0.01em" }}
                  >
                    {inv.title}
                  </div>
                  <div className="font-mono mt-0.5" style={{ fontSize: "0.6rem", color: "var(--ink-muted)", letterSpacing: "0.06em" }}>
                    {inv.subtitle}
                  </div>
                </div>
              </div>

              {/* Status track + note */}
              <div className="flex flex-col justify-center px-6 flex-1 gap-2">
                <StatusTrack from={inv.from} to={inv.to} pct={inv.pct} />
                <p className="font-body leading-relaxed" style={{ fontSize: "0.75rem", color: "var(--ink-muted)", maxWidth: "340px" }}>
                  {inv.note}
                </p>
              </div>

              {/* Archival thumbnail */}
              <div
                className="flex-shrink-0 relative overflow-hidden"
                style={{ width: "110px", borderLeft: "1px solid rgba(26,22,18,0.08)" }}
              >
                <img
                  src={inv.img}
                  alt={inv.subtitle}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "sepia(75%) contrast(1.05) brightness(0.82)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, var(--ivory) 0%, transparent 35%)" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Final quote bar — full width dark */}
        <div
          className="flex items-center gap-6 flex-shrink-0"
          style={{ background: "var(--ink)", padding: "13px 28px", borderTop: "2px solid var(--burgundy)" }}
        >
          {/* Mini barcode decoration */}
          <div className="flex gap-px flex-shrink-0" style={{ height: "28px", alignItems: "stretch" }}>
            {[2,1,3,1,2,2,1,3,1,2,1,3,2,1].map((w, i) => (
              <div key={i} style={{ width: `${w * 2}px`, background: i % 2 === 0 ? (i % 6 === 0 ? "var(--gold)" : "rgba(245,240,232,0.25)") : "transparent" }} />
            ))}
          </div>

          <p
            className="font-display italic"
            style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)", color: "rgba(245,240,232,0.92)", lineHeight: 1.4, flex: 1, fontWeight: 600 }}
          >
            "Найдивовижніші винаходи — ті, які з часом перестають нас дивувати."
          </p>

          <div className="flex gap-4 flex-shrink-0 items-center">
            <IconBalloon size={22} color="rgba(245,240,232,0.3)" strokeWidth={1} />
            <IconFlask size={22} color="rgba(245,240,232,0.3)" strokeWidth={1} />
            <IconBarcode size={22} color="rgba(245,240,232,0.3)" />
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}

/* ══════════════════════════════════════════
   SLIDE 6 — ACADEMIC BIBLIOGRAPHY
══════════════════════════════════════════ */
const ACADEMIC_SOURCES = [
  {
    author: "Château de Versailles",
    title: "The first hot air balloon flight: 19 September 1783",
    href: "https://en.chateauversailles.fr/discover/history/key-dates/first-hot-air-balloon-flight",
  },
  {
    author: "Smithsonian National Air and Space Museum",
    title: "Montgolfier's Balloon in the Presence of the King and Queen",
    href: "https://airandspace.si.edu/collection-objects/montgolfiers-balloon-presence-king-and-queen/nasm_A19780297000",
  },
  {
    author: "Massachusetts General Hospital",
    title: "Our history and timeline: First demonstration of ether",
    href: "https://www.massgeneral.org/omfs/about/history",
  },
  {
    author: "Royal College of Anaesthetists",
    title: "The history of anaesthesia",
    href: "https://www.rcoa.ac.uk/about-us/heritage/history-anaesthesia",
  },
  {
    author: "U.S. National Library of Medicine",
    title: "Cesarean section: A brief history, Part 2",
    href: "https://www.nlm.nih.gov/exhibition/cesarean/part2.html",
  },
  {
    author: "Smithsonian National Museum of American History",
    title: "Supermarket scanner",
    href: "https://www.si.edu/object/supermarket-scanner%3Anmah_892778",
  },
  {
    author: "IBM",
    title: "The UPC",
    href: "https://www.ibm.com/history/upc",
  },
  {
    author: "GS1",
    title: "GS1 historical timeline",
    href: "https://support.gs1.org/support/solutions/articles/43000734073-gs1-historical-timeline",
  },
];

const IMAGE_REFERENCES = [
  { author: "Australian War Memorial", detail: "Observation balloon near Ypres, First World War", year: "archival", href: "https://unsplash.com/photos/a-group-of-people-standing-around-a-large-balloon-BQAs5-LmxQs" },
  { author: "Logan Weaver", detail: "People riding in a hot-air balloon", year: "2020", href: "https://unsplash.com/photos/people-riding-hot-air-balloon-during-daytime-5eBJ6iYb1wI" },
  { author: "Katherine McAdoo", detail: "Hot-air balloon at Disney Springs", year: "2019", href: "https://unsplash.com/photos/brown-and-beige-hot-air-ballooning-during-daytime-BNcQN5uParI" },
  { author: "Austrian National Library", detail: "Reserve hospital operating theatre, Vienna", year: "c. 1943", href: "https://unsplash.com/photos/photography-of-people-watching-watching-operation-inside-room-ciMJn3mD5u8" },
  { author: "National Library of Medicine", detail: "King George Military Hospital operating theatre", year: "c. 1915", href: "https://unsplash.com/photos/a-black-and-white-photo-of-a-group-of-doctors-lEfWLtE8tx4" },
  { author: "Boston Public Library", detail: "First National Stores supermarket", year: "1952", href: "https://unsplash.com/photos/grayscale-photo-of-people-in-store-m_xp6NAUJ_4" },
  { author: "Oregon State University Collections", detail: "Berg's Supermarket", year: "c. 1950", href: "https://unsplash.com/photos/couple-shops-for-meat-in-a-grocery-store-Rhq7Ge04SrM" },
  { author: "Gabe Pierce", detail: "Woman shopping in a grocery store", year: "2021", href: "https://unsplash.com/photos/a-black-and-white-photo-of-a-woman-shopping-in-a-grocery-store-eNa_IA4HfZI" },
];

function ReferenceItem({ index, author, title, href }: { index: number; author: string; title: string; href: string }) {
  const host = new URL(href).hostname.replace("www.", "");
  return (
    <div className="reference-item">
      <span className="reference-number">{String(index).padStart(2, "0")}</span>
      <div>
        <p className="reference-copy">
          <strong>{author}.</strong> (n.d.). <em>{title}.</em>
        </p>
        <a className="reference-link" href={href} target="_blank" rel="noreferrer">{host} ↗</a>
      </div>
    </div>
  );
}

function Slide6() {
  return (
    <SlideWrapper className="bibliography-slide">
      <TopBar label="Бібліографія та авторство" n={6} />

      <div className="absolute" style={{ top: "44px", left: 0, right: 0, bottom: "36px", padding: "22px 36px 18px", zIndex: 3 }}>
        <div className="flex items-end justify-between" style={{ paddingBottom: "15px", borderBottom: "1px solid rgba(26,22,18,0.13)" }}>
          <div>
            <div className="font-mono" style={{ color: "var(--burgundy)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "5px" }}>
              Перевірені джерела · APA-style
            </div>
            <h2 className="font-display font-bold" style={{ color: "var(--ink)", fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.03em" }}>
              Академічна бібліографія
            </h2>
          </div>
          <p className="font-body text-right" style={{ color: "var(--ink-muted)", fontSize: "0.68rem", lineHeight: 1.5, maxWidth: "330px" }}>
            Факти звірено з музейними, медичними та галузевими першоджерелами.
            Назви матеріалів відкривають оригінальні сторінки.
          </p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1.08fr 0.92fr", height: "calc(100% - 70px)" }}>
          <section style={{ padding: "16px 28px 0 0", borderRight: "1px solid rgba(26,22,18,0.1)" }}>
            <h3 className="bibliography-heading">Історичні та наукові джерела</h3>
            <div className="reference-list">
              {ACADEMIC_SOURCES.map((source, index) => (
                <ReferenceItem key={source.href} index={index + 1} {...source} />
              ))}
            </div>
          </section>

          <section style={{ padding: "16px 0 0 28px" }}>
            <h3 className="bibliography-heading">Зображення та авторство</h3>
            <div className="image-reference-list">
              {IMAGE_REFERENCES.map((source, index) => (
                <a key={source.href} className="image-reference" href={source.href} target="_blank" rel="noreferrer">
                  <span className="image-reference-index">P{index + 1}</span>
                  <span>
                    <strong>{source.author}</strong>
                    <span>{source.detail}, {source.year}. Unsplash ↗</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>

      <BottomBar left="2026" right="Доступ до вебджерел: 7 вересня 2026 · Навчальне використання" />
    </SlideWrapper>
  );
}

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
function NavBtn({ onClick, disabled, children, label }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; label: string }) {
  return (
    <button
      className="nav-arrow"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: "44px", height: "44px",
        background: disabled ? "transparent" : "var(--ivory)",
        border: `1px solid ${disabled ? "rgba(245,240,232,0.15)" : "rgba(245,240,232,0.35)"}`,
        color: disabled ? "rgba(245,240,232,0.2)" : "var(--ivory)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit", fontSize: "1rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      <span style={{ color: disabled ? "rgba(245,240,232,0.2)" : "var(--ink)" }}>{children}</span>
    </button>
  );
}

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6];
const SLIDE_LABELS = ["Обкладинка", "Повітряна куля", "Анестезія", "Штрихкод", "Висновок", "Бібліографія"];

export default function App() {
  const [current, setCurrent] = useState(0);
  const [key, setKey] = useState(0);
  const [stageScale, setStageScale] = useState(1);
  const [orientationNoticeDismissed, setOrientationNoticeDismissed] = useState(false);
  const stageRegionRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const goTo = useCallback((i: number) => {
    if (i < 0 || i >= TOTAL_SLIDES) return;
    setCurrent(i);
    setKey((k) => k + 1);
  }, []);

  const Slide = SLIDES[current];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goTo(current - 1);
      if (event.key === "ArrowRight") goTo(current + 1);
      if (event.key === "Home") goTo(0);
      if (event.key === "End") goTo(TOTAL_SLIDES - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, goTo]);

  useLayoutEffect(() => {
    const region = stageRegionRef.current;
    if (!region) return;

    const measure = () => {
      const nextScale = Math.min(region.clientWidth / 1280, region.clientHeight / 720, 1);
      setStageScale(Math.max(nextScale, 0.1));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    goTo(deltaX < 0 ? current + 1 : current - 1);
  };

  return (
    <main className="presentation-app">
      <aside
        className={`orientation-gate${orientationNoticeDismissed ? " orientation-gate--dismissed" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Порада щодо орієнтації екрана"
      >
        <div className="orientation-card">
          <div className="orientation-symbol" aria-hidden="true">
            <svg viewBox="0 0 96 72" role="img">
              <rect x="34" y="12" width="30" height="50" rx="5" />
              <path d="M22 42c-4-17 7-33 24-38" />
              <path d="m39 3 8 1-4 7" />
            </svg>
          </div>
          <span className="orientation-kicker">Презентація · формат 16:9</span>
          <h2>Поверніть телефон горизонтально</h2>
          <p>
            Так слайди, підписи й академічні джерела відображатимуться у правильному масштабі.
          </p>
          <button type="button" onClick={() => setOrientationNoticeDismissed(true)}>
            Продовжити вертикально
          </button>
        </div>
      </aside>

      <header className="deck-header">
        <div className="deck-identity">
          <img src="./favicon.png" alt="" />
          <div>
            <span>Академічна презентація · 2026</span>
            <strong>Три винаходи, які шокували людство</strong>
          </div>
        </div>
        <div className="deck-progress" aria-label={`Слайд ${current + 1} із ${TOTAL_SLIDES}`}>
          <span>{String(current + 1).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}</span>
          <div aria-hidden="true">
            <i style={{ width: `${((current + 1) / TOTAL_SLIDES) * 100}%` }} />
          </div>
        </div>
      </header>

      <div className="presentation-workspace">
        <div
          ref={stageRegionRef}
          className="presentation-stage-region"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="presentation-stage-frame"
            style={{ width: `${1280 * stageScale}px`, height: `${720 * stageScale}px` }}
          >
            <div
              className="presentation-stage"
              style={{ transform: `scale(${stageScale})` }}
              role="group"
              aria-roledescription="слайд"
              aria-label={`${current + 1} з ${TOTAL_SLIDES}: ${SLIDE_LABELS[current]}`}
            >
              <div key={key} className="w-full h-full">
                <Slide />
              </div>
            </div>
          </div>
        </div>

        <nav className="presentation-controls flex items-center gap-3" aria-label="Навігація презентацією">
          <NavBtn onClick={() => goTo(current - 1)} disabled={current === 0} label="Попередній слайд">←</NavBtn>

          <div className="flex items-center slide-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className="slide-dot"
                onClick={() => goTo(i)}
                title={SLIDE_LABELS[i]}
                aria-label={`Перейти до слайда ${i + 1}: ${SLIDE_LABELS[i]}`}
                aria-current={i === current ? "page" : undefined}
              >
                <span className={i === current ? "active" : ""} />
              </button>
            ))}
          </div>

          <NavBtn onClick={() => goTo(current + 1)} disabled={current === TOTAL_SLIDES - 1} label="Наступний слайд">→</NavBtn>

          <span className="current-slide-label">
            {SLIDE_LABELS[current]}
          </span>

          <button className="bibliography-jump" onClick={() => goTo(TOTAL_SLIDES - 1)}>
            Джерела
          </button>
        </nav>
      </div>

      <footer className="site-credit">
        <span>← → для навігації · свайп на сенсорному екрані</span>
        <span>developed by Revasevych Stanislav ©2026</span>
      </footer>
    </main>
  );
}
