import type { FreUnitIdentifier } from '@freon4dsl/core';

export interface ServerInfo {
	allModelNames: string[]
}
export interface EditorInfo {
	// name of the currently shown model
	modelName: string;
	// identifiers of all units in the model
	unitIds: FreUnitIdentifier[];
	// identifiers of all units that are currently open in tabs
	unitsInTabs: FreUnitIdentifier[];
	// the number of the tab that shows the editor with 'currentUnit'
	currentOpenTab: number;
	// id of the unit that is currently shown in the editor
	currentUnit: FreUnitIdentifier | undefined;
	// id of a unit that is to be renamed
	toBeRenamed: FreUnitIdentifier | undefined;
	// id of a unit that is to be deleted
	toBeDeleted: FreUnitIdentifier | undefined;
	// info on unit that is about to be created
	toBeCreated: FreUnitIdentifier | undefined;
}

//================

export const serverInfo: ServerInfo = $state({
	allModelNames: []
})

export const editorInfo: EditorInfo = $state({
	modelName: '<no-model>',
	unitIds: [],
	unitsInTabs: [],
	currentOpenTab: -1,
	currentUnit: undefined,
	toBeRenamed: undefined,
	toBeDeleted: undefined,
	toBeCreated: undefined
})

export function resetEditorInfo() {
	editorInfo.modelName = '<no-model>';
	editorInfo.unitsInTabs = [];
	editorInfo.unitIds = [];
	editorInfo.currentOpenTab = -1;
	editorInfo.currentUnit = undefined;
	editorInfo.toBeRenamed = undefined;
	editorInfo.toBeDeleted = undefined;
	editorInfo.toBeCreated = undefined;
    
    noUnitAvailable.value = true
}

export function indexForTab(unit: FreUnitIdentifier): number {
	// console.log("indexForTab: " + JSON.stringify(unit));

	for (let index = 0; index < editorInfo.unitsInTabs.length; index++) {
		const uid = editorInfo.unitsInTabs[index];
		// console.log("    comparing with: " + JSON.stringify(uid));

		if (uid.id === unit.id && uid.name === unit.name && uid.type === unit.type) {
			// console.log('RESULT: ' + index);
			return index;
		}
	}

	return -1;
}

export const progressIndicatorShown = $state({ value: false });
export const noUnitAvailable = $state({ value: true });
