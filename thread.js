/* ═══════════════════════════════════════════════════════════════════
   CONTINUE AI — "THE THREAD"
   One rAF scroll engine drives the pinned film (S2). Scroll position IS
   the timeline: every frame maps window.scrollY → p ∈ [0,1] → act states.
   All motion is transform/opacity. Honors prefers-reduced-motion by
   showing the static storyboard instead. Vanilla, no dependencies.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var d = document, W = window;
  var reduce = W.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobileMQ = W.matchMedia ? matchMedia("(max-width: 760px)") : { matches: false };
  var byId = function (id) { return d.getElementById(id); };
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var seg = function (p, a, b) { return clamp01((p - a) / (b - a)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };
  // write-if-changed: keeps per-frame text updates from forcing layout work
  var setText = function (el, v) { if (el.__t !== v) { el.__t = v; el.textContent = v; } };

  /* ── the sample session (SAMPLE data — every counter on the page is
     derived from this array, so the site never claims numbers it isn't
     actually showing) ── */
  var CONVO = [
    { role: "user", text: "I'm building a browser extension that moves AI conversations between models. Help me plan the launch." },
    { role: "ai",   text: "Good problem — context gets trapped. Start with the users who feel it daily: people running long coding and research threads who hit limits mid-flow." },
    { role: "user", text: "Name ideas? The working title is ChatMover." },
    { role: "ai",   text: "Threadline. Handoff. Carryover. Continue AI. The last one says exactly what happens next, which is the whole promise." },
    { role: "user", text: "Continue AI it is — lock it.", kind: "decision" },
    { role: "ai",   text: "Locked. Next: the landing page should demonstrate a transfer instead of describing one. Show the thread physically moving." },
    { role: "user", text: "Write the tagline." },
    { role: "ai",   text: "“Switch the model. Keep the thread.” Direct, and it names the fear: losing everything you built.", kind: "decision" },
    { role: "user", text: "Should it even be paid at launch?" },
    { role: "ai",   text: "Free. A utility this early earns trust before it earns money — and local-first means there's nothing to meter anyway.", kind: "decision" },
    { role: "user", text: "Give me the capture manifest schema." },
    { role: "ai",   text: "{ source: \"chatgpt\", captured_at: ts,\n  messages: [...], code_blocks: [...],\n  order: \"chronological\", integrity: 1.0 }", kind: "code" },
    { role: "user", text: "And the capture loop for virtualized threads?" },
    { role: "ai",   text: "async function captureThread() {\n  const seen = new Map();\n  while (hasMore()) {\n    await scrollBack();\n    collect(seen);\n  }\n  return order(seen);\n}", kind: "code" },
    { role: "user", text: "What breaks when a chat is 400 messages long?" },
    { role: "ai",   text: "DOM virtualization — the page unmounts old turns as you scroll. Capture has to walk the history, not the viewport, and flag anything it can't reach instead of dropping it silently." },
    { role: "user", text: "Okay. Draft the Chrome Web Store description." },
    { role: "ai",   text: "“Continue any AI chat on another model in one click — capture the thread, carry the context, keep going.” Want variants?" }
  ];
  var NEXT_LINE = "Tighten that description to fit the 132-character store limit.";
  var N = CONVO.length;
  var N_CODE = CONVO.filter(function (m) { return m.kind === "code"; }).length;
  var N_DEC  = CONVO.filter(function (m) { return m.kind === "decision"; }).length;

  function msgNode(m, i) {
    var el = d.createElement("div");
    el.className = "msg " + (m.role === "user" ? "user" : "ai") + (m.kind === "code" ? " code" : "");
    var who = d.createElement("span"); who.className = "m-who";
    who.textContent = (m.role === "user" ? "YOU" : "CHATGPT") + " · " + String(i + 1).padStart(2, "0");
    var tx = d.createElement("span"); tx.className = "m-tx"; tx.textContent = m.text;
    var tag = d.createElement("span"); tag.className = "m-tag";
    tag.textContent = m.kind === "code" ? "CODE" : m.kind === "decision" ? "DECISION" : m.role === "user" ? "USER" : "ASSISTANT";
    el.appendChild(who); el.appendChild(tx); el.appendChild(tag);
    return el;
  }

  /* ═══ progress rail + mini CTA ═══ */
  var progressBar = byId("progressBar");
  var miniCta = null;
  (function () {
    var a = d.createElement("a");
    a.className = "mini-cta"; a.href = "https://chromewebstore.google.com/detail/continue-ai-%E2%80%94-move-your-a/cojmibmimpeakmgllhpolgbjienedfkf";
    a.target = "_blank"; a.rel = "noopener"; a.textContent = "ADD TO CHROME ↗";
    d.body.appendChild(a); miniCta = a;
  })();

  /* ═══ THE FILM ═══ */
  var film = null;
  if (!reduce && byId("film")) film = initFilm();

  function initFilm() {
    d.documentElement.classList.add("film-on");   // normally already set pre-paint in <head>
    var wrap = d.querySelector(".journey"), stage = byId("stage");
    var F = {
      wrap: wrap, stage: stage,
      ink: byId("inkLayer"), thread: byId("stageThread"),
      beats: [].slice.call(byId("beats").children),
      chA: byId("chamberA"), chScroll: byId("chScroll"), chAMeta: byId("chAMeta"),
      compose: byId("chCompose"), composeText: byId("chComposeText"),
      needle: byId("needle"),
      ctMsgs: byId("ctMsgs"), ctPct: byId("ctPct"), ctMeter: byId("ctMeter"),
      stampLimit: byId("stampLimit"), extPill: byId("extPill"),
      man: byId("manifestCap"), mcMsgs: byId("mcMsgs"), mcCode: byId("mcCode"),
      mcDec: byId("mcDec"), mcOrder: byId("mcOrder"), mcInt: byId("mcInt"),
      capsule: byId("capsule"), waybill: byId("capWaybill"),
      board: byId("board"), boardRows: [].slice.call(byId("boardList").children),
      chB: byId("chamberB"), chRebuild: byId("chRebuild"),
      typeLine: byId("chTypeLine"), stampGo: byId("stampGo"),
      beatClock: byId("beatClock"),
      msgsA: [], msgsB: [], geo: null
    };
    CONVO.forEach(function (m, i) { F.msgsA.push(F.chScroll.appendChild(msgNode(m, i))); });
    CONVO.forEach(function (m, i) {
      var n = msgNode(m, i); n.querySelector(".m-who").textContent = (m.role === "user" ? "YOU" : "CONTEXT") + " · " + String(i + 1).padStart(2, "0");
      F.msgsB.push(F.chRebuild.appendChild(n));
    });
    F.mcMsgs.textContent = "0/" + N;
    ["chA", "chB", "capsule", "chScroll", "chRebuild"].forEach(function (k) { F[k].style.willChange = "transform, opacity"; });
    F.ink.style.willChange = "opacity";
    return F;
  }

  function measureGeo() {
    if (!film) return;
    var F = film, mob = mobileMQ.matches;
    var baseA = mob ? "translateX(-50%)" : "translateY(-50%)";
    var offB  = mob ? "translateX(-50%) translateY(120%)" : "translateY(-50%) translateX(120%)";
    var onB   = mob ? "translateX(-50%)" : "translateY(-50%)";
    F.chA.style.transform = baseA; F.chA.style.opacity = "";
    F.chB.style.transform = onB;
    var sr = F.stage.getBoundingClientRect();
    var ra = F.chA.getBoundingClientRect(), rb = F.chB.getBoundingClientRect();
    var win = F.chA.querySelector(".ch-window").getBoundingClientRect();
    F.geo = {
      mob: mob, baseA: baseA, offB: offB, onB: onB,
      sw: sr.width, sh: sr.height,
      ax: ra.left - sr.left + ra.width / 2,  ay: ra.top - sr.top + ra.height / 2,
      bx: rb.left - sr.left + rb.width / 2,  by: rb.top - sr.top + rb.height / 2,
      // hover point for the crossing: centered channel on wide screens; on
      // tighter ones drop below the caption + departures board instead
      hoverX: mob ? sr.width / 2 : W.innerWidth <= 1080 ? sr.width * .5 : sr.width * .40,
      hoverY: mob ? sr.height * .40 : W.innerWidth <= 1080 ? sr.height * .78 : sr.height / 2,
      winH: win.height,
      scrollMax: Math.max(0, F.chScroll.scrollHeight - win.height),
      aBottoms: F.msgsA.map(function (m) { return m.offsetTop + m.offsetHeight; }),
      rebBottoms: F.msgsB.map(function (m) { return m.offsetTop + m.offsetHeight; })
    };
    F.chB.style.transform = offB;
    // route line through the void — blue (source) fading to violet (destination),
    // the same gradient the extension's icon uses for "transfer"
    var grad = mob
      ? '<linearGradient id="routeGrad" gradientUnits="userSpaceOnUse" x1="50" y1="6" x2="50" y2="94"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>'
      : '<linearGradient id="routeGrad" gradientUnits="userSpaceOnUse" x1="6" y1="50" x2="94" y2="50"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>';
    var line = mob
      ? '<line x1="50" y1="6" x2="50" y2="94" stroke="url(#routeGrad)" stroke-width=".45" stroke-dasharray="1.6 2.2" vector-effect="non-scaling-stroke"/>'
      : '<line x1="6" y1="50" x2="94" y2="50" stroke="url(#routeGrad)" stroke-width=".45" stroke-dasharray="1.6 2.2" vector-effect="non-scaling-stroke"/>';
    F.thread.setAttribute("viewBox", "0 0 100 100");
    F.thread.innerHTML = "<defs>" + grad + "</defs>" + line;
  }

  /* per-frame film render — p ∈ [0,1] over the journey scroll */
  var lastP = -1;
  function renderFilm(p) {
    var F = film, G = F.geo;
    if (!G) return;
    if (p === lastP || ((p <= 0 || p >= 1) && p === clamp01(lastP) && lastP !== -1 && (lastP <= 0 || lastP >= 1))) { lastP = p; return; }
    lastP = p;

    /* beats: 0 chat · 1 wall · 2 capture · 3 package · 4 void · 5 continue */
    var BE = [0, .18, .30, .46, .58, .80, 1.01];
    for (var i = 0; i < 6; i++) F.beats[i].classList.toggle("on", p >= BE[i] && p < BE[i + 1]);

    /* ink (the void) */
    F.ink.style.opacity = seg(p, .56, .63) - seg(p, .78, .85);
    F.thread.style.opacity = Math.max(0, seg(p, .60, .66) - seg(p, .78, .82));

    /* ── act 1 · the long chat scrolls past ── */
    var t1 = ease(seg(p, 0, .18));
    var capT = seg(p, .30, .42);                      // act 3 rewind sweep
    var y = -G.scrollMax * t1;
    if (capT > 0) y = -G.scrollMax * (1 - ease(capT)); // capture rewinds to the top
    F.chScroll.style.transform = "translateY(" + y + "px)";
    // the counter counts what has actually scrolled into view — never more
    var seen = 1, viewBottom = -y + G.winH;
    while (seen < N && G.aBottoms[seen - 1] <= viewBottom) seen++;
    setText(F.ctMsgs, String(seen).padStart(2, "0"));
    if (F.beatClock) {
      var secs = Math.round(lerp(41 * 60 + 7, 52 * 60 + 19, t1));
      setText(F.beatClock, "T+00:" + Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0"));
    }
    var pct = Math.round(lerp(6, 97, t1)) + Math.round(seg(p, .18, .21) * 3);
    setText(F.ctPct, String(pct).padStart(2, "0") + "%");
    F.ctMeter.style.transform = "scaleX(" + pct / 100 + ")";
    setText(F.chAMeta, "SAMPLE · CONTEXT " + pct + "%");

    /* ── act 2 · the wall (amber warning first, rose at the limit —
       the extension's own status colors) ── */
    var walled = p >= .20 && p < .47;
    F.chA.classList.toggle("warm", !walled && pct >= 72);
    F.chA.classList.toggle("walled", walled);
    F.chA.classList.toggle("hit", p >= .205 && p < .25);
    F.stampLimit.classList.toggle("on", p >= .215 && p < .315);
    setText(F.composeText, walled || p >= .47 ? "You've reached the limit for this conversation." : "Reply to ChatGPT…");
    F.extPill.classList.toggle("on", p >= .26 && p < .50);
    F.extPill.classList.toggle("pressed", p >= .29 && p < .32);

    /* ── act 3 · capture ── */
    var showNeedle = p >= .30 && p < .45;
    F.needle.style.opacity = showNeedle ? 1 : 0;
    if (showNeedle) F.needle.style.transform = "translateY(" + (ease(seg(p, .30, .43)) * (G.winH - 4)) + "px)";
    var tagged = Math.round(capT * N);
    for (var m = 0; m < N; m++) F.msgsA[m].classList.toggle("tagged", p >= .30 && m < tagged);
    F.man.classList.toggle("on", p >= .31 && p < .55);
    var codeSoFar = 0, decSoFar = 0;
    for (var c = 0; c < tagged; c++) {
      if (CONVO[c].kind === "code") codeSoFar++;
      if (CONVO[c].kind === "decision") decSoFar++;
    }
    setText(F.mcMsgs, tagged + "/" + N);
    setText(F.mcCode, String(codeSoFar));
    setText(F.mcDec, String(decSoFar));
    setText(F.mcOrder, capT <= 0 ? "—" : capT < .92 ? "RESOLVING…" : "CHRONOLOGICAL ✓");
    setText(F.mcInt, Math.round(capT * 100) + "%");

    /* ── act 4 · package: chamber compresses into the capsule ── */
    var t4 = ease(seg(p, .46, .545));
    var aScale = lerp(1, .06, t4), aOp = 1 - seg(p, .48, .55);
    F.chA.style.transform = G.baseA + " scale(" + aScale + ")";
    F.chA.style.opacity = String(aOp);

    /* capsule: appears at chamber A's heart, hovers through the void, enters B */
    var born = seg(p, .48, .545), hover = ease(seg(p, .56, .64)), enter = ease(seg(p, .80, .865));
    var cx = lerp(G.ax, G.hoverX, hover), cy = lerp(G.ay, G.hoverY, hover);
    cx = lerp(cx, G.bx, enter); cy = lerp(cy, G.by, enter);
    var die = seg(p, .855, .90);
    var cs = lerp(.5, 1, born) * lerp(1, .2, die);
    F.capsule.style.opacity = String(Math.min(born * 2, 1) * (1 - die));
    F.capsule.style.transform = "translate(" + (cx - G.sw / 2) + "px," + (cy - G.sh / 2) + "px) translate(-50%,-50%) scale(" + cs + ")";
    F.capsule.style.left = "50%"; F.capsule.style.top = "50%";
    F.capsule.classList.toggle("dark", p >= .58 && p < .82);
    F.waybill.classList.toggle("on", p >= .545 && p < .84);

    /* ── act 5 · the void: departures board ── */
    var boardOn = p >= .615 && p < .795;
    F.board.classList.toggle("on", boardOn);
    var lightT = seg(p, .655, .74);
    F.boardRows.forEach(function (row, ri) {
      var isDest = row.getAttribute("data-m") === "claude";
      var settled = lightT > (ri + 1) / 9;
      row.classList.toggle("on", isDest && lightT > .2);
      row.classList.toggle("dim", !isDest && settled);
      setText(row.lastElementChild, isDest && lightT > .2 ? "RECEIVING ▸" : "STANDBY");
    });

    /* ── act 6 · reconstruction ── */
    var tB = ease(seg(p, .79, .86));
    F.chB.style.transform = G.mob
      ? "translateX(-50%) translateY(" + lerp(120, 0, tB) + "%)"
      : "translateY(-50%) translateX(" + lerp(120, 0, tB) + "%)";
    F.chB.style.opacity = String(seg(p, .79, .84));
    var reb = seg(p, .845, .94);
    var shown = Math.round(reb * N);
    for (var r = 0; r < N; r++) F.msgsB[r].classList.toggle("in", r < shown);
    // keep the window pinned to the newest visible message as they pour in
    var tail = shown > 0 ? G.rebBottoms[shown - 1] : 0;
    F.chRebuild.style.transform = "translateY(" + (-Math.max(0, tail - G.winH + 16)) + "px)";
    var typed = Math.round(seg(p, .935, .985) * NEXT_LINE.length);
    setText(F.typeLine, NEXT_LINE.slice(0, typed));
    F.stampGo.classList.toggle("on", p >= .985);
  }

  /* ═══ scroll loop ═══ */
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var sy = W.scrollY || W.pageYOffset;
      var doc = d.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      if (progressBar) progressBar.style.transform = "scaleX(" + (max > 0 ? sy / max : 0) + ")";
      // the floating CTA only appears once the journey is behind you — it must
      // never sit on top of the film's own annotations or the room's controls
      var jr = d.querySelector(".journey");
      var ctaFrom = jr ? jr.offsetTop + jr.offsetHeight - doc.clientHeight * .9 : doc.clientHeight * .85;
      if (miniCta) miniCta.classList.toggle("show", sy > ctaFrom && sy < max - doc.clientHeight * .5);
      if (film && film.geo && d.documentElement.classList.contains("film-on")) {
        var top = film.wrap.offsetTop;
        var span = film.wrap.offsetHeight - film.stage.clientHeight;
        renderFilm(clamp01((sy - top) / Math.max(1, span)));
      }
    });
  }
  var resizeT = 0;
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { measureGeo(); lastP = -1; onScroll(); }, 150);
  });
  W.addEventListener("load", function () { measureGeo(); lastP = -1; onScroll(); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { measureGeo(); lastP = -1; onScroll(); });
  measureGeo(); onScroll();

  /* if the user turns on reduced motion mid-session, degrade to the storyboard */
  try {
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (e) {
      if (e.matches) { reduce = true; d.documentElement.classList.remove("film-on"); }
    });
  } catch (e) {}

  /* ═══ reveal: manifest rows draw their top rule ═══ */
  (function () {
    var rows = [].slice.call(d.querySelectorAll(".crow"));
    if (!rows.length) return;
    if (reduce || !("IntersectionObserver" in W)) { rows.forEach(function (r) { r.classList.add("seen"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); } });
    }, { threshold: .35 });
    rows.forEach(function (r) { io.observe(r); });
  })();

  /* ═══ THE TRANSFER ROOM ═══ */
  (function () {
    var root = byId("transferRoom");
    if (!root) return;
    var thread = byId("rmThread"), go = byId("rmGo"), log = byId("rmLog"),
        out = byId("rmOut"), dstName = byId("rmDstName"), dstDot = byId("rmDstDot"),
        dstMeta = byId("rmDstMeta"), copied = byId("rmCopied"), footNote = byId("rmFootNote");
    var chips = [].slice.call(byId("destBoard").querySelectorAll("button"));
    var DOT = { "Claude": "claude", "ChatGPT": "gpt", "Gemini": "gem", "DeepSeek": "dsk",
                "Perplexity": "ppx", "Copilot": "cpl", "Grok": "grk", "AI Studio": "ais" };
    var dest = "Claude";
    var msgs = CONVO.map(function (m, i) { return thread.appendChild(msgNode(m, i)); });

    function pick(btn, focus) {
      if (running) return;                     // route is locked mid-transfer
      dest = btn.getAttribute("data-dest");
      chips.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("on", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;               // roving tabindex (radio pattern)
      });
      if (focus) btn.focus();
      dstName.textContent = dest;
      dstDot.className = "ch-dot " + DOT[dest];
      dstMeta.textContent = "NEW CHAT";
    }
    chips.forEach(function (b, i) {
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener("click", function () { pick(b); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "Home") { e.preventDefault(); pick(chips[0], true); return; }
        if (e.key === "End") { e.preventDefault(); pick(chips[chips.length - 1], true); return; }
        var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1
                : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        pick(chips[(i + dir + chips.length) % chips.length], true);
      });
    });

    function logLine(html) {
      var p = d.createElement("p"); p.innerHTML = html;
      var idle = log.querySelector(".idle"); if (idle) idle.remove();
      log.appendChild(p); log.scrollTop = log.scrollHeight;
      return p;
    }
    function buildPrompt(to) {
      var lines = [
        "You are continuing a conversation that was moved from ChatGPT to " + to + " with Continue AI.",
        "Full context below — pick up exactly where it left off.",
        "",
        "── Conversation so far ──"
      ];
      CONVO.forEach(function (m) { lines.push((m.role === "user" ? "User: " : "Assistant: ") + m.text.replace(/\n/g, "\n  ")); });
      lines.push("", "── Continue ──", "Next task from the user: " + NEXT_LINE);
      return lines.join("\n");
    }
    function copyText(t) {
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
      return new Promise(function (res, rej) {
        var ta = d.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
        d.body.appendChild(ta); ta.select();
        var ok = false; try { ok = d.execCommand("copy"); } catch (e) {}
        ta.remove(); ok ? res() : rej();
      });
    }

    var live = byId("rmLive");
    function announce(t) { if (live) live.textContent = t; }
    var running = false;
    async function run() {
      if (running) return;
      running = true; go.setAttribute("aria-disabled", "true"); go.textContent = "TRANSFERRING…";
      log.innerHTML = ""; out.textContent = ""; copied.classList.remove("on");
      msgs.forEach(function (m) { m.classList.remove("cap"); });
      thread.scrollTop = 0;
      dstMeta.textContent = "RECEIVING…";
      announce("Transfer started: capturing the sample thread.");

      var cap = logLine("▸ CAPTURING THREAD — <b>0/" + N + "</b> messages");
      for (var i = 0; i < N; i++) {
        msgs[i].classList.add("cap");
        if (i > 2) thread.scrollTop = msgs[i].offsetTop - 120;
        cap.innerHTML = "▸ CAPTURING THREAD — <b>" + (i + 1) + "/" + N + "</b> messages";
        await sleep(70);
      }
      logLine("▸ code blocks × <b>" + N_CODE + "</b> · decisions × <b>" + N_DEC + "</b>");
      await sleep(300);
      logLine("▸ resolving order … <b>chronological ✓</b>");
      await sleep(340);
      logLine("▸ INTEGRITY <b>100%</b> — nothing dropped");
      announce("All " + N + " messages captured. Packaging into a portable prompt.");
      await sleep(340);
      logLine("▸ PACKAGING → portable prompt");
      await sleep(420);
      logLine("▸ ROUTING → <b>" + dest.toUpperCase() + "</b>");
      await sleep(380);

      var prompt = buildPrompt(dest);
      if (reduce) { out.textContent = prompt; }
      else {
        var k = 0, step = Math.max(6, Math.round(prompt.length / 90));
        while (k < prompt.length) {
          k = Math.min(prompt.length, k + step);
          out.textContent = prompt.slice(0, k);
          out.scrollTop = out.scrollHeight;
          await sleep(12);
        }
      }
      out.scrollTop = 0;

      try {
        await copyText(prompt);
        logLine("▸ COPIED ✓ — paste into " + dest + " and keep going");
        copied.classList.add("on");
        dstMeta.textContent = "READY TO PASTE";
        footNote.textContent = "SAMPLE CHAT — REAL PROMPT ON YOUR CLIPBOARD";
        announce("Done. The portable prompt is on your clipboard — paste it into " + dest + " to continue the conversation.");
      } catch (e) {
        logLine("▸ clipboard blocked by the browser — select the prompt and copy it");
        dstMeta.textContent = "SELECT & COPY";
        announce("Done, but the browser blocked the clipboard. Select the prompt text and copy it manually.");
      }
      go.removeAttribute("aria-disabled"); go.textContent = "TRANSFER AGAIN ▸"; running = false;
    }
    go.addEventListener("click", run);
  })();

  /* ═══ FAQ: animated open/close ═══ */
  [].forEach.call(d.querySelectorAll(".faq details"), function (dt) {
    var sum = dt.querySelector("summary"), ans = sum && sum.nextElementSibling;
    if (!sum || !ans || reduce || !ans.animate) return;
    var anim = null;
    sum.addEventListener("click", function (e) {
      e.preventDefault();
      if (anim) { anim.cancel(); anim = null; ans.style.overflow = ""; }
      if (dt.open) {
        var h = ans.scrollHeight; ans.style.overflow = "hidden";
        anim = ans.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 240, easing: "ease" });
        anim.onfinish = function () { dt.open = false; ans.style.overflow = ""; anim = null; };
      } else {
        dt.open = true;
        var h2 = ans.scrollHeight; ans.style.overflow = "hidden";
        anim = ans.animate([{ height: "0px", opacity: 0 }, { height: h2 + "px", opacity: 1 }], { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" });
        anim.onfinish = function () { ans.style.overflow = ""; anim = null; };
      }
    });
  });

  /* ═══ magnetic primary CTAs (fine pointers only) ═══ */
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    [].forEach.call(d.querySelectorAll(".btn-main, .cta"), function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.translate = (x * .18) + "px " + (y * .22) + "px";
      });
      el.addEventListener("mouseleave", function () { el.style.translate = ""; });
    });
  }
})();
