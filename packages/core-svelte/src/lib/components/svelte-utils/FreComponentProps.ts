import { type Box, FreEditor, type GridBox, MenuItem, type SelectOption } from '@freon4dsl/core';
import type { CaretDetails } from '$lib/components/svelte-utils/CaretDetails';
import type { TableDetails } from '$lib/components/svelte-utils/TableDetails';

/**
 * Properties for the FreonComponent
 */
export interface MainComponentProps {
    editor: FreEditor;
}

/**
 * Properties for most of the components in core-svelte
 */
export interface FreComponentProps<T extends Box> extends MainComponentProps {
    box: T;
}

/**
 * Properties for a GridComponent
 */
export interface GridProps {
    editor: FreEditor;
    box: GridBox;
}

/**
 * Properties for a GridCellComponent
 */
export interface GridCellProps<T extends Box> extends FreComponentProps<T> {
    parentBox: GridBox;
}

/**
 * Properties for a TableCellComponent
 */
export interface TableCellProps<T extends Box> extends FreComponentProps<T> {
    parentComponentId: string;
    parentOrientation: string;
    ondropOnCell: (details: TableDetails) => void;
}
/**
 * Properties for a TextComponent
 */
export interface TextComponentProps<T extends Box> extends FreComponentProps<T> {
    // Indication whether this component is currently being edited by the user, needs to be recursive for binding in TextDropdownComponent
    isEditing: boolean;
    // Indication whether this text component is part of an TextDropdownComponent
    partOfDropdown: boolean;
    // The text to be displayed, needs to be recursive for binding in TextDropdownComponent
    text: string;

    // This function replaces the event handling in version 1.0.0 (for svelte v4). What used to be an event,
    // now is a call to this function, where the param 'eventType' indicates the type of the former event, and
    // 'details' are the information passed by the event.
    // NB Here this function is called 'fromInner', in the child TextComponent it is called 'toParent'.
    toParent: (eventType: string, details?: CaretDetails) => void;
}

/**
 * Properties for a DropdownComponent
 */
export interface DropdownProps {
    options: SelectOption[];
    selected?: SelectOption;
    selectionChanged: (sel: SelectOption) => void;
}

/**
 * Properties for an ErrorTooltip
 */
export interface ErrorProps<T extends Box> extends FreComponentProps<T> {
    hasErr: boolean;
    parentTop: number;
    parentLeft: number;
    children(): any; // replaces slot from Svelte version 4
}
