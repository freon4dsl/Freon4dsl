/**
 * Provides unique identifiers for nodes or boxes.
 *
 * @see FreUtils.BOX_ID
 * @see FreUtils.ID
 */
export interface IdProvider {
    newId(): string;
}
