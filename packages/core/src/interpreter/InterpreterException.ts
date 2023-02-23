/**
 * Used to throw errors in the interpreter
 */
export class InterpreterError extends Error {
    readonly _type = "InterpreterError";

    constructor(message: string) {
        super(message);
    }

    get message(): string {
        return this.message;
    }

    toString(): string {
        return this.message;
    }
}

export function isRtError(obj: any): obj is InterpreterError {
    return obj instanceof InterpreterError;
}
