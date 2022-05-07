// info about the model and model unit shown
import {writable} from 'svelte/store';
import type { Writable } from 'svelte/store';

export let currentModelName: Writable<string> = writable<string>('Model 42');
export let currentUnitName: Writable<string> = writable<string>('Unit 12');

// todo use PiModelUnit instead of UnitInfo
class UnitInfo {
    type: string;       // the type of the unit, i.e. the metatype of the unit
    name: string;       // name of the unit
}
export let units: Writable<UnitInfo[]> = writable<UnitInfo[]>([
    { name: "Unit 42", type: 'Persons' },
    { name: 'Unit 12', type: 'Persons' },
    { name: 'Unit 99', type: 'Buildings' },
    { name: 'Unit 88', type: 'Persons' },
    { name: 'Unit 77', type: 'Persons' },
    { name: 'Unit 66', type: 'Persons' },
    { name: 'Unit 55', type: 'Persons' },
    { name: 'Unit 44', type: 'Persons' },
    { name: 'Unit 33', type: 'Buildings' },
    { name: 'Unit 22', type: 'Persons' },
    { name: 'Unit 11', type: 'Persons' },
    { name: 'Unit 100', type: 'Buildings' },
    { name: 'Unit Anneke', type: 'Persons' },
    { name: 'Unit Jos', type: 'Buildings' },
]);
// todo make unitNames a function on 'units'
export let unitNames: Writable<string[]> = writable<string[]>(['Unit 42', 'Unit 86', 'Unit 99', 'Unit 88', 'Unit 77', 'Unit 66', 'Unit 55', 'Unit 44', 'Unit 33', 'Unit 22', 'Unit 11', 'Unit 100','Unit Anneke', 'Unit Jos']);
