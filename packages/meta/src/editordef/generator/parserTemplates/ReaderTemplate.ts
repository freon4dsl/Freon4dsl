import { PiLanguage } from "../../../languagedef/metalanguage";
import { PiEditUnit } from "../../metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE, READER_GEN_FOLDER } from "../../../utils";

export class ReaderTemplate {

    /**
     * Returns a string representation of a generic parser for 'language'. This parser is able
     * to handle every modelunit in the language.
     */
    public generateReader(language: PiLanguage, editDef: PiEditUnit, relativePath: string): string {
        const unitNames = language.units.map(unit => Names.concept(unit));

        // TODO adjust Names class and use it here

        // Template starts here
        return `
        import { ${Names.PiReader} } from "${PROJECTITCORE}";
        import {net} from "net.akehurst.language-agl-processor";
        import LanguageProcessor = net.akehurst.language.api.processor.LanguageProcessor;
        import Agl = net.akehurst.language.agl.processor.Agl;
        import AutomatonKind_api = net.akehurst.language.api.processor.AutomatonKind_api;
        import { ${Names.modelunit(language)}, ModelUnitMetaType } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        ${language.units.map(unit =>
        `import { ${Names.grammarStr(unit)} } from "./${Names.grammar(unit)}";
        import { ${Names.concept(unit)}SyntaxAnalyser } from "../${Names.concept(unit)}SyntaxAnalyser";`).join("\n")
        }
        
        /**
        *   Class ${Names.reader(language)} is a wrapper for the various parsers of
        *   modelunits. It reads a file from disk, calls the javascript parser, and
        *   shows any syntax errors on the console.
        *   Note that property 'parser' should be set, before calling the method 'parse'.
        */
        export class ${Names.reader(language)} implements ${Names.PiReader} {
        ${language.units.map(unit =>
            `${Names.concept(unit)}parser = Agl.processorFromString(${Names.grammarStr(unit)}, new ${Names.concept(unit)}SyntaxAnalyser(), null, null);`).join("\n")}

            readFromString(sentence: string, metatype: ModelUnitMetaType): ${Names.modelunit(language)} {
                let parser: LanguageProcessor = null;
                // choose the correct parser                
                ${language.units.map(unit =>
                    `if (metatype === "${Names.concept(unit)}") {
                        parser  = this.${Names.concept(unit)}parser;
                    }`).join("\n")}
                    
                // parse the input
                let model: ${Names.modelunit(language)} = null;
                if (parser) {
                    // NOTE: the following might throw a syntax or analysis error
                    let sppt = parser.parse(sentence);
                    console.log(sppt);
                    let asm = parser.process(null, sentence, AutomatonKind_api.LOOKAHEAD_1);
                    // TODO return the asm that is created
                    // reset parser
                    parser = null;
                } else {
                    throw new Error(\`Not able to read \${metatype}, no parser for this metatype available.\`);
                }
                return model;        
            }
        }
        `;
        // end Template
    }

    generateStub(language: PiLanguage, editDef: PiEditUnit, relativePath: string) {
        const unitNames = language.units.map(unit => Names.concept(unit));

        // Template starts here
        return `
        import { ${Names.PiReader} } from "${PROJECTITCORE}";
        import { ${Names.modelunit(language)}, ModelUnitMetaType, ${unitNames.map(name => `${name}`).join(", ")} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";   
                    
        /**
        *   Class ${Names.reader(language)} is a STUB!!!
        *
        *   It should be a wrapper for the various parsers of modelunits,
        *   but the parsers could not be created.
        */
        export class ${Names.reader(language)} implements ${Names.PiReader} {
        
            readFromString(input: string, metatype: ModelUnitMetaType): ${Names.modelunit(language)} {
                throw new Error(\`Not able to read \${metatype}, no parser(s) available.\`);
                return null;
            }       
                 
        }
        `;
        // end Template
    }
}
