import { type Box, FreEditor, type GridBox, type SelectOption } from '@freon4dsl/core';
import type { TableDetails } from './TableDetails.js';

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
    readonly?: boolean;
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
 * Properties for a DropdownComponent
 */
export interface DropdownProps {
    allOptions: SelectOption[];
    matchingOptions: SelectOption[]; /* subset of allOptions that include all options that must be shown as matching */
    selected?: SelectOption;
    selectionChanged: (sel: SelectOption) => void;
    filterOptions?: boolean; /* true → shorten the list to matching items
                                false → show all items, but mark the matching ones */
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
