import { FretExp } from "./FretExp.js";

export class FretSelfExp extends FretExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretSelfExp>): FretSelfExp {
        const result: FretSelfExp = new FretSelfExp();
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretSelfExp"; // holds the metatype in the form of a string

    toFreString(): string {
        return `self`;
    }

    baseSource(): FretExp {
        return this;
    }
}
