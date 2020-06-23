import { PiNamedElement } from "../language";

// tag::stdlib-interface[]
export interface PiStdlib {
    elements: PiNamedElement[]

// end::stdlib-interface[]
// tag::stdlib-interface[]
    /**
     * Returns the element named 'name', if it can be found in this library.
     * When 'metatype' is provided, the element is only returned when it is
     * an instance of this metatype.
     * @param name
     * @param metatype
     */
    find(name: string, metatype?: string) : PiNamedElement;
}
// end::stdlib-interface[]
