import { FreAction } from "../actions/index.js";
import type { FreNamedNode } from '../../ast/index.js';

/**
 * Describes an option in a dropdown
 */
export interface SelectOption {
    /**
     *  Unique id used to distinguish options in selection lists.
     */
    id: string;
    /**
     * The text as shown to the user, usually also the text that the user needs to type.
     */
    label: string;
    /**
     * Extra text shown to the user, usually something like 'from Unit1.partA'.
     */
    additional_label?: string;
    /**
     * The node to use to set a FreNodeReference when using a name might be ambiguous.
     */
    node?: FreNamedNode;
    /**
     * The action to be executed when this option is selected.
     */
    action?: FreAction;
    /**
     * A more verbose description, keep this to a single short line.
     */
    description?: string;
}

/**
 * Describes a selection by the user
 */
export interface SelectedOption {
    /**
     * The text that the user has typed,
     */
    selectText: string;
    /**
     * The option that the user has selected.
     */
    option: SelectOption;
}

export function findOption(options: SelectOption[], id: string): SelectOption | null {
    const index = options.findIndex((option) => option.label === id);
    return index === -1 ? null : options[index];
}
