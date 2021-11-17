import { PiConcept, PiLanguage } from "../../languagedef/metalanguage";
import { PiEditUnit } from "../../editordef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE, READER_GEN_FOLDER } from "../../utils";
import { PiUnitDescription } from "../../languagedef/metalanguage/PiLanguage";

export class ReaderTemplate {

    /**
     * Returns a string representation of a generic parser for 'language'. This parser is able
     * to handle every modelunit in the language.
     */
    public generateReader(language: PiLanguage, editDef: PiEditUnit, correctUnits: PiUnitDescription[], relativePath: string): string {
        const className: string = Names.semanticAnalyser(language);

        // Template starts here
        return `
        import { ${Names.PiReader} } from "${PROJECTITCORE}";
        import { net } from "net.akehurst.language-agl-processor";
        import LanguageProcessor = net.akehurst.language.api.processor.LanguageProcessor;
        import Agl = net.akehurst.language.agl.processor.Agl;
        import AutomatonKind_api = net.akehurst.language.api.processor.AutomatonKind_api;
        import { ${Names.modelunit(language)}, ModelUnitMetaType } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        ${correctUnits.map(unit =>
        `import { ${Names.grammarStr(unit)} } from "./${Names.grammar(unit)}";
        import { ${Names.syntaxAnalyser(unit)} } from "./${Names.syntaxAnalyser(unit)}";`).join("\n")
        }
        import { ${className} } from "./${className}";
        
        /**
        *   Class ${Names.reader(language)} is a wrapper for the various parsers of
        *   modelunits. 
        */
        export class ${Names.reader(language)} implements ${Names.PiReader} {
        ${language.units.map(unit => `${correctUnits.includes(unit) 
            ? `${Names.parser(unit)} = Agl.processorFromString(${Names.grammarStr(unit)}, new ${Names.syntaxAnalyser(unit)}(), null, null);`
            : `${Names.parser(unit)} = null; // there are errors in the grammar in file '${Names.grammar(unit)}'`}`            
            ).join("\n")}

            /**
             * Parses and performs a syntax analysis on 'sentence', using the parser and analyser
             * for 'metatype', if available. If 'sentence' is correct, a model unit will be created, 
             * otherwise an error wil be thrown containing the parse or analysis error.
             * @param sentence
             * @param metatype
             */
            readFromString(sentence: string, metatype: ModelUnitMetaType): ${Names.modelunit(language)} {
                let parser: LanguageProcessor = null;
                // choose the correct parser                
                ${language.units.map(unit =>
                    `if (metatype === "${Names.classifier(unit)}") {
                        parser  = this.${Names.parser(unit)};
                    }`).join("\n")}
                    
                // parse the input
                let model: ${Names.modelunit(language)} = null;
                if (parser) {
                    try {
                        let sppt = parser.parse(sentence);
                    } catch (e) {
                        // strip the error message, otherwise it's too long for the webapp 
                        let mess = e.message.replace("Could not match goal,", "Parse error");
                        console.log(mess);
                        throw new Error(mess);
                    }
                    try {
                        let asm = parser.process(null, sentence, AutomatonKind_api.LOOKAHEAD_1);
                        model = asm as ${Names.modelunit(language)};
                        const semAnalyser = new ${className}();
                        semAnalyser.correct(model);
                    } catch (e) {
                        console.log(e.message);
                        throw e;
                    }  
                    // reset parser
                    parser = null;                     
                } else {
                    throw new Error(\`No parser for \${metatype} available: grammar incorrect.\`);
                }
                return model;        
            }
        }
        `;
        // end Template
    }
}

// to be added later:
// if ( this.${Names.parser(unit)} == null ) {
//     try {
//         this.${Names.parser(unit)} = Agl.processorFromString(${Names.grammarStr(unit)}, new ${Names.syntaxAnalyser(unit)}(), null, null);
//     } catch (e) {
//         throw new Error(\`No parser for \${metatype} available:\\n\${e.message}.\`);
//                             }
//                         }
