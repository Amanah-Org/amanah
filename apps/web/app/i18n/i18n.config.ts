/**
 * Arabic has six plural forms (CLDR): zero, one, two, few (3–10), many (11–99), other.
 * Arabic messages that take a count list all six, separated by `|`, in that order.
 * vue-i18n's default rule only knows English-style singular/plural.
 */
function arabicPluralIndex(choice: number, choicesLength: number) {
  if (choicesLength < 6) return choice === 1 ? 0 : 1;
  const n = Math.abs(choice);
  const mod100 = n % 100;
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;
  if (mod100 >= 3 && mod100 <= 10) return 3;
  if (mod100 >= 11 && mod100 <= 99) return 4;
  return 5;
}

export default defineI18nConfig(() => ({
  pluralRules: {
    ar: arabicPluralIndex,
  },
}));
