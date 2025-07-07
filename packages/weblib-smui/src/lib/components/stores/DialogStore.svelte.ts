// info about dialogs: wether they are open or closed

// indicates whether the application is initializing
export let initializing = $state({ value: true });

// variables for the FileMenu
export let openModelDialogVisible = $state({ value: false });
export let deleteModelDialogVisible = $state({ value: false });
export let deleteUnitDialogVisible = $state({ value: false });
export let newUnitDialogVisible = $state({ value: false });
export let renameUnitDialogVisible = $state({ value: false });

// variables for the EditMenu
export let findTextDialogVisible = $state({ value: false });
export let findStructureDialogVisible = $state({ value: false });
export let findNamedDialogVisible = $state({ value: false });

// variables for the HelpButton
export let helpDialogVisible = $state({ value: false });
