"use client";

import { Moon, Sun } from "@phosphor-icons/react";

type Tema = "light" | "dark";

const KUNCI_TEMA = "ionowu-theme";

function terapkanTema(tema: Tema) {
  document.documentElement.dataset.theme = tema;
  document.documentElement.style.colorScheme = tema;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) {
    const warna = getComputedStyle(document.documentElement)
      .getPropertyValue("--browser-theme-color")
      .trim();
    if (warna) meta.content = warna;
  }
}

export function ThemeToggle({ label }: { label: string }) {
  function handleClick() {
    const temaSaatIni: Tema =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const berikutnya: Tema = temaSaatIni === "light" ? "dark" : "light";
    terapkanTema(berikutnya);
    try {
      localStorage.setItem(KUNCI_TEMA, berikutnya);
    } catch {
      // Browser private mode bisa menolak localStorage. Tema tetap aktif
      // untuk sesi saat ini lewat atribut data-theme.
    }
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={handleClick}
      className="glass inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors duration-mid ease-out hover:text-accent"
    >
      <Moon className="theme-toggle-moon" size={19} weight="light" aria-hidden />
      <Sun className="theme-toggle-sun" size={19} weight="light" aria-hidden />
    </button>
  );
}
