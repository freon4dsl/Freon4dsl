import { FretExp } from "./FretExp";

export class FretFunctionCallExp extends FretExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretFunctionCallExp>): FretFunctionCallExp {
        const result = new FretFunctionCallExp();
        if (!!data.calledFunction) {
            result.calledFunction = data.calledFunction;
        }
        if (!!data.actualParameters) {
            data.actualParameters.forEach(x => result.actualParameters.push(x));
        }
        if (!!data.__returnType) {
            result.__returnType = data.__returnType;
        }
        if (!!data.returnType) {
            result.returnType = data.returnType;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "FretFunctionCallExp"; // holds the metatype in the form of a string

    calledFunction: string;
    actualParameters: FretExp[] = [];

    toFreString(): string {
        return `${this.calledFunction}( ${this.actualParameters.map((arg => arg.toFreString())).join(", ")} )`;
    }

    baseSource(): FretExp {
        return super.baseSource();
    }
}
