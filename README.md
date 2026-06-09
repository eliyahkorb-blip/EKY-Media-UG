# EKY Media – Website

Statische Premium-Website für **EKY Media**, Digitalagentur für Websites, KI-Systeme, Automatisierung und digitale Sichtbarkeit in Würzburg & Regensburg, Bayern.

- **Technik:** HTML, CSS, Vanilla JavaScript – kein Framework, kein Build-Prozess
- **Hosting:** direkt auf GitHub Pages deploybar
- **Fonts:** ausschließlich System-Font-Stacks (keine Google Fonts, keine externen CDNs)
- **Datenschutz:** keine Tracking-Skripte, keine Analytics, kein Cookie-Banner nötig
- **Barrierefreiheit:** WCAG 2.2 AA als Zielstandard, inkl. Accessibility-Widget

## Dateistruktur

```
/
├── index.html              Startseite (alle Sektionen, SEO, JSON-LD)
├── impressum.html          Impressum (inkl. CONFIG-Kommentar für Firmendaten)
├── datenschutz.html        Datenschutzerklärung (Entwurf)
├── agb.html                AGB (Entwurf)
├── barrierefreiheit.html   Erklärung zur Barrierefreiheit
├── 404.html                Fehlerseite (GitHub Pages nutzt sie automatisch)
├── robots.txt
├── sitemap.xml
├── manifest.webmanifest
├── assets/
│   ├── img/                SVG-Platzhalter für Hero, Projekte, Team
│   ├── icons/              Favicon
│   └── logo/               Logo-Platzhalter (SVG)
├── css/styles.css          Komplettes Design-System (kommentiert)
└── js/main.js              Navigation, Reveals, Formular, A11y-Widget
```

## Deployment auf GitHub Pages

1. Repository auf GitHub pushen.
2. **Settings → Pages → Source:** Branch wählen (z. B. `main`), Ordner `/ (root)`.
3. Optional: Custom Domain `ekymedia.de` eintragen (Settings → Pages → Custom domain) und beim DNS-Anbieter einen `CNAME`-/`A`-Eintrag auf GitHub Pages setzen. GitHub legt dann automatisch eine `CNAME`-Datei an.
4. „Enforce HTTPS“ aktivieren.

> Hinweis: Alle Canonical-URLs, `robots.txt` und `sitemap.xml` sind auf `https://ekymedia.de/` ausgelegt. Wird (zunächst) unter `https://<user>.github.io/<repo>/` veröffentlicht, diese URLs entsprechend anpassen.

## Wo ändere ich was?

### Firmendaten / Rechtsform

- **Zentral dokumentiert im CONFIG-Kommentar** im `<head>` von `impressum.html`.
- Anpassen in: `impressum.html`, `datenschutz.html` (Abschnitt 1), `agb.html`, `barrierefreiheit.html`.
- **Wichtig:** Solange die *EKY Media UG (haftungsbeschränkt)* nicht im Handelsregister eingetragen ist, darf diese Rechtsform **nicht** öffentlich geführt werden (kein falscher Rechtsschein). Bis dahin Rechtsform anpassen (z. B. Einzelunternehmen) und nach Eintragung Registergericht, HRB-Nummer und USt-ID ergänzen.

### Bilder ersetzen

- Platzhalter liegen in `assets/img/` als SVG (`placeholder-hero.svg`, `placeholder-work-*.svg`, `placeholder-team.svg`).
- Echte Fotos/Mockups (JPG/WebP) einfach dort ablegen und die `src`-Pfade in `index.html` anpassen – `alt`-Texte dabei mitpflegen.
- Das Hero-Visual ist aktuell ein reines CSS-Mockup (`.mockup` in `index.html`) und kann durch ein `<img>` oder `<video>` ersetzt werden.

### Kontaktformular / Endpoint

- Konfiguration in `js/main.js`, Konstante **`FORM_ENDPOINT`**.
- Solange leer: Validierung + Mailto-Fallback (öffnet das Mailprogramm mit vorbefüllter Nachricht an `info@ekymedia.de`).
- Endpoint eintragen (z. B. Formspree, HubSpot, eigener Backend-Endpunkt) → das Formular sendet dann per `fetch`.
- **Wichtig:** Bei Einbindung eines Formulardienstes den entsprechenden Abschnitt in `datenschutz.html` anpassen (TODO-Kommentare sind gesetzt).

### WhatsApp / Calendly / Social Media

- **WhatsApp:** Link `https://wa.me/4916092647414` in `index.html` (Kontakt-Sektion). Nummer ändern = Link anpassen.
- **Calendly:** Bewusst nur als Link vorgesehen (kein ungefragtes Embed). TODO-Kommentar in der Kontakt-Sektion von `index.html`; bei Aktivierung Abschnitt 7 in `datenschutz.html` prüfen.
- **Social Links:** Platzhalter im Footer von `index.html` (`Instagram/TikTok/LinkedIn (folgt)`) durch echte Profil-URLs ersetzen.

### Texte & SEO

- Alle Inhalte stehen direkt in den HTML-Dateien (keine Templates).
- Meta-Tags, Open Graph, Twitter Cards und JSON-LD (ProfessionalService, WebSite, FAQPage) im `<head>` von `index.html`.
- Bei FAQ-Änderungen: sichtbare FAQ-Sektion **und** das FAQPage-JSON-LD synchron halten.

## Qualitätsmerkmale

- Semantisches HTML mit Landmarken, Skip-Link, korrekter Heading-Hierarchie
- Vollständige Tastaturbedienung, sichtbarer Fokus, Body-Scroll-Lock im mobilen Menü
- `prefers-reduced-motion` wird respektiert; zusätzlich Widget-Option „Bewegungen reduzieren“
- Accessibility-Widget (Schriftgröße, Kontrast, Bewegung) mit Speicherung in `localStorage`
- Keine externen Requests – alles wird lokal ausgeliefert

## Rechtlicher Hinweis

Impressum, Datenschutzerklärung, AGB und Barrierefreiheitserklärung sind **sorgfältige Entwürfe, keine Rechtsberatung**. Vor Veröffentlichung:

1. Rechtsform und Registerdaten prüfen (siehe CONFIG in `impressum.html`).
2. Tatsächlich genutzte Dienste (Hosting, Domain, Formular, Calendly, Social Media) mit der Datenschutzerklärung abgleichen.
3. Rechtstexte idealerweise juristisch prüfen lassen.
