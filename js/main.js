/* ==========================================================================
   EKY Media – main.js
   Vanilla JavaScript, keine Abhängigkeiten.
   Module:
   1. Header-Scroll-Zustand
   2. Mobile Navigation (Burger, Scroll-Lock, Escape, Fokus)
   3. Dezente Scroll-Reveals (IntersectionObserver, reduced-motion-aware)
   4. Sticky Mobile CTA
   5. Kontaktformular (Validierung + Mailto-Fallback)
   6. Accessibility-Widget (Schriftgröße, Kontrast, Bewegung; localStorage)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. Header-Scroll-Zustand
     ------------------------------------------------------------------ */
  var header = document.querySelector(".site-header");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* ------------------------------------------------------------------
     2. Mobile Navigation
     ------------------------------------------------------------------ */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");

  function isNavOpen() {
    return nav && nav.classList.contains("is-open");
  }

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute(
      "aria-label",
      open ? "Menü schließen" : "Menü öffnen"
    );
    // Body-Scroll-Lock im geöffneten Menü
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      setNav(!isNavOpen());
    });

    // Menü schließen, wenn ein Link gewählt wird
    nav.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.closest("a")) setNav(false);
    });

    // Escape schließt das Menü und gibt den Fokus zurück
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isNavOpen()) {
        setNav(false);
        navToggle.focus();
      }
    });

    // Bei Wechsel auf Desktop-Layout Menü-Zustand zurücksetzen
    var mq = window.matchMedia("(min-width: 921px)");
    var onMq = function () {
      if (mq.matches) setNav(false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onMq);
    else mq.addListener(onMq);
  }

  /* ------------------------------------------------------------------
     3. Scroll-Reveals (dezent, abschaltbar)
     ------------------------------------------------------------------ */
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function motionDisabled() {
    return (
      prefersReducedMotion ||
      document.documentElement.classList.contains("a11y-no-motion")
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
     4. Sticky Mobile CTA
     Erscheint mobil, sobald der Hero aus dem Viewport gescrollt ist,
     und wird vor dem Kontaktbereich wieder ausgeblendet.
     ------------------------------------------------------------------ */
  var mobileCta = document.querySelector(".mobile-cta");
  var heroSection = document.getElementById("start");
  var contactSection = document.getElementById("kontakt");

  function updateMobileCta() {
    if (!mobileCta || !heroSection) return;
    var heroBottom = heroSection.getBoundingClientRect().bottom;
    var show = heroBottom < 0;
    if (show && contactSection) {
      var contactTop = contactSection.getBoundingClientRect().top;
      if (contactTop < window.innerHeight) show = false;
    }
    mobileCta.classList.toggle("is-active", show);
    document.body.classList.toggle("has-mobile-cta", show);
  }

  if (mobileCta) {
    window.addEventListener("scroll", updateMobileCta, { passive: true });
    window.addEventListener("resize", updateMobileCta);
    updateMobileCta();
  }

  /* ------------------------------------------------------------------
     5. Kontaktformular
     TODO: Formular-Endpoint eintragen, z. B. HubSpot, Formspree,
     eigener Backend-Endpunkt oder mailto-Fallback.
     Solange FORM_ENDPOINT leer ist, validiert das Skript die Eingaben
     und öffnet das Mailprogramm mit vorbefüllter Nachricht (mailto).
     ------------------------------------------------------------------ */
  var FORM_ENDPOINT = ""; // z. B. "https://formspree.io/f/XXXXXXXX"
  var CONTACT_EMAIL = "info@ekymedia.de";

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
        // Versand an konfigurierten Endpoint
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

      // Mailto-Fallback: öffnet das Mailprogramm mit vorbefüllter Nachricht
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
     6. Accessibility-Widget
     Schriftgröße erhöhen, Kontrastmodus, Bewegungen reduzieren.
     Einstellungen werden in localStorage gespeichert und beim Laden
     früh angewendet (siehe Inline-Snippet im <head> der Seiten).
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
    root.style.setProperty("--font-scale", settings.fontScale || 1);
    root.classList.toggle("a11y-contrast", !!settings.contrast);
    root.classList.toggle("a11y-no-motion", !!settings.noMotion);
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

    function syncButtons() {
      if (btnFont) {
        btnFont.setAttribute(
          "aria-pressed",
          (a11ySettings.fontScale || 1) > 1 ? "true" : "false"
        );
      }
      if (btnContrast) {
        btnContrast.setAttribute(
          "aria-pressed",
          a11ySettings.contrast ? "true" : "false"
        );
      }
      if (btnMotion) {
        btnMotion.setAttribute(
          "aria-pressed",
          a11ySettings.noMotion ? "true" : "false"
        );
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
        // Drei Stufen: 1 → 1.125 → 1.25 → zurück auf 1
        var scale = a11ySettings.fontScale || 1;
        if (scale >= 1.25) scale = 1;
        else if (scale >= 1.125) scale = 1.25;
        else scale = 1.125;
        a11ySettings.fontScale = scale;
        update();
      });
    }

    if (btnContrast) {
      btnContrast.addEventListener("click", function () {
        a11ySettings.contrast = !a11ySettings.contrast;
        update();
      });
    }

    if (btnMotion) {
      btnMotion.addEventListener("click", function () {
        a11ySettings.noMotion = !a11ySettings.noMotion;
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
