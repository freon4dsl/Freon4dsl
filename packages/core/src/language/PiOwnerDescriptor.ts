import { PiElement } from "./PiElement";

/**
 * This object describes for each PiElement what its `owner` object is (if any),
 * and in which property (propertyName) the PiElement is stored.  If the property is an array,
 * the position in the array is the `propertIndex'
 */
export interface PiOwnerDescriptor {
    owner: PiElement;
    propertyName: string;
    propertyIndex?: number;
}
