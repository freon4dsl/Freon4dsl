export const drawerHidden = $state({
	value: true,
});

export const dialogs = $state({
	startDialogVisible: false,
	newModelDialogVisible: false,
	openModelDialogVisible: false,
	deleteModelDialogVisible: false,
	deleteUnitDialogVisible: false,
	newUnitDialogVisible: false,
	renameUnitDialogVisible: false,
	findTextDialogVisible: false,
	findStructureDialogVisible: false,
	findNamedDialogVisible: false,
	selectViewsDialogVisible: false,
	helpDialogVisible: false,
});

// indicates whether the application is initializing
export const initializing = $state({ value: true });
