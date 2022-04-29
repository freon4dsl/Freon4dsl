// Because the library svelte-mui does not support the use of 'class=...' to change the style settings of menus and menu items,
// we set the style using these constants.

export const menuItemStyle: string = "font-size: var(--pi-menuitem-font-size); margin: 4px 10px; padding: 2px; height: 28px;";
export const menuStyle: string = "border-radius: 2px; background-color: var(--theme-colors-inverse_color)";
export const textFieldStyle: string = "--label: var(--theme-colors-divider); --color: var(--theme-colors-color)";
export const infoPanelStyle: string = "--bg-color: var(--theme-colors-bg_color); font-size: var(--pi-error-font-size); max-width: 100% ";
export const dialogStyle: string = "width:var(--pi-dialog-width); --bg-panel: var(--theme-colors-inverse_color); --divider:var(--theme-colors-color)";
