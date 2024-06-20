import * as fs from "fs";
import { Checker } from "./Checker";
import { Parser, PegjsError } from "pegjs";
import { LOG2USER } from "../UserLogger";
import { FreMetaDefinitionElement } from "../FreMetaDefinitionElement";
import { ParseLocationUtil } from "./ParseLocationUtil";

// The following two types are used to store the location information from the PEGJS parser
// todo rethink how to adjust the errors from the PegJs parser
export type ParseLocation = {
    filename: string;
    start: Location;
    end: Location;
};

export type Location = {
    offset: number;
    line: number;
    column: number;
};

function isPegjsError(object: any): object is PegjsError {
    return 'location' in object;
}

/**
 * This class is used to store the location information from the AGL parser.
 */
export class FreParseLocation {

    static create(data: Partial<FreParseLocation>): FreParseLocation {
        const result = new FreParseLocation();
        if (!!data.filename) {
            result.filename = data.filename;
        }
        if (!!data.line) {
            result.line = data.line;
        }
        if (!!data.column) {
            result.column = data.column;
        }
        return result;
    }
    filename: string;
    line: number;
    column: number;
}

/**
 * Generic Parser, subclasses need to initialize the parser, checker and msg fields.
 */
export class FreGenericParser<DEFINITION> {
    parser: Parser;
    checker: Checker<DEFINITION>;

    parse(definitionFile: string): DEFINITION {
        // Check if language file exists
        if (!fs.existsSync(definitionFile)) {
            LOG2USER.error("definition file '" + definitionFile + "' does not exist, exiting.");
            throw new Error("file '" + definitionFile + "' not found.");
        }
        const langSpec: string = fs.readFileSync(definitionFile, { encoding: "utf8" });

        // clean the error list from the creator functions
        this.cleanNonFatalParseErrors();
        // parse definition file
        let model: DEFINITION = null;
        try {
            this.setCurrentFileName(definitionFile); // sets the filename in the creator functions to the right value
            model = this.parser.parse(langSpec);
        } catch (e: unknown) {
            if (isPegjsError(e)) {
                // syntax error
                const errorLoc: ParseLocation = { filename: definitionFile, start: e.location.start, end: e.location.end };
                const errorstr: string = `${e}
                ${e.location && e.location.start ?
                    ParseLocationUtil.locationPlus(definitionFile, errorLoc)
                    :
                    ``}`;
                LOG2USER.error(errorstr);
                throw new Error("syntax error: " + errorstr);
            }
        }

        // run the checker
        this.runChecker(model);

        // return the model
        return model;
    }

    parseMulti(filePaths: string[]): DEFINITION {
        let model: DEFINITION;
        const submodels: DEFINITION[] = [];

        // clean the error list from the creator functions used by this.parser
        this.cleanNonFatalParseErrors();
        // read the files and parse them separately
        for (const file of filePaths) {
            if (!fs.existsSync(file)) {
                LOG2USER.error("definition file '" + file + "' does not exist, exiting.");
                throw new Error("definition file '" + file + "' does not exist, exiting.");
            } else {
                let langSpec: string = "";
                langSpec += fs.readFileSync(file, { encoding: "utf8" }) + "\n";
                try {
                    this.setCurrentFileName(file); // sets the filename in the creator functions to the right value
                    submodels.push(this.parser.parse(langSpec));
                } catch (e: unknown) {
                    if (isPegjsError(e)) {
                        // throw syntax error, but adjust the location first
                        // to avoid a newline in the output, we do not put this if-stat in a smart string
                        const errorLoc: ParseLocation = { filename: file, start: e.location.start, end: e.location.end };
                        let location: string = "";
                        if (!!e.location && !!e.location.start) {
                            location = ParseLocationUtil.locationPlus(file, errorLoc);
                        }
                        const errorstr = `${e.message.trimEnd()} ${location}`;
                        LOG2USER.error(errorstr);
                        throw new Error("syntax error: " + errorstr);
                    }
                }
            }
        }

        // combine the submodels into one
        model = this.merge(submodels);

        // run the checker
        this.runChecker(model);

        // return the model
        return model;
    }

    private runChecker(model: DEFINITION) {
        if (model !== null) {
            this.checker.errors = [];
            this.checker.warnings = [];
            this.checker.check(model);
            // this.checker.check makes errorlist empty, thus we must
            // add the non-fatal parse errors after the call
            this.checker.errors.push(...this.getNonFatalParseErrors());
            if (this.checker.hasErrors()) {
                this.checker.errors.forEach(error => LOG2USER.error(`${error}`));
                throw new Error("checking errors (" + this.checker.errors.length + ").");
            }
            if (this.checker.hasWarnings()) {
                this.checker.warnings.forEach(warn => LOG2USER.warning(`Warning: ${warn}`));
            }
        } else {
            throw new Error("parser does not return a language definition.");
        }
    }

    protected merge(submodels: DEFINITION[]): DEFINITION {
        if (submodels.length > 0) {
            throw Error("FreParser.merge should be implemented by its subclasses.");
        }
        return null;
    }

    // @ts-expect-error
    // error TS6133: 'file' is declared but its value is never read.
    // This error is ignored because this implementation is here merely to avoid it being called.
    protected setCurrentFileName(file: string) {
        throw Error("FreParser.setCurrentFileName should be implemented by its subclasses.");
    }

    protected getNonFatalParseErrors(): string[] {
        throw Error("FreParser.getNonFatalParseErrors should be implemented by its subclasses.");
    }

    protected cleanNonFatalParseErrors() {
        // throw Error("FreParser.cleanNonFatalParseErrors should be implemented by its subclasses.");
    }

    protected location(elem: FreMetaDefinitionElement): string {
        if (!!elem.location) {
            return `[file: ${elem.location.filename}:${elem.location.start.line}:${elem.location.start.column}]`;
        }
        return `[no location]`;
    }
}
