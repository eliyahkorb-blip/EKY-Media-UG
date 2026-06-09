# EKY Media – Website

Statische Website für **EKY Media**, Web- & KI-Agentur in Würzburg & Regensburg: individuelle Websites, KI-Assistenten, Automatisierung und lokale Sichtbarkeit.

- **Design:** Navy (`#0B1426`) + Gold (`#C8A14A`) + Off-White (`#F6F8FC`) – abgestimmt auf das EKY-Media-Logo (`assets/logo/eky-logo-original.jpeg`); die Wortmarke im Header/Footer ist als HTML/CSS umgesetzt (Serife, E navy / KY gold)
- **Technik:** HTML, CSS, Vanilla JavaScript – kein Framework, kein Build-Prozess
- **Hosting:** direkt auf GitHub Pages deploybar
- **Fonts:** ausschließlich System-Font-Stacks (keine Google Fonts, keine CDNs)
- **Datenschutz:** keine Tracking-Skripte, keine Analytics, kein Cookie-Banner nötig
- **Barrierefreiheit:** WCAG 2.2 AA als Zielstandard, Accessibility-Widget unten links

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
│   ├── img/                SVG-Platzhalter (Navy/Gold) für Hero, Projekte, Team
│   ├── icons/              Favicon (EKY-Monogramm)
│   └── logo/               Original-Logo (JPEG) + SVG-Nachbau der Wortmarke
├── css/styles.css          Design-System (Design-Tokens, kommentiert)
└── js/main.js              Drawer-Navigation, Footer-Accordions, Formular, A11y-Widget
```

## Deployment auf GitHub Pages

1. Repository auf GitHub pushen.
2. **Settings → Pages → Source:** Branch wählen (z. B. `main`), Ordner `/ (root)`.
3. Optional: Custom Domain `ekymedia.de` eintragen und beim DNS-Anbieter auf GitHub Pages zeigen lassen.
4. „Enforce HTTPS“ aktivieren.

> Hinweis: Canonical-URLs, `robots.txt` und `sitemap.xml` sind auf `https://ekymedia.de/` ausgelegt. Bei Veröffentlichung unter `https://<user>.github.io/<repo>/` diese URLs anpassen.

## Accessibility-Widget

Unten links, `role="toolbar"`, Einstellungen in `localStorage` (`eky-a11y`), Anwendung vor dem ersten Paint (Inline-Skript im `<head>` jeder Seite):

| Funktion | CSS-Klasse am `<html>` |
|---|---|
| Schriftgröße größer | `fs-md` (18px) |
| Schriftgröße sehr groß | `fs-lg` (20px) |
| Kontrastmodus | `hc` |
| Bewegungen reduzieren | `reduce-motion` |

`prefers-reduced-motion` des Systems wird zusätzlich immer respektiert.

## Wo ändere ich was?

### Firmendaten / Rechtsform

- Öffentlich wird bewusst **„EKY Media – Inhaber: Eliyah Korb“** geführt, solange die UG nicht im Handelsregister eingetragen ist (kein falscher Rechtsschein, keine öffentlichen HRB-/USt-ID-Platzhalter).
- Nach Eintragung: den **auskommentierten UG-Block** in `impressum.html` aktivieren (CONFIG-Kommentar im `<head>` beschreibt die Schritte) und die Firmierung in `datenschutz.html` (Abschnitt 1) angleichen.

### WhatsApp-Nummer

- Zentral in `js/main.js`, Konstante **`WHATSAPP_NUMBER`** – alle Links mit `data-wa-link` (Sticky-Button, Drawer, Kontakt, Footer) werden daraus befüllt. Die statischen `href`-Werte dienen nur als No-JS-Fallback.

### Kontaktformular / Endpoint

- `js/main.js`, Konstante **`FORM_ENDPOINT`**. Solange leer: Validierung + Mailto-Fallback an `info@ekymedia.de`.
- Bei Einbindung eines Formulardienstes den Abschnitt „Kontaktaufnahme“ in `datenschutz.html` anpassen (TODO-Kommentare gesetzt).

### Social-Media-Links

- Im Footer von `index.html` als **auskommentierter Block** vorbereitet (Instagram, TikTok, LinkedIn) – öffentlich ist nichts Leeres sichtbar. Links eintragen und Kommentar entfernen.

### Calendly

- Bewusst nur als Link vorgesehen (kein ungefragtes Embed). TODO-Kommentar in der Kontakt-Sektion von `index.html`; bei Aktivierung Abschnitt 7 in `datenschutz.html` prüfen.

### Chatbot

- Noch nicht eingebaut. Vorbereiteter Platzhalter-Kommentar in `index.html` (vor dem Footer): `TODO: Chatbot-Widget später hier einfügen`. Kein Fake-Bot, kein Bot-Icon, solange nichts funktioniert.

### Bilder ersetzen

- SVG-Platzhalter in `assets/img/` (Navy/Gold). Echte Fotos/Mockups dort ablegen und `src`-Pfade in `index.html` anpassen – `alt`-Texte mitpflegen.
- Das Hero-Visual ist ein reines CSS-Mockup (`.mockup` + `.hero__badge`) und kann durch `<img>`/`<video>` ersetzt werden.

### Texte & SEO

- Inhalte stehen direkt in den HTML-Dateien. Meta, Open Graph, Twitter Cards und JSON-LD (ProfessionalService, WebSite, FAQPage) im `<head>` von `index.html`.
- Bei FAQ-Änderungen: sichtbare FAQ-Sektion **und** FAQPage-JSON-LD synchron halten.

## Rechtlicher Hinweis

Impressum, Datenschutzerklärung, AGB und Barrierefreiheitserklärung sind **sorgfältige Entwürfe, keine Rechtsberatung**. Vor Veröffentlichung:

1. Rechtsform prüfen (siehe CONFIG in `impressum.html`); UG-Angaben erst nach Handelsregister-Eintragung aktivieren.
2. Tatsächlich genutzte Dienste (Hosting, Domain, Formular, Calendly, Social Media) mit der Datenschutzerklärung abgleichen.
3. Rechtstexte idealerweise juristisch prüfen lassen.
