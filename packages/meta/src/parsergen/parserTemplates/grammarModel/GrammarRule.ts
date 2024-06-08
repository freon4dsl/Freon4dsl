export abstract class GrammarRule {
    ruleName: string;

    toGrammar(): string {
        return `GrammarRule.toGrammar() should be implemented by its subclasses.`;
    }

    // @ts-ignore
    // error TS6133: 'mainAnalyserName' is declared but its value is never read.
    // This error is ignored because this parameter is only used by subclasses.
    toMethod(mainAnalyserName: string): string {
        return `GrammarRule.toMethod() should be implemented by its subclasses.`;
    }
}
