/* ============================================================
   SEEMA v3 — "UNWIND" · main.js (agent F)
   Scope: live batch-date math, WhatsApp deep links, motion.js
   integration, and a chrome fallback (breadcrumb / order pill /
   scroll cue) used ONLY when motion.js is not running — when it
   is, agent E owns all chrome behavior (window.SeemaMotion set).
   ============================================================ */
(function () {
  "use strict";
  var html = document.documentElement;
  var WA_NUMBER = "91XXXXXXXXXX"; // [CONFIRM founder's WhatsApp]

  /* ---------- live batch-date math (ui-spec 0.5) ----------
     batch no. = two-digit ISO week + two-digit ISO week-year  */
  function isoWeek(d) {
    var date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = date.getUTCDay() || 7;               // Mon=1 … Sun=7
    date.setUTCDate(date.getUTCDate() + 4 - day);  // nearest Thursday
    var year = date.getUTCFullYear();
    var jan1 = new Date(Date.UTC(year, 0, 1));
    var week = Math.ceil(((date - jan1) / 86400000 + 1) / 7);
    return { week: week, year: year };
  }
  function pad2(n) { return String(n).padStart(2, "0"); }

  var now = new Date();
  var wk = isoWeek(now);
  var BATCH = pad2(wk.week) + pad2(wk.year % 100);

  // orders close next friday (today, if today is friday) — "fri 24 jul"
  var close = new Date(now);
  close.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
  var CLOSE = "fri " + close.getDate() + " " +
    ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"][close.getMonth()];

  document.querySelectorAll("[data-batch]").forEach(function (el) { el.textContent = BATCH; });
  document.querySelectorAll("[data-close-date]").forEach(function (el) { el.textContent = CLOSE; });
  var stampNo = document.getElementById("stamp-batch-no");
  if (stampNo) stampNo.textContent = BATCH;

  /* ---------- whatsapp deep links (ui-spec 0.5) ---------- */
  function waHref(sku) {
    var msg = sku
      ? "Hello Seema, I'd like to order from this week's batch (" + BATCH + "): " + sku + " x1. My address:"
      : "Hello Seema, I'd like to order from this week's batch (" + BATCH + "). My address:";
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waHref(a.getAttribute("data-wa-sku") || "");
  });

  /* ---------- chrome fallback (only without motion.js) ---------- */
  function initChromeFallback() {
    var crumb = document.getElementById("crumb-chapter");
    var beats = Array.prototype.slice.call(
      document.querySelectorAll("section[data-chapter], footer[data-chapter]"));
    var lastLabel = "";
    function updateCrumb() {
      if (!crumb) return;
      var mid = window.innerHeight * 0.5;
      var label = beats.length ? beats[0].getAttribute("data-chapter") : "";
      for (var i = 0; i < beats.length; i++) {
        if (beats[i].getBoundingClientRect().top <= mid) {
          label = beats[i].getAttribute("data-chapter");
        }
      }
      if (label !== lastLabel) { lastLabel = label; crumb.textContent = label; }
    }

    var pill = document.getElementById("order-pill");
    var b7 = document.getElementById("b7");
    var docked = false;
    function updatePill() {
      if (docked || !pill || !b7) return;
      if (b7.getBoundingClientRect().top <= window.innerHeight * 0.8) {
        pill.classList.add("is-docked");
        docked = true;
      }
    }

    var cue = document.getElementById("scroll-cue");
    var cueDone = false;
    function updateCue() {
      if (cueDone || !cue) return;
      if (window.scrollY > 40) { cue.classList.add("is-hidden"); cueDone = true; }
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateCrumb(); updatePill(); updateCue();
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateCrumb(); updatePill();
  }

  /* ---------- motion.js integration ----------
     motion.js (agent E, ES module) boots on import and publishes
     window.SeemaMotion. If it is absent/broken, drop to the
     pre-composed end state + chrome fallback. ?motion=force keeps
     the motion classes for layout QA. */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var force = /[?&]motion=force/.test(location.search);

  var fullMotion = html.classList.contains("has-motion") && (!reduced || force);

  if (fullMotion || reduced) {
    // Under full motion the loader (motion.js) reports real asset
    // progress and holds the door until images resolve — lazy images
    // below the fold would never fire while scroll is locked, so they
    // load eagerly and the loader becomes their honest cover.
    // Under reduce, motion.js still loads: it runs the brief's B0
    // fallback (spiral at 60% → crossfade to the rule) and the
    // end-state chrome — images stay lazy (no scroll lock there).
    if (fullMotion) {
      document.querySelectorAll('img[loading="lazy"]').forEach(function (im) {
        im.loading = "eager";
      });
    }
    import("./motion.js")
      .then(function () {
        if (!window.SeemaMotion) {
          // module loaded but engine did not boot (vendors missing):
          // motion.js has already applied .is-endstate classes.
          initChromeFallback();
        }
      })
      .catch(function () {
        if (!force) html.classList.remove("has-motion");
        var b0 = document.getElementById("b0");
        if (b0) b0.classList.add("is-done");
        initChromeFallback();
      });
  } else {
    if (!force) html.classList.remove("has-motion");
    initChromeFallback();
  }
})();
