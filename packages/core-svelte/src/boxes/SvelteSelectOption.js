/**
 * Describes an option in a dropdown
 */
export function findOption(options, id) {
    const index = options.findIndex(option => option.id === id);
    return (index === -1 ? null : options[index]);
}
//# sourceMappingURL=SvelteSelectOption.js.map