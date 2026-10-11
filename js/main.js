// Montebilans – zajednička skripta
document.documentElement.classList.remove('no-js');

// Meni na telefonu
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('glavni-meni');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const otvoren = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!otvoren));
    menu.classList.toggle('open', !otvoren);
  });
}

// Padajući meni "Usluge"
document.querySelectorAll('.dropdown').forEach((dropdown) => {
  const dugme = dropdown.querySelector('.dropdown-toggle');
  dugme.addEventListener('click', (e) => {
    e.stopPropagation();
    const otvoren = dropdown.classList.toggle('open');
    dugme.setAttribute('aria-expanded', String(otvoren));
  });
});
document.addEventListener('click', (e) => {
  document.querySelectorAll('.dropdown.open').forEach((d) => {
    if (!d.contains(e.target)) {
      d.classList.remove('open');
      d.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
    }
  });
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.dropdown.open').forEach((d) => {
    d.classList.remove('open');
    const dugme = d.querySelector('.dropdown-toggle');
    dugme.setAttribute('aria-expanded', 'false');
    dugme.focus();
  });
});

// Dugme "na vrh"
const naVrh = document.querySelector('.na-vrh');
if (naVrh) {
  const provjeri = () => naVrh.classList.toggle('vidljivo', window.scrollY > 400);
  window.addEventListener('scroll', provjeri, { passive: true });
  provjeri();
  naVrh.addEventListener('click', () => {
    window.scrollTo({ top: 0 });
    naVrh.blur();
  });
}

// Tekuća godina u podnožju
document.querySelectorAll('[data-godina]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// Pojavljivanje sekcija i brojači pri skrolu
const smanjenoKretanje = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animirajBroj(el) {
  const cilj = el.dataset.do === 'godine'
    ? new Date().getFullYear() - Number(el.dataset.od)
    : Number(el.dataset.do);
  const sufiks = el.dataset.sufiks || '';
  if (smanjenoKretanje) { el.textContent = cilj + sufiks; return; }
  const trajanje = 1600;
  const start = performance.now();
  const korak = (sad) => {
    const t = Math.min((sad - start) / trajanje, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(cilj * ease) + sufiks;
    if (t < 1) requestAnimationFrame(korak);
  };
  requestAnimationFrame(korak);
}

if ('IntersectionObserver' in window) {
  const posmatrac = new IntersectionObserver((stavke) => {
    stavke.forEach((stavka) => {
      if (!stavka.isIntersecting) return;
      stavka.target.classList.add('vidljivo');
      stavka.target.querySelectorAll('[data-do]').forEach(animirajBroj);
      posmatrac.unobserve(stavka.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.pojava').forEach((el) => posmatrac.observe(el));
} else {
  document.querySelectorAll('.pojava').forEach((el) => el.classList.add('vidljivo'));
  document.querySelectorAll('[data-do]').forEach(animirajBroj);
}

// Kontakt forma (Web3Forms)
const EN = document.documentElement.lang === 'en';
const PORUKE = EN ? {
  ceka: 'Please wait...',
  ok: 'Your message has been sent! We will get back to you soon.',
  greska: 'Something went wrong. Please try again.',
  mreza: 'Something went wrong. Check your internet connection and try again.',
} : {
  ceka: 'Molimo sačekajte...',
  ok: 'Poruka je uspješno poslata! Javićemo vam se uskoro.',
  greska: 'Došlo je do greške. Pokušajte ponovo.',
  mreza: 'Došlo je do greške. Provjerite internet vezu i pokušajte ponovo.',
};
const forma = document.getElementById('kontakt-forma');
if (forma) {
  const rezultat = document.getElementById('forma-rezultat');
  const dugme = forma.querySelector('button[type="submit"]');

  forma.addEventListener('submit', async (e) => {
    e.preventDefault();
    rezultat.className = 'forma-rezultat';
    rezultat.textContent = PORUKE.ceka;
    dugme.disabled = true;

    try {
      const odgovor = await fetch(forma.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(forma))),
      });
      const json = await odgovor.json();
      if (odgovor.ok && json.success !== false) {
        rezultat.classList.add('ok');
        rezultat.textContent = PORUKE.ok;
        forma.reset();
      } else {
        rezultat.classList.add('greska');
        rezultat.textContent = json.message || PORUKE.greska;
      }
    } catch {
      rezultat.classList.add('greska');
      rezultat.textContent = PORUKE.mreza;
    } finally {
      dugme.disabled = false;
    }
  });
}
