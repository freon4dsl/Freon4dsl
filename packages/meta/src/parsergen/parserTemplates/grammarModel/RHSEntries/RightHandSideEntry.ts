export abstract class RightHandSideEntry {
    public isList: boolean = false;
    // addNewLineToGrammar exists solely to be able to manage the layout of the grammar
    // if true we end the grammar string with a newline
    // for this purpose, every subclass needs to call 'doNewline' after
    // the grammar string has been created.
    addNewLineToGrammar: boolean = false;

    doNewline(): string {
        if (this.addNewLineToGrammar) {
            return `\n\t`;
        }
        return ``;
    }

    toGrammar(): string {
        return `RightHandSideEntry.toGrammar() should be implemented by its subclasses.`;
    }

    // @ts-ignore
    // error TS6133: 'depth' is declared but its value is never read.
    // This error is ignored because this parameter is only used by subclasses.
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `RightHandSideEntry.toMethod() should be implemented by its subclasses.`;
    }

    // @ts-ignore
    // error TS6133: 'depth' is declared but its value is never read.
    // This error is ignored because this parameter is only used by subclasses.
    toString(depth: number): string {
        return `RightHandSideEntry.toString() should be implemented by its subclasses.`;
    }

}
