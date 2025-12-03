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
	searchTextDialogVisible: false,
	searchElementDialogVisible: false,
	selectViewsDialogVisible: false,
	// for the help dialog
	aboutDialogVisible: false,
});

// indicates whether the application is initializing
export const initializing = $state({ value: true });

export const inDevelopment = $state({ value: true });

export function dialogClosed() {
	// for handling models
	dialogs.startDialogVisible = false;
	dialogs.newModelDialogVisible = false;
	dialogs.openModelDialogVisible = false;
	dialogs.deleteModelDialogVisible = false;
	dialogs.renameModelDialogVisible = false;
	dialogs.importDialogVisible = false;
		// for handling units
	dialogs.newUnitDialogVisible = false;
	dialogs.openUnitDialogVisible = false;
	dialogs.deleteUnitDialogVisible = false;
	dialogs.renameUnitDialogVisible = false;
		// for editor actions
	dialogs.findTextDialogVisible = false;
	dialogs.findStructureDialogVisible = false;
	dialogs.searchTextDialogVisible = false;
	dialogs.searchElementDialogVisible = false;
	dialogs.selectViewsDialogVisible = false;
		// for the help dialog
	dialogs.aboutDialogVisible = false;
}
