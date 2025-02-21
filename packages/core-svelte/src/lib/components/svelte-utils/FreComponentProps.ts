import { type Box, FreEditor, type GridBox, MenuItem, type SelectOption } from '@freon4dsl/core';
import type { CaretDetails } from '$lib/components/svelte-utils/CaretDetails';
import type { TableDetails } from '$lib/components/svelte-utils/TableDetails';

export interface MainComponentProps {
    editor: FreEditor;
}

export interface FreComponentProps<T extends Box> extends MainComponentProps {
    box: T;
}

export interface ContextMenuProps extends MainComponentProps {
    items: MenuItem[];
}

export interface GridCellProps<T extends Box> extends FreComponentProps<T> {
    parentBox: GridBox;
}

export interface TableCellProps<T extends Box> extends FreComponentProps<T> {
    parentComponentId: string;
    parentOrientation: string;
    ondropOnCell: (details: TableDetails) => void;
}

export interface TextComponentProps<T extends Box> extends FreComponentProps<T> {
    // Indication whether this component is currently being edited by the user, needs to be exported for binding in TextDropdownComponent
    isEditing: boolean;
    // Indication whether this text component is part of an TextDropdownComponent
    partOfDropdown: boolean;
    // The text to be displayed, needs to be exported for binding in TextDropdownComponent
    text: string;

    // This function replaces the event handling in version 1.0.0 (for svelte v4). What used to be an event,
    // now is a call to this function, where the param 'eventType' indicates the type of the former event, and
    // 'details' are the information passed by the event.
    // NB Here this function is called 'fromInner', in the child TextComponent it is called 'toParent'.
    toParent: (eventType: string, details?: CaretDetails) => void;
}

export interface DropdownProps {
    options: SelectOption[];
    selected?: SelectOption;
    selectionChanged: (sel: SelectOption) => void;
}
