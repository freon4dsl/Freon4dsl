import { FreNode } from "./FreNode";

/**
 * This object describes for each FreNode what its `owner` object is (if any),
 * and in which property (propertyName) the FreNode is stored.  If the property is an array,
 * the position in the array is the `propertIndex'
 */
export interface FreOwnerDescriptor {
    owner: FreNode;
    propertyName: string;
    propertyIndex?: number;
}
