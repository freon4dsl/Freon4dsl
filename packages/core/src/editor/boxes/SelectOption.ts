import { FreAction } from "../actions";

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
