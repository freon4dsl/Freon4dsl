import type { FreModelUnit } from '@freon4dsl/core';

export interface ModelInfo {
	// name of the currently shown model
	modelName: string;
	units: FreModelUnit[];

}

export interface serverInfo {
	allModelNames: string[]
}

export interface EditorInfo {
	currentUnit: FreModelUnit | undefined;
	toBeRenamed: FreModelUnit | undefined;
	toBeDeleted: FreModelUnit | undefined;
}

//================

export const modelInfo: ModelInfo = $state({
	modelName: 'aModel',
	units: []
})

export const serverInfo: serverInfo = $state({
	allModelNames: []
})
export const editorInfo: EditorInfo = $state({
	currentUnit: undefined,
	toBeRenamed: undefined,
	toBeDeleted: undefined
})

export let progressIndicatorShown = $state({ value: false });
export let noUnitAvailable = $state({ value: true });
