"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_HTML_LANG, localeFromPath } from "@/lib/i18n";

export function LocaleHtmlSync() {
  const pathname = usePathname();

  useEffect(() => {
    const locale = localeFromPath(pathname);
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
  }, [pathname]);

  return null;
}
