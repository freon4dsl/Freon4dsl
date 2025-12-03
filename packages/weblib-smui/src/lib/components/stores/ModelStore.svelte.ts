// info about the model and model unit shown
import type {UnitInfo, UnitList} from "$lib/components/stores/StoreInterfaces";

export let currentModelName = $state({ value: '' });
export let noUnitAvailable = $state({ value: true });
export let editorProgressShown= $state({ value: true });
export let unsavedChanges = $state({ value: true }); // TODO set this value somewhere

export let currentUnit: UnitInfo = $state( {id: undefined, ref: undefined});
export let toBeDeleted: UnitInfo = $state( {id: undefined, ref: undefined});
export let toBeRenamed: UnitInfo = $state( {id: undefined, ref: undefined});

// unitNames holds the names of all units as read form the server. Should be kept in sync with the current model!
// todo now ids are taken, instead of names
export let unitNames: UnitList = $state({ids: [], refs: []});
export let units: UnitList = $state({ids: [], refs: []});
