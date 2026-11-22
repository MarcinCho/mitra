/* Mitra — interakcje strony */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector("[data-header]");
  var nav = document.getElementById("nav");
  var toggle = document.querySelector(".nav-toggle");

  /* ---------- Nagłówek przy przewijaniu ---------- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  if (header) {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menu mobilne ---------- */
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
    document.body.classList.toggle("menu-open", open);
  }

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });

    window.matchMedia("(min-width: 901px)").addEventListener("change", function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Delikatne pojawianie się sekcji ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (revealItems.length && "IntersectionObserver" in window && !reduceMotion) {
    revealItems.forEach(function (el) {
      el.classList.add("will-reveal");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Rok w stopce ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Formularz kontaktowy ---------- */
  var form = document.getElementById("form-kontakt");

  if (form) {
    var status = form.querySelector(".form__status");
    var submit = form.querySelector('button[type="submit"]');
    var keyField = form.querySelector('input[name="access_key"]');

    function setStatus(message, type) {
      if (!status) return;
      status.textContent = message;
      status.classList.remove("is-ok", "is-error");
      if (type) status.classList.add(type);
    }

    function mailtoFallback() {
      var email = form.getAttribute("data-email") || "";
      var name = form.elements.namedItem("name");
      var message = form.elements.namedItem("message");
      var body =
        "Imię: " + (name ? name.value : "") + "\n" +
        "E-mail: " + (form.elements.namedItem("email") || {}).value + "\n" +
        "Telefon: " + (form.elements.namedItem("phone") || {}).value + "\n" +
        "Temat: " + (form.elements.namedItem("topic") || {}).value + "\n\n" +
        (message ? message.value : "");

      window.location.href =
        "mailto:" + email +
        "?subject=" + encodeURIComponent("Zapytanie ze strony Mitra") +
        "&body=" + encodeURIComponent(body);

      setStatus(
        "Otwieram Twój program pocztowy… Jeśli się nie uruchomi, napisz na " + email + ".",
        "is-ok"
      );
    }

    form.addEventListener("submit", function (event) {
      var bot = form.querySelector('input[name="botcheck"]');
      if (bot && bot.checked) {
        event.preventDefault();
        setStatus("Dziękuję! Wiadomość została wysłana.", "is-ok");
        return;
      }

      var key = keyField ? keyField.value.trim() : "";

      if (!key || key.indexOf("WKLEJ") === 0) {
        event.preventDefault();
        mailtoFallback();
        return;
      }

      event.preventDefault();
      if (submit) submit.disabled = true;
      setStatus("Wysyłam wiadomość…", null);

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok || !result.data.success) {
            throw new Error((result.data && result.data.message) || "Błąd wysyłki");
          }
          form.reset();
          setStatus("Dziękuję! Wiadomość została wysłana — odezwę się w ciągu 1–2 dni.", "is-ok");
        })
        .catch(function () {
          setStatus(
            "Nie udało się wysłać formularza. Napisz bezpośrednio na " +
              (form.getAttribute("data-email") || "kontakt@twojadomena.pl") + ".",
            "is-error"
          );
        })
        .finally(function () {
          if (submit) submit.disabled = false;
        });
    });
  }
})();
