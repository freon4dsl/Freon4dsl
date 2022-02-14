import * as fs from "fs";
import { Checker } from "./Checker";
import { Parser } from "pegjs";
import { LOG2USER } from "./UserLogger";
import { PiDefinitionElement } from "./PiDefinitionElement";

// the following two types are used to store the location information from the parser
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

/**
 * Generic Parser, subclasses need to initialize the parser, checker and msg fields.
 */
export class PiParser<DEFINITION> {
    parser: Parser;
    checker: Checker<DEFINITION>;

    parse(definitionFile: string): DEFINITION {
        // Check if language file exists
        if (!fs.existsSync(definitionFile)) {
            LOG2USER.error("definition file '" + definitionFile + "' does not exist, exiting.");
            throw new Error("file not found.");
        }
        const langSpec: string = fs.readFileSync(definitionFile, { encoding: "utf8" });

        // clean the error list from the creator functions
        this.cleanNonFatalParseErrors();
        // parse definition file
        let model: DEFINITION = null;
        try {
            this.setCurrentFileName(definitionFile); // sets the filename in the creator functions to the right value
            model = this.parser.parse(langSpec);
        } catch (e) {
            // syntax error
            const errorstr = `${e} 
                ${e.location && e.location.start ?
                    Checker.locationPlus(definitionFile, e.location)
                :
                    ``}`;
            LOG2USER.error(errorstr);
            throw new Error("syntax error: " + errorstr);
        }

        // run the checker
        this.runChecker(model);

        // return the model
        return model;
    }

    parseMulti(filePaths: string[]): DEFINITION {
        let model: DEFINITION;
        let submodels: DEFINITION[] = [];

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
                } catch (e) {
                    // throw syntax error, but adjust the location first
                    // to avoid a newline in the output, we do not put this if-stat in a smart string
                    let location: string = "";
                    if (e.location && e.location.start) {
                        location = Checker.locationPlus(file, e.location);
                    }
                    const errorstr = `${e.message.trimEnd()} ${location}`;
                    LOG2USER.error(errorstr);
                    throw new Error("syntax error: " + errorstr);
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
            this.checker.check(model);
            // this.checker.check makes errorlist empty, thus we must
            // add the non fatal parse errors after the call
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
            throw Error("PiParser.merge should be implemented by its subclasses.");
        }
        return null;
    }

    protected setCurrentFileName(file: string) {
        throw Error("PiParser.setCurrentFileName should be implemented by its subclasses.");
    }

    protected getNonFatalParseErrors(): string[] {
        throw Error("PiParser.getNonFatalParseErrors should be implemented by its subclasses.");
    }

    protected cleanNonFatalParseErrors() {
        // throw Error("PiParser.cleanNonFatalParseErrors should be implemented by its subclasses.");
    }

    protected location(elem: PiDefinitionElement): string {
        if (!!elem.location) {
            return `[file: ${elem.location.filename}, line: ${elem.location.start.line}, column: ${elem.location.start.column}]`;
        }
        return `[no location]`;
    }
}
