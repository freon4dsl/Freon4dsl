export const drawerHidden = $state({
	value: true,
});

export const dialogs = $state({
	// variables for the FileMenu
	openModelDialogVisible: false,
	deleteModelDialogVisible: false,
	deleteUnitDialogVisible: false,
	newUnitDialogVisible: false,
	renameUnitDialogVisible: false,
	// variables for the EditMenu
	findTextDialogVisible: false,
	findStructureDialogVisible: false,
	findNamedDialogVisible: false,
	// variables for the ToolMenu
	selectViewsDialogVisible: false,
	// variables for the HelpButton
	helpDialogVisible: false,
});

// indicates whether the application is initializing
export const initializing = $state({ value: true });
