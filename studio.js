/* Golden Hour Studio — working gallery, lightbox, and booking flow.
   Front-end only demo logic: bookings are stored in localStorage and a
   confirmation reference is generated client-side. No real booking is
   placed and no payment is taken. */
(function () {
  "use strict";

  var BOOKINGS_KEY = "golden-hour-bookings-v1";
  var PACKAGE_KEY = "golden-hour-selected-package";

  var PACKAGES = {
    mini:     { name: "Mini Session",      price: 185, duration: "30 minutes", photos: "10 edited photos" },
    portrait: { name: "Portrait Session",  price: 325, duration: "60 minutes", photos: "25 edited photos" },
    family:   { name: "Family Session",    price: 425, duration: "75 minutes", photos: "35 edited photos" },
    branding: { name: "Branding Session",  price: 550, duration: "2 hours",    photos: "40 edited photos + headshots" }
  };
  var ADDONS = {
    extraHour: { name: "Extra hour of coverage", price: 75 },
    rush:      { name: "Rush gallery (48 hours)", price: 45 },
    prints:    { name: "Prints pack (5 prints, 8×10)", price: 60 },
    styling:   { name: "Hair & makeup styling", price: 85 }
  };
  var SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM — Golden Hour"];

  function money(n) { return "$" + n; }
  function announce(id, msg) { var el = document.getElementById(id); if (el) el.textContent = msg; }

  /* ---------- Sessions page: remember chosen package ---------- */
  function initSessionButtons() {
    var btns = document.querySelectorAll("[data-book-package]");
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener("click", function () {
        try { localStorage.setItem(PACKAGE_KEY, b.getAttribute("data-book-package")); } catch (e) {}
      });
    });
  }

  /* ---------- Gallery filter + lightbox (home page) ---------- */
  function initGallery() {
    var grid = document.getElementById("gallery-grid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".gallery-card"));
    var filters = document.querySelectorAll("[data-filter]");
    var currentFilter = "all";

    function visibleCards() {
      return cards.filter(function (c) { return c.style.display !== "none"; });
    }
    Array.prototype.forEach.call(filters, function (btn) {
      btn.addEventListener("click", function () {
        currentFilter = btn.getAttribute("data-filter");
        Array.prototype.forEach.call(filters, function (b) {
          var on = b === btn;
          b.classList.toggle("selected", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        cards.forEach(function (c) {
          var show = currentFilter === "all" || c.getAttribute("data-category") === currentFilter;
          c.style.display = show ? "" : "none";
        });
        announce("gallery-status", visibleCards().length + " galleries shown.");
      });
    });

    /* Lightbox */
    var box = document.getElementById("lightbox");
    var visual = document.getElementById("lightbox-visual");
    var title = document.getElementById("lightbox-title");
    var caption = document.getElementById("lightbox-caption");
    var current = 0;

    function openAt(card) {
      var vis = visibleCards();
      current = Math.max(0, vis.indexOf(card));
      renderLightbox(vis);
      box.classList.add("open");
      box.setAttribute("aria-hidden", "false");
    }
    function renderLightbox(vis) {
      vis = vis || visibleCards();
      if (!vis.length) return;
      if (current >= vis.length) current = 0;
      var card = vis[current];
      visual.className = "lightbox-visual " + card.getAttribute("data-visual");
      visual.textContent = card.getAttribute("data-title").toUpperCase();
      title.textContent = card.getAttribute("data-title");
      caption.textContent = card.getAttribute("data-caption") + " (" + (current + 1) + " of " + vis.length + ")";
    }
    function step(delta) {
      var vis = visibleCards();
      if (!vis.length) return;
      current = (current + delta + vis.length) % vis.length;
      renderLightbox(vis);
    }
    function close() { box.classList.remove("open"); box.setAttribute("aria-hidden", "true"); }

    cards.forEach(function (card) {
      var btn = card.querySelector(".view-btn");
      if (btn) btn.addEventListener("click", function () { openAt(card); });
    });
    var closeBtn = document.getElementById("lightbox-close");
    var prevBtn = document.getElementById("lightbox-prev");
    var nextBtn = document.getElementById("lightbox-next");
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (prevBtn) prevBtn.addEventListener("click", function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { step(1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* ---------- Booking page ---------- */
  function initBooking() {
    var form = document.getElementById("booking-form");
    if (!form) return;
    var state = { pkg: null, date: "", slot: "", people: "2", addons: {} };

    /* Preselect: URL param first, then stored choice, default Portrait. */
    var param = null;
    try { param = new URLSearchParams(window.location.search).get("package"); } catch (e) {}
    var stored = null;
    try { stored = localStorage.getItem(PACKAGE_KEY); } catch (e) {}
    state.pkg = (param && PACKAGES[param]) ? param : ((stored && PACKAGES[stored]) ? stored : "portrait");

    var pkgBtns = form.querySelectorAll("[data-package]");
    var dateInput = document.getElementById("session-date");
    var slotWrap = document.getElementById("slot-grid");
    var peopleSelect = document.getElementById("people");
    var addonBoxes = form.querySelectorAll("[data-addon]");
    var sumPkg = document.getElementById("sum-package");
    var sumWhen = document.getElementById("sum-when");
    var sumAddons = document.getElementById("sum-addons");
    var sumTotal = document.getElementById("sum-total");
    var sumDeposit = document.getElementById("sum-deposit");
    var sumBalance = document.getElementById("sum-balance");

    var today = new Date(); today.setHours(0, 0, 0, 0);
    dateInput.min = today.toISOString().slice(0, 10);

    function bookedSlotsFor(dateStr) {
      /* Deterministic sample availability: two slots marked booked per date. */
      var h = 0, i;
      for (i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) % 997;
      return [h % SLOTS.length, (h + 3) % SLOTS.length];
    }
    function renderSlots() {
      slotWrap.innerHTML = "";
      if (!state.date) {
        slotWrap.innerHTML = '<span class="hint">Choose a date first — available start times will appear here.</span>';
        return;
      }
      var booked = bookedSlotsFor(state.date);
      SLOTS.forEach(function (slot, idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "slot-btn" + (state.slot === slot ? " selected" : "");
        b.textContent = booked.indexOf(idx) !== -1 ? slot + " — booked" : slot;
        b.disabled = booked.indexOf(idx) !== -1;
        b.setAttribute("aria-pressed", state.slot === slot ? "true" : "false");
        b.addEventListener("click", function () { state.slot = slot; renderSlots(); renderSummary(); clearError("slot"); });
        slotWrap.appendChild(b);
      });
    }
    function selectedAddons() {
      return Object.keys(state.addons).filter(function (k) { return state.addons[k]; });
    }
    function total() {
      var t = PACKAGES[state.pkg].price;
      selectedAddons().forEach(function (k) { t += ADDONS[k].price; });
      return t;
    }
    function renderSummary() {
      var p = PACKAGES[state.pkg];
      sumPkg.textContent = p.name + " — " + money(p.price);
      var when = "Not chosen yet";
      if (state.date) {
        var d = new Date(state.date + "T12:00:00");
        when = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
        if (state.slot) when += " at " + state.slot.replace(" — Golden Hour", " (Golden Hour)");
      }
      sumWhen.textContent = when + " · " + state.people + (state.people === "1" ? " person" : " people");
      var keys = selectedAddons();
      sumAddons.textContent = keys.length ? keys.map(function (k) { return ADDONS[k].name + " +" + money(ADDONS[k].price); }).join(" · ") : "None";
      var t = total();
      var deposit = Math.round(t * 0.25);
      sumTotal.textContent = money(t);
      sumDeposit.textContent = money(deposit) + " due today";
      sumBalance.textContent = money(t - deposit) + " due on session day";
      Array.prototype.forEach.call(pkgBtns, function (b) {
        var on = b.getAttribute("data-package") === state.pkg;
        b.classList.toggle("selected", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    Array.prototype.forEach.call(pkgBtns, function (b) {
      b.addEventListener("click", function () {
        state.pkg = b.getAttribute("data-package");
        try { localStorage.setItem(PACKAGE_KEY, state.pkg); } catch (e) {}
        renderSummary();
      });
    });
    dateInput.addEventListener("change", function () {
      state.date = dateInput.value; state.slot = ""; renderSlots(); renderSummary(); clearError("date");
    });
    peopleSelect.addEventListener("change", function () { state.people = peopleSelect.value; renderSummary(); });
    Array.prototype.forEach.call(addonBoxes, function (boxEl) {
      boxEl.addEventListener("change", function () {
        state.addons[boxEl.getAttribute("data-addon")] = boxEl.checked; renderSummary();
      });
    });

    /* Validation */
    function setError(key, fieldId, msg) {
      var err = document.getElementById("err-" + key);
      var field = document.getElementById(fieldId);
      if (err) { err.textContent = msg || ""; err.classList.toggle("show", !!msg); }
      if (field) field.classList.toggle("field-invalid", !!msg);
      return !msg;
    }
    function clearError(key) {
      var err = document.getElementById("err-" + key);
      if (err) { err.textContent = ""; err.classList.remove("show"); }
    }
    function validate() {
      var ok = true, firstBad = null;
      var name = document.getElementById("full-name");
      var email = document.getElementById("email");
      var phone = document.getElementById("phone");
      if (!setError("name", "full-name", name.value.trim().length >= 2 ? "" : "Please enter your full name.")) { ok = false; firstBad = firstBad || name; }
      if (!setError("email", "email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? "" : "Please enter a valid email address.")) { ok = false; firstBad = firstBad || email; }
      if (!setError("phone", "phone", phone.value.replace(/\D/g, "").length >= 10 ? "" : "Please enter a phone number with at least 10 digits.")) { ok = false; firstBad = firstBad || phone; }
      var dateMsg = "";
      if (!state.date) dateMsg = "Please choose a session date.";
      else {
        var d = new Date(state.date + "T12:00:00");
        if (d < today) dateMsg = "That date is in the past — please choose a future date.";
        else if (d.getDay() === 0) dateMsg = "The studio is closed on Sundays — please choose another day.";
      }
      if (!setError("date", "session-date", dateMsg)) { ok = false; firstBad = firstBad || dateInput; }
      if (!setError("slot", "slot-grid", state.slot ? "" : "Please choose an available start time.")) { ok = false; }
      if (firstBad) firstBad.focus();
      return ok;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) { announce("booking-status", "Please fix the highlighted fields and try again."); return; }
      var t = total();
      var deposit = Math.round(t * 0.25);
      var ref = "GH-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      var booking = {
        ref: ref, package: PACKAGES[state.pkg].name, price: t, deposit: deposit,
        date: state.date, slot: state.slot, people: state.people,
        addons: selectedAddons().map(function (k) { return ADDONS[k].name; }),
        name: document.getElementById("full-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        location: document.getElementById("location").value,
        createdAt: new Date().toISOString()
      };
      try {
        var all = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
        all.push(booking);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
      } catch (err) {}
      document.getElementById("conf-ref").textContent = ref;
      document.getElementById("conf-details").textContent =
        booking.package + " on " + new Date(booking.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) +
        " at " + booking.slot + " · " + booking.location + " · Total " + money(t) + " · Deposit due today " + money(deposit) +
        " · A confirmation summary for " + booking.name + " was prepared for " + booking.email + ".";
      document.getElementById("booking-section").classList.add("hidden");
      var conf = document.getElementById("confirmation");
      conf.classList.remove("hidden");
      if (conf.scrollIntoView) conf.scrollIntoView({ behavior: "smooth", block: "start" });
      announce("booking-status", "Booking confirmed. Reference " + ref + ".");
    });

    renderSlots();
    renderSummary();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSessionButtons();
    initGallery();
    initBooking();
  });
})();
