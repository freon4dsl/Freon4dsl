/**
 * Provides unique identifiers for nodes or boxes.
 */
export interface IdProvider {
    /**
     * Return a new (unused) id.
     */
    newId(): string;

    /**
     * Tell the Id provider that `id` has been used for a node.
     * @param id
     */
    usedId(id: string): void;

    /**
     * Reset the id provider, used for testing when ID's should be predictable.
     */
    reset(): void
}
