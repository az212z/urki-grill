/* =====================================================================
   Ürki Grill — main.js
   Guarded, vanilla. transform/opacity only. Reduced-motion aware.
   ===================================================================== */
(function () {
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Preloader (always resolves) ---------- */
  function hidePreloader() {
    var pre = $("#preloader");
    if (!pre || pre.classList.contains("hide")) return;
    pre.classList.add("hide");
    setTimeout(function () { pre.style.display = "none"; }, 650);
    var hero = $(".hero");
    if (hero) hero.classList.add("ready");
  }
  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 1200); // safety fallback

  /* ---------- Header scrolled state ---------- */
  var header = $("#header");
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Mobile full-screen menu ---------- */
  var burger = $("#burger");
  var mobileMenu = $("#mobileMenu");
  var mmClose = $("#mmClose");
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (mmClose) mmClose.addEventListener("click", closeMenu);
  if (mobileMenu) $$("a", mobileMenu).forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeLightbox(); }
  });

  /* ---------- Scroll reveal + stagger ---------- */
  var revealEls = $$(".reveal, [data-stagger]");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          if (el.hasAttribute("data-stagger")) {
            $$(":scope > *", el).forEach(function (child, i) {
              child.style.transitionDelay = (i * 0.08) + "s";
            });
          }
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    // safety: force-show after 2.6s in case observer never fires
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add("in"); }); }, 2600);
  }

  /* ---------- Count-up (rating + reviews) ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var decimals = (el.getAttribute("data-count").indexOf(".") > -1) ? 1 : 0;
    if (prefersReduced) { el.textContent = target.toFixed(decimals); return; }
    var start = null, dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(countUp);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Hero parallax (pointer + scroll, capped, off touch) ---------- */
  if (!prefersReduced && !isTouch) {
    var hero = $(".hero");
    var glow = $(".hero-glow");
    var arab = $(".hero-arabesque");
    var photo = $(".hero-photo");
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      if (glow) glow.style.transform = "translate(" + (cx * 1.1) + "px," + (cy * 1.1) + "px)";
      if (arab) arab.style.transform = "translateY(-50%) translate(" + (cx * 0.6) + "px," + (cy * 0.6) + "px)";
      if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) raf = requestAnimationFrame(loop);
      else raf = null;
    }
    if (hero) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        tx = Math.max(-12, Math.min(12, nx * 24));
        ty = Math.max(-12, Math.min(12, ny * 24));
        if (!raf) raf = requestAnimationFrame(loop);
      });
    }
    // scroll parallax on photo (subtle)
    window.addEventListener("scroll", function () {
      if (!photo) return;
      var y = Math.min(window.scrollY, 700);
      photo.style.transform = "scale(1.08) translateY(" + (y * 0.08) + "px)";
    }, { passive: true });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = $("#lightbox");
  var lbImg = $("#lbImg");
  var lbClose = $("#lbClose");
  function openLightbox(src, alt) {
    if (!lightbox || !lbImg) return;
    lbImg.src = src; lbImg.alt = alt || "صورة من أوركي جريل";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
  $$(".gallery-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var full = item.getAttribute("data-full");
      var img = $("img", item);
      openLightbox(full, img ? img.alt : "");
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---------- Reservation form → WhatsApp + localStorage + toast ---------- */
  var form = $("#reserveForm");
  function showToast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 5000);
  }
  function setError(name, msg) {
    var box = $('.field-error[data-for="' + name + '"]');
    if (box) box.textContent = msg || "";
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        guests: form.guests.value,
        date: form.date.value,
        time: form.time.value,
        note: form.note.value.trim()
      };
      // validation
      var ok = true;
      ["name", "phone", "guests", "date", "time"].forEach(function (k) { setError("r-" + k, ""); });
      if (!data.name) { setError("r-name", "نرجو إدخال الاسم"); ok = false; }
      if (!/^0?5\d{8}$/.test(data.phone.replace(/\s|-/g, ""))) { setError("r-phone", "رقم جوال سعودي غير صحيح"); ok = false; }
      if (!data.guests) { setError("r-guests", "اختر عدد الضيوف"); ok = false; }
      if (!data.date) { setError("r-date", "اختر اليوم"); ok = false; }
      if (!data.time) { setError("r-time", "اختر الوقت"); ok = false; }
      if (!ok) return;

      // localStorage demo
      try {
        var saved = JSON.parse(localStorage.getItem("urki_reservations") || "[]");
        saved.push(Object.assign({ at: new Date().toISOString() }, data));
        localStorage.setItem("urki_reservations", JSON.stringify(saved));
      } catch (err) { /* ignore */ }

      // WhatsApp prefilled (gender-neutral Arabic)
      var msg =
        "السلام عليكم، أرغب بحجز طاولة في أوركي جريل:%0A" +
        "الاسم: " + encodeURIComponent(data.name) + "%0A" +
        "الجوال: " + encodeURIComponent(data.phone) + "%0A" +
        "عدد الضيوف: " + encodeURIComponent(data.guests) + "%0A" +
        "اليوم: " + encodeURIComponent(data.date) + "%0A" +
        "الوقت: " + encodeURIComponent(data.time) +
        (data.note ? "%0Aملاحظات: " + encodeURIComponent(data.note) : "");
      var url = "https://wa.me/966582023567?text=" + msg;

      showToast("تم تجهيز حجزك ✓ يتم تحويلك إلى واتساب لتأكيده.");
      form.reset();
      setTimeout(function () { window.open(url, "_blank", "noopener"); }, 700);
    });
  }

  /* ---------- Footer year ---------- */
  var y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
