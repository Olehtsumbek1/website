/* olehtsumbek.com: mobile menu, copy email, contact draft, subscribe. No animation. */
(function () {
  "use strict";
  var EMAIL = "olt49@pitt.edu";

  function setStatus(el, msg, kind) {
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("is-error", "is-success");
    if (kind) el.classList.add("is-" + kind);
  }

  /* Mobile menu (WordPress-style overlay) */
  var openBtn = document.querySelector(".nav__open");
  var panel = document.getElementById("nav-panel");
  var closeBtn = panel ? panel.querySelector(".nav__close") : null;
  var mobile = window.matchMedia("(max-width: 599px)");

  function onKey(e) {
    if (e.key === "Escape") { closeMenu(); return; }
    if (e.key !== "Tab") return;
    var items = panel.querySelectorAll("a[href], button:not([disabled])");
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function openMenu() {
    panel.classList.add("is-open");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Menu");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("has-modal-open");
    document.addEventListener("keydown", onKey);
    closeBtn.focus();
  }
  function closeMenu(keepFocus) {
    if (!panel.classList.contains("is-open")) return;
    panel.classList.remove("is-open");
    panel.removeAttribute("role");
    panel.removeAttribute("aria-modal");
    panel.removeAttribute("aria-label");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("has-modal-open");
    document.removeEventListener("keydown", onKey);
    if (!keepFocus) openBtn.focus();
  }
  if (openBtn && panel && closeBtn) {
    openBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", function () { closeMenu(); });
    panel.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) closeMenu(true);
    });
    var onChange = function (e) { if (!e.matches) closeMenu(true); };
    if (mobile.addEventListener) mobile.addEventListener("change", onChange);
    else if (mobile.addListener) mobile.addListener(onChange);
  }

  /* Copy email address */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      if (ok) resolve(); else reject(new Error("copy failed"));
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy-email]"), function (btn) {
    var status = document.getElementById("copyStatus");
    btn.addEventListener("click", function () {
      copyText(EMAIL).then(function () {
        setStatus(status, "Email address copied: " + EMAIL, "success");
      }, function () {
        setStatus(status, "Copying isn’t available in this browser. The address is " + EMAIL + ".", "error");
      });
    });
  });

  /* Contact form: opens an email draft; nothing is sent from the site */
  var contact = document.getElementById("contactForm");
  if (contact) {
    var cStatus = document.getElementById("contactStatus");
    contact.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = contact.elements;
      var nameEl = f.namedItem("name"), emailEl = f.namedItem("email");
      var orgEl = f.namedItem("affiliation"), msgEl = f.namedItem("message");
      var name = nameEl.value.trim(), from = emailEl.value.trim();
      var org = orgEl.value.trim(), msg = msgEl.value.trim();
      if (!name) { setStatus(cStatus, "Add your name to create the draft.", "error"); nameEl.focus(); return; }
      if (!from || !emailEl.checkValidity()) { setStatus(cStatus, "Enter a valid email address, like name@example.com.", "error"); emailEl.focus(); return; }
      if (!msg) { setStatus(cStatus, "Write a message to create the draft.", "error"); msgEl.focus(); return; }
      var subject = "Message from " + name + (org ? " (" + org + ")" : "");
      var body = msg + "\n\n" + name + (org ? "\n" + org : "") + "\n" + from;
      setStatus(cStatus, "Opening your email app with the draft. If nothing opens, email " + EMAIL + " directly.", "success");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* Subscribe form (FormSubmit sends the address to Oleh's inbox) */
  var sub = document.getElementById("subscribeForm");
  if (sub) {
    var sStatus = document.getElementById("subscribeStatus");
    var input = sub.querySelector("input[type=email]");
    var button = sub.querySelector("button[type=submit]");
    sub.addEventListener("submit", function (e) {
      e.preventDefault();
      var honey = sub.querySelector("[name=_honey]");
      if (honey && honey.value) return;
      var addr = input.value.trim();
      if (!addr || !input.checkValidity()) {
        setStatus(sStatus, "Enter a valid email address, like name@example.com.", "error");
        input.focus();
        return;
      }
      if (location.protocol === "file:") {
        setStatus(sStatus, "Opening your email app to finish subscribing.", "success");
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Subscribe") +
          "&body=" + encodeURIComponent("Please add " + addr + " to the briefing list.");
        return;
      }
      button.disabled = true;
      button.textContent = "Subscribing…";
      fetch("https://formsubmit.co/ajax/" + EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email: addr,
          _subject: "New subscriber – olehtsumbek.com",
          _template: "table",
          _captcha: "false",
          page: location.href
        })
      }).then(function (r) {
        return r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status));
      }).then(function (data) {
        if (data && (data.success === false || data.success === "false")) throw new Error("rejected");
        setStatus(sStatus, "You’re on the list. New briefings will go to " + addr + ".", "success");
        sub.reset();
      }).catch(function () {
        setStatus(sStatus, "Couldn’t subscribe right now. Email " + EMAIL + " with the subject “Subscribe” instead.", "error");
      }).then(function () {
        button.disabled = false;
        button.textContent = "Subscribe";
      });
    });
  }
})();
