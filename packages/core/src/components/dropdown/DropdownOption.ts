import { SelectOption } from "../../boxes/SelectOption";

export function findOption(options: SelectOption[], matching: string): number {
  let index = options.findIndex(o => o.label.startsWith(matching));
  return index;
}

export function findExactOption(
  options: SelectOption[],
  matching: string | null
): number {
  let index = options.findIndex(o => o.label === matching);
  return index;
}

export function findExactOptionId(
  options: SelectOption[],
  matching: string | null
): number {
  let index = options.findIndex(o => o.id === matching);
  return index;
}

export function filterOptions(
  options: SelectOption[],
  matching: string
): SelectOption[] {
  return options.filter(o => matches(o.label, matching));
}

function matches(key: string, text: string): boolean {
  return key.startsWith(text);
}
