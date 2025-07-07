import { FreMetaLangElement } from './internal.js';


/**
 * Implementation for a (named) reference in Freon.
 * Reference can be set with either a referred object, or with a name.
 */
export class MetaElementReference<T extends FreMetaLangElement> {
    public static create<T extends FreMetaLangElement>(name: string | T): MetaElementReference<T> {
        const result: MetaElementReference<T> = new MetaElementReference<T>();
        if (typeof name === "string") {
            result.name = name;
        } else if (typeof name === "object") {
            result.referred = name;
            result.name = result.referred.name;
        }
        return result;
    }

    name: string;
    // Some properties defined here are marked @ts-ignore to avoid the error:
    // TS2564: ... has no initializer and is not definitely assigned in the constructor.
    // These properties need to be undefined during parsing and checking. After the checking process
    // has been executed without errors, we can assume that these properties are initialized.

    // @ts-ignore
    referred: T;
    // @ts-ignore
    public owner: FreMetaDefinitionElement;
    // @ts-ignore
    public location: ParseLocation;
    // @ts-ignore
    public aglParseLocation: FreParseLocation;

    private constructor() {
        this.name = 'unknown';
    }
}
