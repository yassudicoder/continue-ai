/* ==========================================================================
   CONTINUE AI — transit.js
   Behavior for the TRANSIT experience. Vanilla, no dependencies.
   1) THE CROSSING — scroll-driven scene machine (capture → pack → cross → rebuild)
   2) THE ALTERNATIVE — manual copy-paste chaos vignette
   3) HANDOFF TERMINAL — interactive simulated transfer (real clipboard copy)
   4) CARGO MANIFEST — export-format previews
   5) micro: magnetic CTA, in-view reveals
   Honors prefers-reduced-motion throughout.
   ========================================================================== */
(function () {
  "use strict";
  var d = document;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }

  /* ========================================================================
     1) THE CROSSING
     ======================================================================== */
  (function crossing() {
    var track = $("#xTrack"), stage = $("#xStage"), section = track && track.closest(".crossing");
    if (!track || !stage || !section) return;

    // scene boundaries as fractions of total track progress
    var SEG = [
      { n: 0, a: 0.00, b: 0.15, label: "T-00 · LIVE THREAD · MODEL A" },
      { n: 1, a: 0.15, b: 0.26, label: "T-01 · CONTEXT LIMIT · THREAD FROZEN" },
      { n: 2, a: 0.26, b: 0.42, label: "T-02 · CAPTURE · EXTRACTING LAYERS" },
      { n: 3, a: 0.42, b: 0.54, label: "T-03 · PACKAGE · CAPSULE SEALED" },
      { n: 4, a: 0.54, b: 0.72, label: "T-04 · TRANSFER · CROSSING BOUNDARY" },
      { n: 5, a: 0.72, b: 0.86, label: "T-05 · REBUILD · 47/47 RESTORED" },
      { n: 6, a: 0.86, b: 1.00, label: "T-06 · CONTINUE · MODEL B LIVE" }
    ];
    var gauge = $("#xGauge"), pct = $("#xPct"), readout = $("#xReadout"),
        bState = $("#xBState"), typeEl = $("#xType"),
        wpBtns = $$("#xWaypoints button");
    var TYPE_TXT = "Picking up where we left off — pricing page draft: three tiers, the migrate-away guarantee front and center…";

    var raw = 0, smooth = 0, active = false, lastScene = -1, crossed = false;
    var typing = { timer: 0, k: 0, on: false };

    section.setAttribute("data-scene", "0");

    function measure() {
      var r = track.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var total = track.offsetHeight - vh;
      raw = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    }

    function sceneFor(p) {
      for (var i = 0; i < SEG.length; i++) if (p <= SEG[i].b) return SEG[i];
      return SEG[SEG.length - 1];
    }

    function startTyping() {
      if (typing.on) return;
      typing.on = true;
      if (reduce) { typeEl.textContent = TYPE_TXT; return; }
      typing.k = 0;
      typeEl.textContent = "";
      (function step() {
        if (!typing.on) return;
        if (typing.k <= TYPE_TXT.length) {
          typeEl.textContent = TYPE_TXT.slice(0, typing.k++);
          typing.timer = setTimeout(step, 24);
        }
      })();
    }
    function stopTyping() {
      if (!typing.on) return;
      typing.on = false;
      clearTimeout(typing.timer);
      typeEl.textContent = "";
    }

    function apply() {
      var p = smooth;
      var seg = sceneFor(p);
      var t = clamp((p - seg.a) / (seg.b - seg.a || 1), 0, 1);

      if (seg.n !== lastScene) {
        section.setAttribute("data-scene", String(seg.n));
        if (readout) readout.textContent = seg.label;
        wpBtns.forEach(function (b) {
          var w = +b.getAttribute("data-w");
          b.classList.toggle("on", w === seg.n);
          b.classList.toggle("done", w < seg.n);
          b.setAttribute("aria-current", w === seg.n ? "step" : "false");
        });
        if (bState) bState.textContent = seg.n < 4 ? "EMPTY" : seg.n === 4 ? "RECEIVING" : seg.n === 5 ? "REBUILDING" : "LIVE";
        if (seg.n === 6) startTyping(); else stopTyping();
        if (seg.n < 4) { crossed = false; section.classList.remove("x-crossed"); }
        lastScene = seg.n;
      }

      stage.style.setProperty("--t", t.toFixed(4));

      // context gauge: 62% → 100% across scenes 0–1
      var g = seg.n === 0 ? 62 + t * 36 : seg.n === 1 ? 98 + t * 2 : 100;
      if (gauge) gauge.style.width = g.toFixed(1) + "%";
      if (pct) {
        pct.textContent = Math.round(g) + "%";
        pct.style.color = g > 96 ? "var(--warn)" : "";
      }

      // the boundary-crossing stamp
      if (seg.n === 4 && t >= 0.52 && !crossed) { crossed = true; section.classList.add("x-crossed"); }
    }

    var rafId = 0;
    function loop() {
      measure();
      smooth = reduce ? raw : smooth + (raw - smooth) * 0.18;
      if (Math.abs(raw - smooth) < 0.0005) smooth = raw;
      apply();
      rafId = active ? requestAnimationFrame(loop) : 0;
    }
    function setActive(on) {
      if (on === active) return;
      active = on;
      if (on && !rafId) rafId = requestAnimationFrame(loop);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { setActive(e.isIntersecting); });
      }, { rootMargin: "80px 0px" }).observe(track);
    } else setActive(true);
    measure(); smooth = raw; apply();

    // waypoint navigation
    wpBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var w = +b.getAttribute("data-w");
        var seg = SEG[w];
        var vh = window.innerHeight || 1;
        var top = track.getBoundingClientRect().top + (window.scrollY || 0);
        var y = top + ((seg.a + seg.b) / 2) * (track.offsetHeight - vh);
        window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
      });
    });
  })();

  /* ========================================================================
     2) THE ALTERNATIVE — manual chaos
     ======================================================================== */
  (function oldway() {
    var win = $("#owWindow"), log = $("#owLog"), verdict = $("#owVerdict"), replay = $("#owReplay");
    if (!win || !log) return;
    var STEPS = [
      { t: "▸ select all — attempt 1" },
      { t: "▸ copy (6 400 chars)" },
      { t: "▸ switch tab → the other AI" },
      { t: "▸ paste" },
      { t: "⚠ code blocks arrived as plain text", warn: true, chaos: true },
      { t: "▸ scroll back — find the rollback snippet" },
      { t: "▸ copy again · paste again" },
      { t: "⚠ formatting collapsed — lists flattened", warn: true },
      { t: "⚠ decision №11 — nowhere in the paste", warn: true },
      { t: "▸ start re-typing the context from memory…" }
    ];
    var playing = false, timers = [];
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      log.innerHTML = "";
      win.classList.remove("is-live", "is-chaos");
      verdict.classList.remove("show");
      playing = false;
    }
    function play() {
      if (playing) return;
      playing = true;
      win.classList.add("is-live");
      if (reduce) {
        STEPS.forEach(function (s) { addLine(s, true); });
        win.classList.add("is-chaos");
        verdict.classList.add("show");
        playing = false;
        return;
      }
      STEPS.forEach(function (s, i) {
        timers.push(setTimeout(function () {
          addLine(s);
          if (s.chaos) win.classList.add("is-chaos");
          if (i === STEPS.length - 1) { verdict.classList.add("show"); playing = false; }
        }, 700 + i * 620));
      });
    }
    function addLine(s, instant) {
      var li = d.createElement("li");
      li.textContent = s.t;
      if (s.warn) li.classList.add("is-warn");
      log.appendChild(li);
      if (instant) li.classList.add("on");
      else requestAnimationFrame(function () { requestAnimationFrame(function () { li.classList.add("on"); }); });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { play(); io.disconnect(); } });
      }, { threshold: 0.4 });
      io.observe(win);
    } else play();
    if (replay) replay.addEventListener("click", function () { reset(); requestAnimationFrame(play); });

    // pulse on the clean pane once visible
    var clean = $(".ow-clean");
    if (clean && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { clean.classList.toggle("in-view", e.isIntersecting); });
      }, { threshold: 0.4 }).observe(clean);
    }
  })();

  /* ========================================================================
     3) HANDOFF TERMINAL
     ======================================================================== */
  (function terminal() {
    var thread = $("#htThread"), chips = $$("#htChips button"), go = $("#htGo"),
        consoleEl = $("#htConsole"), status = $("#htStatus"),
        dstName = $("#htDstName"), dstHint = $("#htDstHint"), body = $("#htBody"),
        packet = $("#htPacket");
    if (!thread || !go || !body) return;

    var CHAT = [
      { r: "u", who: "YOU", t: "Build me a launch strategy for my SaaS — a screen-time app for families." },
      { r: "a", who: "CHATGPT", t: "Four-week runway. Week 1: 25 beta families from parenting forums, instrument onboarding drop-off. Week 2: fix the top three friction points…" },
      { r: "u", who: "YOU", t: "Draft the Product Hunt tagline." },
      { r: "a", who: "CHATGPT", t: "“Screen time that ends in agreement, not arguments.” Alt: “The family phone contract, automated.”" },
      { r: "u", who: "YOU", t: "Decision: freemium, $6/mo family plan. Remember that.", dec: true },
      { r: "a", who: "CHATGPT", t: "Noted — freemium with a $6/mo family tier. The pricing page should lead with free, upgrade path at 2+ kids." },
      { r: "u", who: "YOU", t: "Write the welcome email as a React Email component." },
      { r: "a", who: "CHATGPT", code: true, t: 'export const Welcome = ({ family }) => (\n  <Email preview="Day one, sorted.">\n    <H1>Welcome, {family.name}</H1>\n    <Steps items={onboarding} />\n  </Email>\n);' },
      { r: "u", who: "YOU", t: "Hm — I want a second opinion on the paywall placement." }
    ];

    // render the source thread
    CHAT.forEach(function (m) {
      var el = d.createElement("div");
      el.className = "hm " + (m.r === "u" ? "u" : "a") + (m.code ? " code" : "");
      var who = d.createElement("i"); who.textContent = m.who;
      var tx = d.createElement("span"); tx.textContent = m.t;
      el.appendChild(who); el.appendChild(tx);
      thread.appendChild(el);
    });
    var msgs = $$(".hm", thread);

    // destination chips — roving radio group
    var dest = "Claude";
    function pick(btn) {
      chips.forEach(function (c) {
        var on = c === btn;
        c.classList.toggle("on", on);
        c.setAttribute("aria-checked", on ? "true" : "false");
        c.tabIndex = on ? 0 : -1;
      });
      dest = btn.getAttribute("data-m");
      if (!running) { dstName.textContent = dest.toUpperCase(); dstHint.textContent = "new chat"; }
    }
    chips.forEach(function (c, i) {
      c.tabIndex = c.classList.contains("on") ? 0 : -1;
      c.addEventListener("click", function () { pick(c); });
      c.addEventListener("keydown", function (e) {
        var k = e.key, j = -1;
        if (k === "ArrowRight" || k === "ArrowDown") j = (i + 1) % chips.length;
        else if (k === "ArrowLeft" || k === "ArrowUp") j = (i - 1 + chips.length) % chips.length;
        if (j >= 0) { e.preventDefault(); pick(chips[j]); chips[j].focus(); }
      });
    });

    function logLine(txt, cls) {
      var li = d.createElement("li");
      li.textContent = txt;
      if (cls) li.classList.add(cls);
      consoleEl.appendChild(li);
      requestAnimationFrame(function () { requestAnimationFrame(function () { li.classList.add("on"); }); });
      while (consoleEl.children.length > 8) consoleEl.removeChild(consoleEl.firstChild);
      return li;
    }
    function type(el, txt, sp) {
      if (reduce) { el.textContent = txt; body.scrollTop = body.scrollHeight; return Promise.resolve(); }
      return new Promise(function (res) {
        var k = 0;
        (function s() {
          if (k <= txt.length) {
            el.textContent = txt.slice(0, k);
            k += 3;
            body.scrollTop = body.scrollHeight;
            setTimeout(s, sp);
          } else { el.textContent = txt; res(); }
        })();
      });
    }
    function buildPrompt(to) {
      var L = [];
      L.push("You are continuing a conversation moved over from ChatGPT with Continue AI. Full context below — pick up exactly where it left off.");
      L.push("");
      L.push("── CONTEXT MANIFEST ──────────────");
      L.push("source: ChatGPT · messages: 9 · code blocks: 1 · pinned decisions: 1");
      L.push("destination: " + to + " · demo transfer");
      L.push("");
      L.push("── CONVERSATION ──────────────────");
      CHAT.forEach(function (m) {
        L.push((m.r === "u" ? "User: " : "Assistant: ") + m.t);
      });
      L.push("");
      L.push("── CONTINUE ──────────────────────");
      L.push("Give the second opinion the user asked for: where should the paywall sit, given freemium with a $6/mo family plan?");
      return L.join("\n");
    }
    function copy(t) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
      } catch (e) {}
      return new Promise(function (res, rej) {
        var ta = d.createElement("textarea");
        ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
        d.body.appendChild(ta); ta.select();
        try { d.execCommand("copy"); res(); } catch (e) { rej(e); }
        d.body.removeChild(ta);
      });
    }

    var running = false;
    async function run() {
      if (running) return;
      running = true;
      go.disabled = true;
      var to = dest;
      consoleEl.innerHTML = "";
      body.textContent = "";
      status.textContent = "";
      dstName.textContent = to.toUpperCase();
      dstHint.textContent = "receiving…";
      msgs.forEach(function (m) { m.classList.remove("captured"); });

      // 1 — capture
      var cap = logLine("CAPTURING THREAD · 0/" + msgs.length);
      for (var i = 0; i < msgs.length; i++) {
        msgs[i].classList.add("captured");
        if (!reduce) msgs[i].scrollIntoView({ block: "nearest", behavior: "auto" });
        cap.textContent = "CAPTURING THREAD · " + (i + 1) + "/" + msgs.length;
        await sleep(120);
      }
      await sleep(260);
      logLine("EXTRACTING CODE BLOCKS · 1");
      await sleep(300);
      logLine("PINNING DECISIONS · 1");
      await sleep(300);
      logLine("RESOLVING ORDER · OK");
      await sleep(280);
      logLine("BUILDING CONTEXT MANIFEST · 1.3 KB");
      await sleep(360);
      logLine("INTEGRITY · 100%", "is-ok");
      await sleep(300);

      // 2 — route (packet travels the rail on desktop)
      logLine("ROUTING → " + to.toUpperCase(), "is-amber");
      if (packet && !reduce && getComputedStyle(packet.parentNode.parentNode).display !== "none") {
        packet.style.top = "0%";
        packet.classList.add("go");
        void packet.offsetWidth;
        packet.style.top = "100%";
        await sleep(1100);
        packet.classList.remove("go");
        packet.style.top = "0%";
      } else {
        await sleep(reduce ? 0 : 400);
      }
      msgs.forEach(function (m) { m.classList.remove("captured"); });

      // 3 — reconstruct + copy
      var head = d.createElement("span"); head.className = "pp-h";
      head.textContent = "PORTABLE PROMPT → " + to.toUpperCase();
      var line = d.createElement("span");
      body.appendChild(head); body.appendChild(line);
      var prompt = buildPrompt(to);
      await type(line, prompt, 4);

      var copied = true;
      try { await copy(prompt); } catch (e) { copied = false; }
      dstHint.textContent = "ready to paste";
      status.textContent = copied
        ? "COPIED TO YOUR CLIPBOARD ✓ — PASTE INTO " + to.toUpperCase() + " TO CONTINUE"
        : "SELECT THE PROMPT AND COPY IT — THEN PASTE INTO " + to.toUpperCase();
      logLine("TRANSFER COMPLETE", "is-ok");
      go.disabled = false;
      running = false;
    }
    go.addEventListener("click", run);
  })();

  /* ========================================================================
     4) CARGO MANIFEST — export previews
     ======================================================================== */
  (function formats() {
    var group = $("#mfFormats"), file = $("#mfFile"),
        name = $("#mfFileName"), bodyEl = $("#mfFileBody");
    if (!group || !file) return;
    var DATA = {
      pdf:  { n: "thread-4117.pdf",  b: "CONTINUE AI — CONVERSATION EXPORT\n47 messages · 12 pages · A4\n──────────────────────\nYOU   I'm launching a CLI for…\nMODEL Three-week runway. Week 1…\n[8 code blocks typeset intact]" },
      html: { n: "thread-4117.html", b: "<article class=\"thread\">\n  <h1>Launch plan — CLI</h1>\n  <div class=\"msg user\">…</div>\n  <pre class=\"code\">migrate rollback…</pre>\n</article>" },
      img:  { n: "thread-4117.png",  b: "1240 × 8 420 px\n\nfull-thread screenshot,\nstitched top to bottom —\nnothing cropped, nothing missed" },
      md:   { n: "thread-4117.md",   b: "# Launch plan — CLI\n\n**You:** I'm launching a CLI for…\n\n**Assistant:** Three-week runway…\n\n```bash\nmigrate rollback --to 2026_05_01\n```" },
      json: { n: "thread-4117.json", b: "{\n  \"source\": \"chatgpt\",\n  \"messages\": 47,\n  \"code_blocks\": 8,\n  \"decisions\": [3, 7, 11],\n  \"integrity\": 1.0\n}" }
    };
    function show(f) {
      var x = DATA[f]; if (!x) return;
      file.setAttribute("data-f", f);
      name.textContent = x.n;
      bodyEl.textContent = x.b;
    }
    $$("button", group).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", group).forEach(function (o) {
          o.classList.toggle("on", o === b);
          o.setAttribute("aria-pressed", o === b ? "true" : "false");
        });
        show(b.getAttribute("data-f"));
      });
    });
    show("pdf");
  })();

  /* ========================================================================
     5) micro — in-view reveals + magnetic primary CTAs
     ======================================================================== */
  (function micro() {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.classList.toggle("in-view", e.isIntersecting); });
      }, { threshold: 0.35 });
      $$(".mf-viz").forEach(function (el) { io.observe(el); });
    } else {
      $$(".mf-viz").forEach(function (el) { el.classList.add("in-view"); });
    }

    if (reduce || !window.matchMedia || !matchMedia("(pointer:fine)").matches) return;
    $$(".btn-amber").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
        var dy = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
        b.style.transform = "translate(" + (dx * 3).toFixed(1) + "px," + (dy * 3 - 1).toFixed(1) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  })();
})();
