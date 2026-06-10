/* ==========================================================================
   EKY Media – main.js
   Vanilla JavaScript, keine Abhängigkeiten.

   Module:
   1. Konfiguration (Formular, WhatsApp, Social-Profile)
   2. Social-Icons (Header/Footer, nur konfigurierte Profile)
   3. Header-Scroll-Zustand
   4. Drawer-Navigation (Mobile) mit Fokus-Management
   5. Footer-Accordions (nur Mobile)
   6. Scroll-Reveals (IntersectionObserver, reduced-motion-aware)
   7. Kontaktformular (Validierung + Mailto-Fallback)
   8. Accessibility-Widget (Aa-Stufen + Kontrast, localStorage)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. Konfiguration
     ------------------------------------------------------------------ */

  // TODO: Formular-Endpoint eintragen, z. B. HubSpot, Formspree,
  // eigener Backend-Endpunkt oder mailto-Fallback (bleibt aktiv, solange leer).
  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "info@ekymedia.de";

  // TODO: WhatsApp-Nummer hier zentral pflegen (internationales Format ohne "+").
  var WHATSAPP_NUMBER = "4916092647414";

  // TODO: Social-Profile eintragen, sobald die Links feststehen.
  // Nur ausgefüllte Profile werden im Header/Footer angezeigt –
  // leere Einträge bleiben unsichtbar (keine toten Links).
  var SOCIAL_LINKS = {
    instagram: "",
    tiktok: "",
    linkedin: "",
    facebook: ""
  };

  // WhatsApp-Links aus der Konfiguration befüllen
  document.querySelectorAll("[data-wa-link]").forEach(function (el) {
    el.href = "https://wa.me/" + WHATSAPP_NUMBER;
  });

  /* ------------------------------------------------------------------
     2. Social-Icons (einheitlicher Inline-SVG-Stil)
     ------------------------------------------------------------------ */

  var SOCIAL_ICONS = {
    instagram:
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none"/></svg>',
    tiktok:
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 11.5a4 4 0 1 0 4 4V4c.6 2.6 2.6 4.6 5 5"/></svg>',
    linkedin:
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5V17M8 7.5v.01M12 17v-3.5a2.2 2.2 0 0 1 4.4 0V17"/></svg>',
    facebook:
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 8.5h2.5V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5h2.5l.5-3.5h-3v-2a.9.9 0 0 1 1-1z"/></svg>'
  };

  var SOCIAL_LABELS = {
    instagram: "EKY Media auf Instagram",
    tiktok: "EKY Media auf TikTok",
    linkedin: "EKY Media auf LinkedIn",
    facebook: "EKY Media auf Facebook"
  };

  document.querySelectorAll("[data-socials]").forEach(function (container) {
    var any = false;
    Object.keys(SOCIAL_LINKS).forEach(function (key) {
      var url = SOCIAL_LINKS[key];
      if (!url) return;
      any = true;
      var a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", SOCIAL_LABELS[key]);
      a.innerHTML = SOCIAL_ICONS[key];
      container.appendChild(a);
    });
    container.hidden = !any;
  });

  /* ------------------------------------------------------------------
     3. Header-Scroll-Zustand
     ------------------------------------------------------------------ */

  var header = document.querySelector(".site-header");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ------------------------------------------------------------------
     4. Drawer-Navigation (Mobile)
     ------------------------------------------------------------------ */

  var navToggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("drawer");
  var backdrop = document.querySelector(".drawer-backdrop");
  var drawerClose = drawer ? drawer.querySelector(".drawer__close") : null;
  var lastFocused = null;

  function drawerOpen() {
    return drawer && drawer.classList.contains("is-open");
  }

  function setDrawer(open) {
    if (!drawer || !navToggle) return;
    drawer.classList.toggle("is-open", open);
    if (backdrop) backdrop.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      lastFocused = document.activeElement;
      if (drawerClose) drawerClose.focus();
    } else if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
      lastFocused = null;
    }
  }

  if (navToggle && drawer) {
    navToggle.addEventListener("click", function () {
      setDrawer(!drawerOpen());
    });

    if (drawerClose) {
      drawerClose.addEventListener("click", function () {
        setDrawer(false);
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setDrawer(false);
      });
    }

    drawer.addEventListener("click", function (event) {
      if (event.target && event.target.closest("a")) setDrawer(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawerOpen()) setDrawer(false);
    });

    // Fokus-Zirkel innerhalb des offenen Drawers
    drawer.addEventListener("keydown", function (event) {
      if (event.key !== "Tab" || !drawerOpen()) return;
      var focusables = drawer.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var mqDesktop = window.matchMedia("(min-width: 921px)");
    var onDesktop = function () {
      if (mqDesktop.matches && drawerOpen()) setDrawer(false);
    };
    if (mqDesktop.addEventListener) mqDesktop.addEventListener("change", onDesktop);
    else mqDesktop.addListener(onDesktop);
  }

  /* ------------------------------------------------------------------
     5. Footer-Accordions (Desktop offen, Mobile toggelbar)
     ------------------------------------------------------------------ */

  var footerCols = document.querySelectorAll("details.footer-col");
  var mqMobile = window.matchMedia("(max-width: 640px)");

  function syncFooter() {
    footerCols.forEach(function (col) {
      if (mqMobile.matches) {
        col.removeAttribute("open");
      } else {
        col.setAttribute("open", "");
      }
    });
  }

  if (footerCols.length) {
    syncFooter();
    if (mqMobile.addEventListener) mqMobile.addEventListener("change", syncFooter);
    else mqMobile.addListener(syncFooter);
  }

  /* ------------------------------------------------------------------
     6. Scroll-Reveals
     ------------------------------------------------------------------ */

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function motionDisabled() {
    return (
      prefersReducedMotion ||
      document.documentElement.classList.contains("reduce-motion")
    );
  }

  var revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if (motionDisabled() || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  /* ------------------------------------------------------------------
     7. Kontaktformular
     ------------------------------------------------------------------ */

  var form = document.getElementById("contact-form");

  function setFieldError(field, message) {
    var errorEl = document.getElementById(field.id + "-error");
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errorEl) errorEl.textContent = message;
    } else {
      field.removeAttribute("aria-invalid");
      if (errorEl) errorEl.textContent = "";
    }
  }

  function validateForm() {
    var valid = true;
    var firstInvalid = null;

    var required = [
      { id: "cf-name", message: "Bitte geben Sie Ihren Namen an." },
      { id: "cf-company", message: "Bitte geben Sie Ihr Unternehmen an." },
      {
        id: "cf-email",
        message: "Bitte geben Sie eine gültige E-Mail-Adresse an.",
        type: "email"
      },
      { id: "cf-industry", message: "Bitte wählen Sie Ihre Branche." },
      { id: "cf-topic", message: "Bitte wählen Sie ein Thema." },
      { id: "cf-message", message: "Bitte beschreiben Sie kurz Ihr Anliegen." },
      {
        id: "cf-privacy",
        message: "Bitte bestätigen Sie den Datenschutzhinweis.",
        type: "checkbox"
      }
    ];

    required.forEach(function (item) {
      var field = document.getElementById(item.id);
      if (!field) return;
      var value = field.value.trim();
      var hasError = false;

      if (item.type === "checkbox") {
        hasError = !field.checked;
      } else if (item.type === "email") {
        hasError = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      } else {
        hasError = value === "";
      }

      setFieldError(field, hasError ? item.message : "");
      if (hasError) {
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  if (form) {
    form.setAttribute("novalidate", "novalidate");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var status = document.getElementById("form-status");
      if (!validateForm()) {
        if (status) {
          status.dataset.state = "error";
          status.textContent =
            "Bitte prüfen Sie die markierten Felder und senden Sie das Formular erneut.";
        }
        return;
      }

      var data = new FormData(form);

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        })
          .then(function (response) {
            if (!response.ok) throw new Error("Senden fehlgeschlagen");
            form.reset();
            if (status) {
              status.dataset.state = "success";
              status.textContent =
                "Vielen Dank! Ihre Anfrage ist eingegangen – wir melden uns zeitnah.";
            }
          })
          .catch(function () {
            if (status) {
              status.dataset.state = "error";
              status.textContent =
                "Das Senden hat nicht funktioniert. Schreiben Sie uns gern direkt an " +
                CONTACT_EMAIL +
                ".";
            }
          });
        return;
      }

      // Mailto-Fallback
      var subject = "Anfrage über ekymedia.de – " + (data.get("company") || "");
      var bodyLines = [
        "Name: " + (data.get("name") || ""),
        "Unternehmen: " + (data.get("company") || ""),
        "Website: " + (data.get("website") || "–"),
        "E-Mail: " + (data.get("email") || ""),
        "Telefon: " + (data.get("phone") || "–"),
        "Branche: " + (data.get("industry") || ""),
        "Thema: " + (data.get("topic") || ""),
        "",
        "Nachricht:",
        data.get("message") || ""
      ];

      window.location.href =
        "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(bodyLines.join("\n"));

      if (status) {
        status.dataset.state = "success";
        status.textContent =
          "Ihr E-Mail-Programm öffnet sich mit der vorbereiteten Nachricht. Alternativ erreichen Sie uns unter " +
          CONTACT_EMAIL +
          ".";
      }
    });
  }

  /* ------------------------------------------------------------------
     8. Accessibility-Widget
     Reduzierte Pille unten links mit zwei Buttons:
     - "Aa": Schriftgröße Standard → größer (fs-md) → sehr groß (fs-lg)
     - Kontrast: Kontrastmodus (hc) an/aus
     Klassen am <html>: fs-md, fs-lg, hc, reduce-motion.
     reduce-motion wird intern weiter unterstützt (Systemeinstellung
     prefers-reduced-motion + ggf. gespeicherter Wert), hat aber bewusst
     keinen sichtbaren Button mehr.
     ------------------------------------------------------------------ */

  var STORAGE_KEY = "eky-a11y";

  function readSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function writeSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      /* localStorage nicht verfügbar – Einstellungen gelten nur für die Sitzung */
    }
  }

  function applySettings(settings) {
    var root = document.documentElement;
    root.classList.toggle("fs-md", settings.fs === 1);
    root.classList.toggle("fs-lg", settings.fs === 2);
    root.classList.toggle("hc", !!settings.hc);
    root.classList.toggle("reduce-motion", !!settings.rm);
  }

  var a11ySettings = readSettings();
  applySettings(a11ySettings);

  var btnFont = document.querySelector("[data-a11y='font']");
  var btnContrast = document.querySelector("[data-a11y='contrast']");

  var FONT_LABELS = [
    "Schriftgröße ändern (aktuell: Standard)",
    "Schriftgröße ändern (aktuell: größer)",
    "Schriftgröße ändern (aktuell: sehr groß)"
  ];

  function syncWidget() {
    var fs = a11ySettings.fs || 0;
    if (btnFont) {
      btnFont.setAttribute("aria-pressed", fs > 0 ? "true" : "false");
      btnFont.setAttribute("aria-label", FONT_LABELS[fs]);
      btnFont.setAttribute("data-level", String(fs));
    }
    if (btnContrast) {
      btnContrast.setAttribute("aria-pressed", a11ySettings.hc ? "true" : "false");
    }
  }

  function updateWidget() {
    applySettings(a11ySettings);
    writeSettings(a11ySettings);
    syncWidget();
  }

  if (btnFont) {
    btnFont.addEventListener("click", function () {
      a11ySettings.fs = ((a11ySettings.fs || 0) + 1) % 3;
      updateWidget();
    });
  }

  if (btnContrast) {
    btnContrast.addEventListener("click", function () {
      a11ySettings.hc = !a11ySettings.hc;
      updateWidget();
    });
  }

  syncWidget();
})();
