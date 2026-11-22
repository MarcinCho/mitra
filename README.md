# Mitra — strona wizytówka

Statyczna strona (HTML + CSS + odrobina JS) dla marki ręcznie robionych świec sojowych.
Gotowa do publikacji na **Cloudflare Pages**, z pocztą na **OVHcloud**.

---

## Co jest w środku

```
index.html                  strona główna (one-page)
dziekujemy.html             podziękowanie po wysłaniu formularza
polityka-prywatnosci.html   szablon polityki prywatności (uzupełnij!)
404.html                    strona błędu
_headers                    nagłówki bezpieczeństwa (Cloudflare Pages)
_redirects                  przekierowanie /kontakt → /#kontakt
robots.txt
manifest.webmanifest        dane aplikacji (ikona, nazwa, kolor)
assets/
  css/fonts.css             self-hostowane fonty (Cormorant Garamond + Jost)
  css/style.css             cały wygląd
  js/main.js                menu, animacje, formularz
  fonts/                    pliki .woff2 (bez CDN Google)
  img/logo.webp             logo na hero (1100 px)
  img/og.jpg                obrazek do udostępniania 1200×630
  img/favicon.svg           ikona strony
  img/icon-*.png            ikony aplikacji
design/logo-source.jpeg     oryginał logo (nie jest częścią strony)
```

Zdjęcia produktów i galerii to **placeholdery**. Wystarczy wrzucić pliki o właściwych
nazwach do `assets/img/` i odświeżyć stronę — podmienią się automatycznie:

- `produkt-1.jpg`, `produkt-2.jpg`, `produkt-3.jpg`
- `galeria-1.jpg` … `galeria-4.jpg`

Jeśli nie ma pliku, pokazuje się elegancki rysunek świecy (SVG), więc strona nie wygląda
na zepsutą.

---

## 1. Podmień placeholdery (5 minut)

W plikach `index.html`, `dziekujemy.html`, `404.html`, `polityka-prywatnosci.html`:

| Znajdź | Zamień na |
|---|---|
| `twojadomena.pl` | Twoja domena (bez `https://`) |
| `kontakt@twojadomena.pl` | Twój adres e-mail na domenie |
| `@mitra.rekodzielo` + link Instagrama | Twój profil |
| `[imię i nazwisko / nazwa firmy]`, `[adres]` | Twoje dane do polityki prywatności |
| nazwy i opisy produktów, pojemności, czasy palenia | Twoja oferta |
| „1–2 dni roboczych”, „cała Polska”, formy wysyłki | Twoje realia |

W `index.html` są też zakomentowane dane `schema.org` (SEO lokalne) — uzupełnij
i odkomentuj, jeśli chcesz.

**Ważne:** teksty o wysyłce, terminach i zapachach to propozycje. Dopasuj je do tego,
jak naprawdę działasz.

---

## 2. Formularz kontaktowy

Domyślnie formularz **działa bez żadnej konfiguracji** — po kliknięciu „Wyślij” otwiera
program pocztowy z gotową treścią (fallback `mailto:`).

Żeby wysyłał maile w tle, bez otwierania klienta poczty:

1. Wejdź na [web3forms.com](https://web3forms.com) i podaj swój adres e-mail.
2. Skopiuj **Access Key** z maila.
3. W `index.html` znajdź:

   ```html
   <input type="hidden" name="access_key" value="WKLEJ_KLUCZ_WEB3FORMS">
   ```

   i wklej klucz w miejsce `WKLEJ_KLUCZ_WEB3FORMS`.

Darmowy plan Web3Forms to ok. 250 wiadomości/mies. i wystarczy w zupełności.
Formularz ma ukryte pole-pułapkę (`botcheck`) na boty oraz wymaganą zgodę RODO.

Alternatywy, jeśli kiedyś zabraknie limitu: Formspree, Resend + Cloudflare Pages
Function, Brevo.

**Test:** po ustawieniu klucza wyślij wiadomość testową na własny adres i sprawdź,
czy przyszła (także folder spam).

---

## 3. Publikacja na Cloudflare Pages

### Wariant A — bez Gita (najprostszy)

1. Wejdź w panel Cloudflare → **Workers & Pages** → **Create** → **Pages** →
   **Upload assets**.
2. Nazwij projekt, np. `mitra`.
3. Przeciągnij **zawartość tego folderu** (czyli `index.html`, `assets/`, `_headers`,
   `404.html` — bez `design/` i `README.md`, choć ich obecność niczego nie psuje).
4. Kliknij **Deploy**. Strona będzie pod `https://mitra.pages.dev`.

Kolejne zmiany: **Create new deployment** i ponownie przeciągnij pliki.

### Wariant B — z GitHitem (wygodne aktualizacje)

Repozytorium jest już utworzone i wypchnięte:
**https://github.com/MarcinCho/mitra** (prywatne, branch `main`).

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Zainstaluj **Cloudflare GitHub App** i daj jej dostęp do repozytorium `mitra`
   (przy prywatnym repo to konieczne).
3. Wybierz repo `mitra` i branch `main`.
4. Framework preset: **None**, build command: **puste**, output directory: **`/`**.
5. **Deploy**. Każdy `git push` publikuje nową wersję, a każdy PR dostaje własny preview.

Jeśli wolisz, żeby repo było publiczne: GitHub → **Settings → General → Danger Zone →
Change visibility**. Prywatne repo nie przeszkadza w podłączeniu do Cloudflare.

Pliki `_headers`, `_redirects`, `404.html` muszą znaleźć się w katalogu publikowanym.

---

## 4. Domena i poczta (OVH + Cloudflare)

Domena zostaje w OVH, ale **DNS przepisujemy do Cloudflare** — wtedy apex (`mitra.pl`)
i `www` działają bez kombinowania z CNAME, a SSL jest darmowy.

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
Hosting OVH 100 MB nie jest już potrzebny do strony, ale może zostać jako zapas.

**Podłączenie domeny do Pages:**

Cloudflare → **Workers & Pages** → projekt → **Custom domains** → **Set up a domain**
→ dodaj `twojadomena.pl` oraz `www.twojadomena.pl`. Cloudflare sam utworzy potrzebne
rekordy, jeśli strefa jest u niego.

Po włączeniu HTTPS sprawdź, czy `http://` przekierowuje na `https://` (Cloudflare:
SSL/TLS → **Always Use HTTPS**).

---

## 5. Zdjęcia — jak nie zapchać strony

Strona nie ma już limitu 100 MB, ale rozmiar ma znaczenie dla szybkości.

- Produkty: ok. **1200 × 900 px** (4:3), galeria: **900 × 900 px** (1:1).
- Każde zdjęcie najlepiej **poniżej 200 KB**.
- Kadruj na konkretny produkt, nie wrzucaj całych zdjęć z telefonu.
- Kompresja: [squoosh.app](https://squoosh.app) (WebP/JPG, quality 75–85) albo:

  ```bash
  python3 -c "
  from PIL import Image
  im = Image.open('foto.jpg').convert('RGB')
  im.thumbnail((1200, 1200))
  im.save('produkt-1.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
  "
  ```

Zdjęcia w galerii są przycinane do kwadratu (`object-fit: cover`), więc nie muszą
być idealnie kwadratowe.

---

## 6. Podgląd lokalny

```bash
cd Mitra
python3 -m http.server 8080
```

Otwórz `http://localhost:8080`. Formularz z kluczem Web3Forms zadziała też lokalnie
(API ma CORS), ale bez klucza otworzy tylko `mailto:`.

---

## 7. Checklist przed publikacją

- [ ] podmieniona domena i e-mail w całym projekcie (szukaj `twojadomena.pl`)
- [ ] prawdziwy Instagram / WhatsApp (jeśli dodajesz)
- [ ] uzupełnione dane administratora w polityce prywatności
- [ ] realne opisy produktów, pojemności i ceny (albo „cena na zapytanie”)
- [ ] zdjęcia produktów i galerii w `assets/img/`
- [ ] klucz Web3Forms + testowa wiadomość
- [ ] sprawdzony odbiór poczty po zmianie DNS (MX/SPF/DKIM)
- [ ] `og.jpg` i `canonical` wskazują na docelową domenę
- [ ] otwarte na telefonie: menu, formularz, kotwice
- [ ] `404.html` działa (np. wejdź na `/cokolwiek`)
- [ ] w Cloudflare włączone **Always Use HTTPS**

---

## 8. Uwagi prawne

- `polityka-prywatnosci.html` to **szablon**. Uzupełnij dane w nawiasach i skonsultuj
  z prawnikiem, jeśli sprzedajesz regularnie lub planujesz sklep.
- Strona nie ustawia cookies analitycznych. Jeśli dodasz analitykę (np. Cloudflare Web
  Analytics jest bezcookiesową opcją), zaktualizuj politykę.
- Fonty: Cormorant Garamond i Jost — licencja SIL Open Font License, można hostować
  lokalnie.
- Zdjęcia i logo: upewnij się, że masz prawa do wszystkich materiałów.

---

## 9. Najczęstsze problemy

**Formularz otwiera pocztę zamiast wysyłać** — nie wklejony klucz Web3Forms.

**Po zmianie DNS nie przychodzi poczta** — brakuje MX/SPF/DKIM albo są złe priorytety.
Porównaj z eksportem strefy OVH.

**Zdjęcie się nie pokazuje** — zła nazwa pliku (`.jpg` vs `.jpeg`) albo format
(`.webp` przy `src="...jpg"`). Najprościej zapisać jako JPG o właściwej nazwie.

**Strona wygląda staro po podmianie zdjęcia** — cache przeglądarki/CDN. Odśwież z
`Ctrl+Shift+R`; Cloudflare cache czyści się w panelu (Caching → Purge).

**Menu mobilne się nie otwiera** — sprawdź, czy `assets/js/main.js` wgrał się na
serwer i czy nie ma błędu w konsoli.

**W konsoli są błędy 404 dla `produkt-*.jpg` / `galeria-*.jpg`** — to normalne,
dopóki nie wgrasz zdjęć. Strona pokazuje wtedy rysunki świec (SVG). Po dodaniu
plików błędy znikną.

**Po edycji przestały działać skrypty / style** — `_headers` ustawia politykę CSP.
Dodawaj kod w plikach `assets/js/*.js` i `assets/css/*.css`, a nie inline w HTML.
Jeśli dodasz zewnętrzną usługę (analityka, mapa), dopisz jej domenę do
`connect-src` / `img-src` / `script-src` w `_headers`.
