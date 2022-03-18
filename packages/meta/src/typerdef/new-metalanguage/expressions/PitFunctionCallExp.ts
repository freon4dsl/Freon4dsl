import { PitExp } from "./PitExp";

export class PitFunctionCallExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitFunctionCallExp>): PitFunctionCallExp {
        const result = new PitFunctionCallExp();
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
    calledFunction: string;
    actualParameters: PitExp[] = [];
    toPiString(): string {
        return `${this.calledFunction}( ${this.actualParameters.map((arg => arg.toPiString())).join(", ")} )`;
    }
}
