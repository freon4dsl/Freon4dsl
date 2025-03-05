import type {ModelUnitIdentifier} from '@freon4dsl/core';

export interface ServerInfo {
	allModelNames: string[]
}
export interface UnitInfo {
	name: string;
	id: string;
	type: string;
}
export interface EditorInfo {
	// name of the currently shown model
	modelName: string;
	// identifiers of all units in the model
	unitIds: UnitInfo[];
	// id of the unit that is currently shown in the editor
	currentUnit: UnitInfo | undefined;
	// id of a unit that is to be renamed
	toBeRenamed: ModelUnitIdentifier | undefined;
	// id of a unit that is to be deleted
	toBeDeleted: ModelUnitIdentifier | undefined;
	// info on unit that is about to be created
	toBeCreated: UnitInfo | undefined;
}

//================

export const serverInfo: ServerInfo = $state({
	allModelNames: []
})

export const editorInfo: EditorInfo = $state({
	modelName: 'aModel',
	unitIds: [],
	currentUnit: undefined,
	toBeRenamed: undefined,
	toBeDeleted: undefined,
	toBeCreated: undefined
})

export let progressIndicatorShown = $state({ value: false });
export let noUnitAvailable = $state({ value: true });
