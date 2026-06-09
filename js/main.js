/* ==========================================================================
   EKY Media – main.js
   Vanilla JavaScript, keine Abhängigkeiten.

   Module:
   1. Konfiguration (Formular-Endpoint, WhatsApp)
   2. Header-Scroll-Zustand
   3. Drawer-Navigation (Mobile) mit Fokus-Management
   4. Footer-Accordions (nur Mobile)
   5. Scroll-Reveals (IntersectionObserver, reduced-motion-aware)
   6. Kontaktformular (Validierung + Mailto-Fallback)
   7. Accessibility-Widget (fs-md / fs-lg / hc / reduce-motion, localStorage)
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

  // WhatsApp-Links aus der Konfiguration befüllen
  document.querySelectorAll("[data-wa-link]").forEach(function (el) {
    el.href = "https://wa.me/" + WHATSAPP_NUMBER;
  });

  /* ------------------------------------------------------------------
     2. Header-Scroll-Zustand
     ------------------------------------------------------------------ */

  var header = document.querySelector(".site-header");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ------------------------------------------------------------------
     3. Drawer-Navigation (Mobile)
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
      // Fokus in den Drawer setzen
      if (drawerClose) drawerClose.focus();
    } else if (lastFocused && typeof lastFocused.focus === "function") {
      // Fokus darf nicht im (versteckten) Drawer hängen bleiben
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

    // Klick auf einen Link schließt den Drawer
    drawer.addEventListener("click", function (event) {
      if (event.target && event.target.closest("a")) setDrawer(false);
    });

    // Escape schließt den Drawer
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawerOpen()) setDrawer(false);
    });

    // Einfacher Fokus-Zirkel innerhalb des offenen Drawers
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

    // Bei Wechsel auf Desktop-Layout Drawer schließen
    var mqDesktop = window.matchMedia("(min-width: 921px)");
    var onDesktop = function () {
      if (mqDesktop.matches && drawerOpen()) setDrawer(false);
    };
    if (mqDesktop.addEventListener) mqDesktop.addEventListener("change", onDesktop);
    else mqDesktop.addListener(onDesktop);
  }

  /* ------------------------------------------------------------------
     4. Footer-Accordions
     Desktop: alle Spalten offen, Summary nicht klickbar (CSS).
     Mobile: Spalten eingeklappt und per Summary toggelbar.
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
     5. Scroll-Reveals
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
     6. Kontaktformular
     Solange FORM_ENDPOINT leer ist: Validierung + Mailto-Fallback.
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
     7. Accessibility-Widget
     Klassen am <html>: fs-md, fs-lg, hc, reduce-motion.
     Einstellungen in localStorage ("eky-a11y"); werden zusätzlich
     bereits im <head> der Seiten angewendet (kein Flackern).
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

  var widget = document.querySelector(".a11y-widget");

  if (widget) {
    var toggle = widget.querySelector(".a11y-widget__toggle");
    var panel = widget.querySelector(".a11y-widget__panel");
    var btnFont = widget.querySelector("[data-a11y='font']");
    var btnContrast = widget.querySelector("[data-a11y='contrast']");
    var btnMotion = widget.querySelector("[data-a11y='motion']");
    var btnReset = widget.querySelector("[data-a11y='reset']");

    var FONT_LABELS = [
      "Schriftgröße: normal",
      "Schriftgröße: größer",
      "Schriftgröße: sehr groß"
    ];

    function syncButtons() {
      var fs = a11ySettings.fs || 0;
      if (btnFont) {
        btnFont.setAttribute("aria-pressed", fs > 0 ? "true" : "false");
        btnFont.setAttribute("aria-label", FONT_LABELS[fs] + " – ändern");
        btnFont.textContent = fs === 2 ? "A++" : fs === 1 ? "A+" : "A";
      }
      if (btnContrast) {
        btnContrast.setAttribute("aria-pressed", a11ySettings.hc ? "true" : "false");
      }
      if (btnMotion) {
        btnMotion.setAttribute("aria-pressed", a11ySettings.rm ? "true" : "false");
      }
    }

    function update() {
      applySettings(a11ySettings);
      writeSettings(a11ySettings);
      syncButtons();
    }

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.hidden;
        panel.hidden = !open;
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !panel.hidden) {
          panel.hidden = true;
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });

      document.addEventListener("click", function (event) {
        if (!panel.hidden && !widget.contains(event.target)) {
          panel.hidden = true;
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (btnFont) {
      btnFont.addEventListener("click", function () {
        // Drei Stufen: normal → größer (fs-md) → sehr groß (fs-lg) → normal
        a11ySettings.fs = ((a11ySettings.fs || 0) + 1) % 3;
        update();
      });
    }

    if (btnContrast) {
      btnContrast.addEventListener("click", function () {
        a11ySettings.hc = !a11ySettings.hc;
        update();
      });
    }

    if (btnMotion) {
      btnMotion.addEventListener("click", function () {
        a11ySettings.rm = !a11ySettings.rm;
        update();
      });
    }

    if (btnReset) {
      btnReset.addEventListener("click", function () {
        a11ySettings = {};
        update();
      });
    }

    syncButtons();
  }
})();
