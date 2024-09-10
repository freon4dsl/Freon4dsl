import { FreMetaLanguage } from "../../languagedef/metalanguage/index.js";
import {LANGUAGE_GEN_FOLDER, Names, FREON_CORE, READER_GEN_FOLDER} from "../../utils/index.js";

export class ReaderTemplate {
    /**
     * Returns a string representation of a generic parser for 'language'. This parser is able
     * to handle every modelunit in the language.
     */
    public generateReader(language: FreMetaLanguage, relativePath: string): string {

        // Template starts here
        return `import { ${Names.FreReader}, ${Names.modelunit()} } from "${FREON_CORE}";
import { parser } from "peggy";
import * as PeggyParser from "${relativePath}${READER_GEN_FOLDER}/${Names.parser(language)}.js";
import { ${Names.classifier(language.modelConcept)} } from "${relativePath}${LANGUAGE_GEN_FOLDER}";
import { setCurrentFileName, resetCurrentFileName } from "${relativePath}${READER_GEN_FOLDER}/${Names.parserHelpers}";

function isPeggyError(object: any): object is parser.SyntaxError {
    return "location" in object;
}

    /**
     * Class ${Names.reader(language)} is a wrapper that enables to parse modelunits.
     */
     export class ${Names.reader(language)} implements ${Names.FreReader} {

    /**
     * Parses 'sentence', using the parse rule for 'metatype', if available.
     * If 'sentence' is correct, a model node of type 'metatype' will be created,
     * otherwise an error wil be thrown containing the parse error.
     * @param sentence      the input string which will be parsed
     * @param metatype      the type of the unit to be created
     * @param model         the model to which the unit will be added
     * @param sourceName    the (optional) name of the source that contains 'sentence'
     */
    readFromString(sentence: string, metatype: string, model: ${Names.classifier(language.modelConcept)}, sourceName?: string): ${Names.modelunit()} {
        if (!!sourceName) {
            setCurrentFileName(sourceName);
        }
        // parse the input
        let unit: ${Names.modelunit()} | undefined = undefined;
        if (typeof PeggyParser.parse === "function") {
            unit = this.internalRead(sentence, metatype);
        }
        if (!!model) {
            this.addToModel(model, unit);
        }
        if (!!sourceName) {
            resetCurrentFileName();
        }
        return unit;
    }

    private addToModel(model: ${Names.classifier(language.modelConcept)}, unit: ${Names.modelunit()}) {
        try {
            if (model.getUnits().filter((existing) => existing.name === unit?.name).length > 0) {
                throw new Error(\`Unit named '\${unit?.name}' already exists.\`);
            } else {
                model.addUnit(unit);
            }
        } catch (e) {
            console.log(e.message);
            throw e;
        }
    }

    private internalRead(sentence: string, unitType: string): ${Names.modelunit()} | undefined {
        try {
            // other possibly useful parameters: grammarSource, error, info, warnings
            return PeggyParser.parse(sentence, {startRule: unitType});
        } catch (e) {
            if (isPeggyError(e)) {
                console.log("SyntaxError: " + e.message + ", line: " + e.location.start.line + ", column: " + e.location.start.column);
            } else {
                console.log("Error: "+ e.message);
                throw e;
            }
        }
        return undefined;
    }
}
`;
// end Template
    }
}
