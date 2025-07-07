export interface LanguageInfo {
  // name of the language
  name: string;
  // names of all model unit types
  unitTypes: string[];
  // all known file extensions
  fileExtensions: string[];
  // all possible projections
  projectionNames: string[];
}

export const langInfo: LanguageInfo = $state({
  name: "FreLanguage ...",
  unitTypes: [] as string[],
  fileExtensions: [] as string[],
  projectionNames: [] as string[],
});
