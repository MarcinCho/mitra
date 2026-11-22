# Mitra — strona wizytówka

Statyczna strona (HTML + CSS + odrobina JS) dla marki ręcznie robionych świec sojowych.
Hostowana na **Cloudflare Workers (static assets)**, poczta na **OVHcloud**.

Repozytorium: **https://github.com/MarcinCho/mitra** (prywatne, branch `main`).

---

## Jak to działa

- Cloudflare buduje repo i uruchamia `npx wrangler deploy`.
- Wrangler publikuje katalog **`public/`** jako statyczne assety Workera `mitra`.
- `public/_headers` ustawia nagłówki bezpieczeństwa (CSP),
  `public/_redirects` — przekierowanie `/kontakt`, a `public/404.html` — stronę błędu.
- Nie ma żadnego kodu Workera, więc requesty do statycznych plików nie zużywają
  limitów wywołań Workera.

## Struktura

```
public/                     ← tylko to trafia na stronę
  index.html                strona główna (one-page)
  dziekujemy.html           podziękowanie po formularzu
  polityka-prywatnosci.html szablon RODO (uzupełnij!)
  404.html                  strona błędu
  _headers                  CSP i nagłówki bezpieczeństwa
  _redirects                /kontakt → /#kontakt
  robots.txt
  manifest.webmanifest      dane aplikacji (ikona, nazwa, kolor)
  assets/
    css/fonts.css           self-hostowane fonty
    css/style.css           cały wygląd
    js/main.js              menu, animacje, formularz
    fonts/                  pliki .woff2 (bez CDN Google)
    img/logo.webp           logo na hero
    img/og.jpg              obrazek do udostępniania 1200×630
    img/favicon.svg         ikona strony
    img/icon-*.png          ikony aplikacji
wrangler.jsonc              konfiguracja Workera (assets → ./public)
package.json                wersja Wranglera i skrypty
design/logo-source.jpeg     oryginał logo (nie trafia na stronę)
README.md
```

Zdjęcia produktów i galerii to **placeholdery**. Wystarczy wrzucić pliki o właściwych
nazwach do `public/assets/img/` — podmienią się automatycznie:

- `produkt-1.jpg`, `produkt-2.jpg`, `produkt-3.jpg`
- `galeria-1.jpg` … `galeria-4.jpg`

Jeśli pliku nie ma, pokazuje się rysunek świecy (SVG), więc strona nie wygląda na
zepsutą. W konsoli będą wtedy 404 na tych obrazkach — to normalne do czasu dodania zdjęć.

---

## 1. Podmień placeholdery (5 minut)

W plikach w `public/`:

| Znajdź | Zamień na |
|---|---|
| `twojadomena.pl` | Twoja domena (bez `https://`) |
| `kontakt@twojadomena.pl` | Twój adres e-mail na domenie |
| `@mitra.rekodzielo` + link Instagrama | Twój profil |
| `[imię i nazwisko / nazwa firmy]`, `[adres]` | Twoje dane do polityki prywatności |
| nazwy i opisy produktów, pojemności, czasy palenia | Twoja oferta |
| „1–2 dni roboczych”, „cała Polska”, formy wysyłki | Twoje realia |

W `public/index.html` są też zakomentowane dane `schema.org` (SEO lokalne) —
uzupełnij i odkomentuj, jeśli chcesz.

**Ważne:** teksty o wysyłce, terminach i zapachach to propozycje. Dopasuj je do tego,
jak naprawdę działasz.

---

## 2. Formularz kontaktowy

Domyślnie formularz **działa bez konfiguracji** — po kliknięciu „Wyślij” otwiera
program pocztowy z gotową treścią (fallback `mailto:`).

Żeby wysyłał maile w tle, bez otwierania klienta poczty:

1. Wejdź na [web3forms.com](https://web3forms.com) i podaj swój adres e-mail.
2. Skopiuj **Access Key** z maila.
3. W `public/index.html` znajdź:

   ```html
   <input type="hidden" name="access_key" value="WKLEJ_KLUCZ_WEB3FORMS">
   ```

   i wklej klucz w miejsce `WKLEJ_KLUCZ_WEB3FORMS`.

Darmowy plan Web3Forms to ok. 250 wiadomości/mies. Formularz ma ukryte pole-pułapkę
(`botcheck`) na boty oraz wymaganą zgodę RODO.

Alternatywy: Formspree, Resend + Cloudflare Worker, Brevo.

**Test:** po ustawieniu klucza wyślij wiadomość testową i sprawdź, czy przyszła
(także folder spam).

---

## 3. Publikacja na Cloudflare (Workers Builds)

Repo jest już podłączone do Cloudflare. W ekranie **Set up your application** ustaw:

| Pole | Wartość |
|---|---|
| **Project name** | `mitra` |
| **Build command** | `npm ci` |
| **Deploy command** | `npx wrangler deploy` (domyślne) |
| **Preview command** | `npx wrangler preview` (domyślne) |
| **Enable Preview builds** | może zostać włączone (PR-y dostaną własny URL) |
| **Protect with Cloudflare Access** | wyłączone (strona publiczna) |

Kliknij **Deploy**. Pierwszy build zainstaluje Wranglera i opublikuje `public/`.
Adres roboczy będzie w formie:

```
https://mitra.<twoj-subdomain>.workers.dev
```

Jeśli Cloudflare zapyta o `workers.dev` subdomain — wybierz dowolną wolną nazwę.

Kolejne zmiany: `git push` → Cloudflare buduje i wdraża automatycznie.
Ustawienia można później zmienić w **Worker `mitra` → Settings → Build**.

### Alternatywa: deploy z terminala

```bash
npm ci
npx wrangler login
npx wrangler deploy
```

To wdraża ten sam Worker `mitra` z Twojego komputera (bez czekania na build).
Podgląd lokalny: `npm run dev` → `http://localhost:8787`.

---

## 4. Domena i poczta (OVH + Cloudflare)

Domena zostaje w OVH, ale **DNS przepisujemy do Cloudflare** — wtedy Worker dostaje
własną domenę i darmowy SSL, a poczta dalej działa przez OVH.

**Zanim zmienisz nameservery:**

1. W OVH wejdź w **Domeny i DNS → Strefa DNS → Eksport** i zapisz kopię strefy.
2. Zanotuj rekordy **MX**, **SPF (TXT)**, **DKIM** i **DMARC** — są potrzebne, żeby
   poczta dalej działała. OVH pokazuje je też w sekcji e-mail (MX Plan).
3. W Cloudflare dodaj domenę (**Add a site**), wybierz plan Free.
4. Przepisz rekordy z OVH do Cloudflare (DNS → Records), w tym:
   - MX na `mx1.mail.ovh.net`, `mx2.mail.ovh.net`, `mx3.mail.ovh.net` (z priorytetami
     z OVH),
   - TXT SPF (np. `v=spf1 include:mx.ovh.com ~all` — użyj dokładnej wartości z OVH),
   - CNAME/TXT DKIM oraz TXT DMARC.
5. W OVH zmień serwery nazw (DNS servers) na te podane przez Cloudflare.
6. Poczekaj na propagację (od kilkunastu minut do 24 h). Sprawdź, czy poczta dochodzi.

**Poczta:** skrzynka `kontakt@twojadomena.pl` jest w pakiecie darmowego hostingu OVH
(MX Plan, 5 GB). Jeśli jeszcze jej nie ma — utwórz ją w panelu OVH → **E-mail**.
Hosting OVH 100 MB nie jest potrzebny do strony, ale może zostać dla poczty.

**Podłączenie domeny do Workera:**

Cloudflare → **Workers & Pages** → Worker `mitra` → **Settings → Domains & Routes**
→ **Add → Custom domain** → dodaj `twojadomena.pl` oraz `www.twojadomena.pl`.
Cloudflare sam utworzy rekordy, jeśli strefa jest u niego.

Po włączeniu HTTPS sprawdź, czy `http://` przekierowuje na `https://`
(Cloudflare: SSL/TLS → **Always Use HTTPS**).

---

## 5. Zdjęcia — jak nie zapchać strony

Strona jest lekka, ale rozmiar ma znaczenie dla szybkości.

- Produkty: ok. **1200 × 900 px** (4:3), galeria: **900 × 900 px** (1:1).
- Każde zdjęcie najlepiej **poniżej 200 KB**.
- Kadruj na konkretny produkt, nie wrzucaj całych zdjęć z telefonu.
- Kompresja: [squoosh.app](https://squoosh.app) (WebP/JPG, quality 75–85) albo:

  ```bash
  python3 -c "
  from PIL import Image
  im = Image.open('foto.jpg').convert('RGB')
  im.thumbnail((1200, 1200))
  im.save('public/assets/img/produkt-1.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
  "
  ```

Zdjęcia w galerii są przycinane do kwadratu (`background-size: cover`), więc nie muszą
być idealnie kwadratowe.

---

## 6. Podgląd lokalny

```bash
npm ci
npm run dev
```

Otwórz `http://localhost:8787` — to dokładnie ten sam serwer i routing co na
Cloudflare (łącznie z `_headers`, `_redirects` i `404.html`).

Alternatywnie zwykły serwer statyczny:

```bash
python3 -m http.server -d public 8080
```

Formularz z kluczem Web3Forms zadziała też lokalnie (API ma CORS), a bez klucza
otworzy `mailto:`.

---

## 7. Checklist przed publikacją

- [ ] podmieniona domena i e-mail w całym projekcie (szukaj `twojadomena.pl`)
- [ ] prawdziwy Instagram / WhatsApp (jeśli dodajesz)
- [ ] uzupełnione dane administratora w polityce prywatności
- [ ] realne opisy produktów, pojemności i ceny (albo „cena na zapytanie”)
- [ ] zdjęcia produktów i galerii w `public/assets/img/`
- [ ] klucz Web3Forms + testowa wiadomość
- [ ] sprawdzony odbiór poczty po zmianie DNS (MX/SPF/DKIM)
- [ ] `og.jpg` i `canonical` wskazują na docelową domenę
- [ ] otwarte na telefonie: menu, formularz, kotwice
- [ ] `404.html` działa (np. wejdź na `/cokolwiek`)
- [ ] w Cloudflare włączone **Always Use HTTPS**

---

## 8. Uwagi prawne

- `public/polityka-prywatnosci.html` to **szablon**. Uzupełnij dane w nawiasach
  i skonsultuj z prawnikiem, jeśli sprzedajesz regularnie lub planujesz sklep.
- Strona nie ustawia cookies analitycznych. Jeśli dodasz analitykę (np. Cloudflare Web
  Analytics jest bezcookiesową opcją), zaktualizuj politykę.
- Fonty: Cormorant Garamond i Jost — licencja SIL Open Font License, można hostować
  lokalnie.
- Zdjęcia i logo: upewnij się, że masz prawa do wszystkich materiałów.

---

## 9. Najczęstsze problemy

**Build w Cloudflare się wywala** — sprawdź, czy build command to `npm ci` i czy
`package-lock.json` jest w repo. Logi: Worker → **Deployments → Build**.

**Po deployu jest 404 na wszystkim** — `wrangler.jsonc` musi wskazywać
`"directory": "./public"`, a `public/index.html` musi istnieć.

**Formularz otwiera pocztę zamiast wysyłać** — nie wklejony klucz Web3Forms.

**Po zmianie DNS nie przychodzi poczta** — brakuje MX/SPF/DKIM albo są złe priorytety.
Porównaj z eksportem strefy OVH.

**Zdjęcie się nie pokazuje** — zła nazwa pliku (`.jpg` vs `.jpeg`) albo format
(`.webp` przy `src="...jpg"`). Najprościej zapisać jako JPG o właściwej nazwie.

**Strona wygląda staro po podmianie zdjęcia** — cache przeglądarki. Odśwież z
`Ctrl+Shift+R`; po nowym deployu Cloudflare i tak podbija wersję assetów.

**Menu mobilne się nie otwiera** — sprawdź, czy `public/assets/js/main.js` wgrał się
na serwer i czy nie ma błędu w konsoli.

**W konsoli są błędy 404 dla `produkt-*.jpg` / `galeria-*.jpg`** — to normalne,
dopóki nie wgrasz zdjęć. Strona pokazuje wtedy rysunki świec (SVG). Po dodaniu
plików błędy znikną.

**Po edycji przestały działać skrypty / style** — `public/_headers` ustawia politykę
CSP. Dodawaj kod w plikach `assets/js/*.js` i `assets/css/*.css`, a nie inline w HTML.
Jeśli dodasz zewnętrzną usługę (analityka, mapa), dopisz jej domenę do
`connect-src` / `img-src` / `script-src` w `_headers`.
