// info about the language
import type {stringList} from "$lib/components/stores/StoreInterfaces.js";

// name of the language
export let languageName = $state({ value: "FreLanguage ..."});
// all possible unit types
export let unitTypes: stringList = $state({ list: []});
// all file extensions associated with the model units
export let fileExtensions: stringList = $state({ list: []});
// all possible projections
export let projectionNames: stringList = $state({ list:["default"] });
// the projections that are currently chosen to be shown
export let projectionsShown: stringList = $state({ list:["default"] });
