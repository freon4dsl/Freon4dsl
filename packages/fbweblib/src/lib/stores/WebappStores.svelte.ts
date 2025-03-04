export const drawerHidden = $state({
	value: true,
});

export const dialogs = $state({
	// for handling models
	startDialogVisible: false,
	newModelDialogVisible: false,
	openModelDialogVisible: false,
	deleteModelDialogVisible: false,
	renameModelDialogVisible: false,
	importDialogVisible: false,
	// for handling units
	newUnitDialogVisible: false,
	openUnitDialogVisible: false,
	deleteUnitDialogVisible: false,
	renameUnitDialogVisible: false,
	// for editor actions
	findTextDialogVisible: false,
	findStructureDialogVisible: false,
	findNamedDialogVisible: false,
	selectViewsDialogVisible: false,
	// for the help dialog
	helpDialogVisible: false,
});

// indicates whether the application is initializing
export const initializing = $state({ value: true });
