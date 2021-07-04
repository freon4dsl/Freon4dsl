/**
 * Describes an option in a dropdown
 */

export type SvelteSelectOption = {
    id: string;
    label: string;
    description?: string;
};

export function findOption(options: SvelteSelectOption[], id: string): SvelteSelectOption | null {
    const index = options.findIndex( option => option.id === id);
    return (index === -1 ? null : options[index]);
}
