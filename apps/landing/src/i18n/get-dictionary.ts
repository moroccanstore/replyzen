import type { Dictionary } from "@/i18n/types";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  fr: () => import("./dictionaries/fr.json").then((module) => module.default),
};

export const getDictionary = async (locale: "en" | "fr") => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};
