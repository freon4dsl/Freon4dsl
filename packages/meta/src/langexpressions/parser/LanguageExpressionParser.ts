import type { FreMetaLanguage } from '../../languagedef/metalanguage/index.js';
import { FileUtil } from "../../utils/file-utils/index.js"
import type { ParseLocation } from '../../utils/no-dependencies/index.js';
import { FreLangExpressionChecker } from "../checking/FreLangExpressionChecker.js";
import type { LanguageExpressionTester } from "./LanguageExpressionTester.js";
import { parse } from "./ExpressionGrammar.js";
import { setCurrentFileName } from "./ExpressionCreators.js";
import fs from 'fs';
import type { Checker} from '../../utils/basic-dependencies/index.js';
import { LOG2USER, ParseLocationUtil } from '../../utils/basic-dependencies/index.js';
import type { parser } from 'peggy';

// These classes are helpers to test the parsing and checking of expressions over the metamodel.
// They are not used in the actual generation.

function isPegjsError(object: any): object is parser.SyntaxError {
    return "location" in object;
}

export class LanguageExpressionParser {
    public language: FreMetaLanguage;
    parseFunction: (input: string) => LanguageExpressionTester;
    checker: Checker<LanguageExpressionTester>;

    constructor(language: FreMetaLanguage) {
        this.parseFunction = parse;
        this.language = language;
        this.checker = new FreLangExpressionChecker(this.language);
    }

    parse(definitionFile: string): LanguageExpressionTester | undefined {
        // LOG2USER.log("FreGenericParser.Parse: " + definitionFile);
        // Check if language file exists
        if (!FileUtil.exists(definitionFile)) {
            LOG2USER.error("definition file '" + definitionFile + "' does not exist, exiting.");
            throw new Error("file '" + definitionFile + "' not found.");
        }
        const langSpec: string = fs.readFileSync(definitionFile, { encoding: "utf8" });
        // console.log("FreGenericParser.Parse langSpec: " + langSpec)
        // remove warnings from previous runs
        this.checker.warnings = [];
        // clean the error list from the creator functions
        this.cleanNonFatalParseErrors();
        // parse definition file
        let model: LanguageExpressionTester | undefined = undefined;
        try {
            this.setCurrentFileName(definitionFile); // sets the filename in the creator functions to the right value
            model = this.parseFunction(langSpec);
            // console.log("FreGenericParser.Parse model: " + langSpec)
        } catch (e: unknown) {
            if (isPegjsError(e)) {
                // syntax error
                const errorLoc: ParseLocation = {
                    filename: definitionFile,
                    start: e.location.start,
                    end: e.location.end,
                };
                const errorstr: string = `${e}
                ${e.location && e.location.start ? ParseLocationUtil.locationPlus(definitionFile, errorLoc) : ``}`;
                LOG2USER.error(errorstr);
                throw new Error("syntax error: " + errorstr);
            } else {
                LOG2USER.error("LangExpParser.Parse unknown error: " + e);
            }
        }

        if (!!model) {
            // run the checker
            this.runChecker(model);
        }

        // return the model
        return model;
    }

    //@ts-ignore
    private runChecker(model: LanguageExpressionTester) {
        if (model !== undefined && model !== null) {
            this.checker.errors = [];
            this.checker.check(model);
            // this.checker.check makes errorlist empty, thus we must
            // add the non-fatal parse errors after the call
            this.checker.errors.push(...this.getNonFatalParseErrors());
            if (this.checker.hasErrors()) {
                this.checker.errors.forEach((error) => LOG2USER.error(`${error}`));
                throw new Error("checking errors (" + this.checker.errors.length + ").");
            }
            if (this.checker.hasWarnings()) {
                this.checker.warnings.forEach((warn) => LOG2USER.warning(`Warning: ${warn}`));
            }
        } else {
            throw new Error("parser does not return a language definition.");
        }
    }

    // error TS6133: 'submodels' is declared but its value is never read.
    // This error is ignored because this class is only used for tests.
    // @ts-ignore
    protected merge(submodels: LanguageExpressionTester[]): LanguageExpressionTester | undefined {
        // no need to merge submodels, LanguageExpressionTester is only used for tests
        return undefined;
    }

    protected setCurrentFileName(file: string) {
        setCurrentFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }

    protected cleanNonFatalParseErrors() {}
}
