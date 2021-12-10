export abstract class GrammarRule {
    ruleName: string;

    toGrammar(): string {
        return `GrammarRule.toGrammar() should be implemented by its subclasses.`;
    }

    toMethod(mainAnalyserName: string): string {
        return `GrammarRule.toMethod() should be implemented by its subclasses.`;
    }
}
