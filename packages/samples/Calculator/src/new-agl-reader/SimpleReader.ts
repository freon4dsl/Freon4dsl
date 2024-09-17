import { CalculatorModelGrammarStr } from "./CalculatorModelGrammar";
import { SimpleSpptWalker } from "./SimpleSpptWalker";
import * as AGL from "net.akehurst.language-agl-processor";
import { SimpleSpptVisitor } from "./SimpleSpptVisitor";

export class SimpleReader {
    grammar: string = CalculatorModelGrammarStr;
    readFromString(sentence: string): string {
        // generate the parser from the grammar
        let res: AGL.LanguageProcessorResult<any, any> = AGL.Agl.getInstance().processorFromString(this.grammar);
        this.check(res.issues.errors, true);
        this.check(res.issues.warnings, false);

        // get the actual parser from the LanguageProcessorResult
        let proc: AGL.LanguageProcessor<any, any>;
        proc = res.processor;
        if (!proc) {
            throw new Error("processor not found")
        }

        // use the parser to parse the input param 'sentence'
        let pres: AGL.ParseResult = proc.parse(sentence);
        this.check(pres.issues.errors, true);

        // get the parse tree from the parser
        let sppt: AGL.SharedPackedParseTree = pres.sppt;
        if (!sppt) {
            throw new Error("sppt not found")
        }

        // walk the parse tree
        let walker: SimpleSpptWalker = new SimpleSpptWalker();
        sppt.traverseTreeDepthFirst(walker, false)
        return '';

        // or visit the parse tree ??
        let visitor: SimpleSpptVisitor = new SimpleSpptVisitor();
        visitor.visitTree(sppt, null);
    }

    private check(issuesList, abortIfFalse: boolean) {
        if (!!issuesList && issuesList.toArray().length > 0) {
            let text: string = "GRAMMAR ERROR";
            if (!abortIfFalse) {
                text = "GRAMMAR WARNING"
            }
            console.log(`${issuesList.toArray().map(warn => `${text}: ${warn.message}`).join("\n")}`)
            if (abortIfFalse) throw new Error(issuesList.toArray().map(warn => warn.message).join("\n"));
        }
    }
}
