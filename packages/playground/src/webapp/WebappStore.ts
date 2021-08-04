import {Writable, writable} from 'svelte/store';

// info about ProjectIt
export const versionNumber = "0.1.1";

// a constant used to name new items, also used in ...Environment.newModel()
export const unnamed: string = "<unnamed>";

// info about the language
export let unitTypes: Writable<string[]> = writable<string[]>([]);
export let languageName: Writable<string> = writable<string>("");

// info about the model and model unit shown
export let currentModelName: Writable<string> = writable<string>('<unnamed>');
export let currentUnitName: Writable<string> = writable<string>('<unnamed>');

// info about all models stored on the server
export let modelNames: Writable<string[]> = writable<string[]>([]);
export let unitNames: Writable<string[]> = writable<string[]>([]);

// info about the error in the working of the webapp that needs to be shown to the user
// this is shown in a snackbar on top of the page, and should not be confused
// with the errors on the content of the editor
export let errorMessage: Writable<string> = writable<string>('');
export let showError: Writable<boolean> = writable<boolean>(false);

// severity can range from 0 to 4
// 0 means information
// 1 means hint
// 2 means warning
// 3 means error
export enum severityType {
    info = 0,
    hint = 1,
    warning = 2,
    error= 3
}
export let severity: Writable<number> = writable<number>(severityType.error);

export const theme: Writable<string> = writable<string>('light');
export const darkTheme = {
    // colors defined in terms of ProjectIt colors
    '--color': 'var(--pi-lightblue)',
    '--inverse-color': 'var(--pi-darkblue)',
    '--bg-app-bar': 'var(--pi-lightblue)',
    '--bg-color': 'var(--pi-darkblue)',
    '--bg-panel': 'var(--pi-darkblue)',
    '--list-divider': 'var(--pi-lightblue)',
    // other colors
    '--alternate': '#000',
    '--primary': '#3ea6ff',
    '--accent': '#ff6fab',
    '--divider': 'rgba(255,255,255,0.175)',
    '--bg-popover': '#3f3f3f',
    '--border': '#555',
    '--label': 'rgba(255,255,255,0.5)',
    '--bg-input-filled': 'rgba(255,255,255,0.1)',
    '--focus-color': 'rgba(62, 166, 255, 0.5)', // primary with alpha
};

export const miniWindow: Writable<boolean> = writable<boolean>(false);

export const leftPanelVisible: Writable<boolean> = writable<boolean>(false);
export const rightPanelVisible: Writable<boolean> = writable<boolean>(false);

export const newModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export const openModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export const newUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export const openUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export const saveUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export const nameModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export const deleteUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export const helpDialogVisible: Writable<boolean> = writable<boolean>(false);
export const aboutDialogVisible: Writable<boolean> = writable<boolean>(false);
export const keybindingsDialogVisible: Writable<boolean> = writable<boolean>(false);




