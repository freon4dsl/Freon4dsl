import {Writable, writable} from 'svelte/store';

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
