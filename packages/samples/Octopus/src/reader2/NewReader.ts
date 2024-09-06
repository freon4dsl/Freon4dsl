import peggy from "peggy";
// import { OctopusModelGrammarStr } from "./OctopusModelGrammar";
// import { grammarStr} from "./JsonGrammar";
// import {grammarStr} from "./JavaScriptGrammar";
import {simpleGrammarStr} from "./SimpleGrammar";
import {GrammarError, Parser, parser } from "pegjs";

function isPegjsError(object: any): object is parser.SyntaxError {
    return "location" in object;
}

export class NewReader {

    readFromString(sentence: string) {
        let parser: Parser;
        try {
            // set allowedStartRules to all possible unit types
            // const allowedStartRules = ["Start"];
            // parser = peggy.generate(grammarStr, {allowedStartRules: allowedStartRules});
            const allowedStartRules = ["UmlPart"];
            // other possibly useful parameters: grammarSource, error, info, warnings
            parser = peggy.generate(simpleGrammarStr, {allowedStartRules: allowedStartRules});
        } catch (e) {
            if (isPegjsError(e)) {
                console.log("SyntaxError: " + e.message + ", line: " + e.location.start.line + ", column: " + e.location.start.column);
            } else if (e instanceof GrammarError) {
                // throws an exception if the grammar is invalid
                console.log("Invalid Grammar: " + e.message + ", line: " + e.location.start.line + ", column: " + e.location.start.column);
            } else if (typeof e.format === "function") {
                    console.log(e.format([
                        {source: './packages/samples/Octopus/readers/OctopusModelGrammar.ts', sentence},
                    ]));
            } else {
                console.log("Other error: "+ e.message);
            }
        }
        try {
            if (!!parser) {
                parser.parse(sentence)
            } else {
                console.log("NO parser")
            }
        } catch (e) {
            if (isPegjsError(e)) {
                console.log("SyntaxError : " + e.message + " [line: " + e.location.start.line + ", column: " + e.location.start.column + "]");
            } else if (typeof e.format === "function") {
                console.log(e.format([
                    {source: 'SimpleGrammar.ts', text: sentence},
                ]));
            }
        }
    }
}
