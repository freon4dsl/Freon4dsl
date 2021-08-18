import {Writable, writable} from 'svelte/store';

// info about ProjectIt
export const versionNumber = "0.1.1";

// a constant used to name new items, also used in ...Environment.newModel()
export let unnamed: string = "<unnamed>";

// info about the language
export let unitTypes: Writable<string[]> = writable<string[]>([]);
export let fileExtensions: Writable<string[]> = writable<string[]>([]);
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

// export let theme: Writable<string> = writable<string>('light');
// export const darkTheme = {
//     // colors defined in terms of ProjectIt colors
//     '--color': 'var(--pi-lightblue)',
//     '--inverse-color': 'var(--pi-darkblue)',
//     '--bg-app-bar': 'var(--pi-lightblue)',
//     '--bg-color': 'var(--pi-darkblue)',
//     '--bg-panel': 'var(--pi-darkblue)',
//     '--divider': 'var(--pi-lightblue)',
//     '--primary': 'var(--pi-lightblue)',
//     '--list-divider': 'var(--pi-lightblue)',
//     // other colors
//     '--alternate': '#000',
//     '--secondary': 'lightgrey',
//     '--accent': '#ff6fab',
//     '--bg-popover': '#3f3f3f',
//     '--border': '#555',
//     '--label': 'rgba(255,255,255,0.5)',
//     '--bg-input-filled': 'rgba(255,255,255,0.1)',
//     '--focus-color': 'rgba(62, 166, 255, 0.5)', // primary with alpha
// };

export let miniWindow: Writable<boolean> = writable<boolean>(false);

export let leftPanelVisible: Writable<boolean> = writable<boolean>(false);
export let rightPanelVisible: Writable<boolean> = writable<boolean>(false);

export let newModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export let openModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export let newUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export let openUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export let saveUnitDialogVisible: Writable<boolean> = writable<boolean>(false);
export let nameModelDialogVisible: Writable<boolean> = writable<boolean>(false);
export let deleteUnitDialogVisible: Writable<boolean> = writable<boolean>(false);





