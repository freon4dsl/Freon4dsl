/**
 * Provides unique identifiers for nodes or boxes.
 *
 * @see FreUtils.BOX_ID
 * @see FreUtils.ID
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
}
