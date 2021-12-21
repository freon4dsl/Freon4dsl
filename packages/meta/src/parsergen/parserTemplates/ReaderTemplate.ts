import { PiConcept, PiLanguage } from "../../languagedef/metalanguage";
import { PiEditUnit } from "../../editordef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE, READER_GEN_FOLDER } from "../../utils";
import { PiUnitDescription } from "../../languagedef/metalanguage/PiLanguage";

export class ReaderTemplate {

    /**
     * Returns a string representation of a generic parser for 'language'. This parser is able
     * to handle every modelunit in the language.
     */
    public generateReader(language: PiLanguage, editDef: PiEditUnit, relativePath: string): string {
        const className: string = Names.semanticAnalyser(language);

        // Template starts here
        return `
        import { ${Names.PiReader} } from "${PROJECTITCORE}";
        import { net } from "net.akehurst.language-agl-processor";
        import LanguageProcessor = net.akehurst.language.api.processor.LanguageProcessor;
        import Agl = net.akehurst.language.agl.processor.Agl;
        import AutomatonKind_api = net.akehurst.language.api.processor.AutomatonKind_api;
        import { ${Names.modelunit(language)}, ModelUnitMetaType } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${Names.grammarStr(language)} } from "./${Names.grammar(language)}";
        import { ${Names.syntaxAnalyser(language)} } from "./${Names.syntaxAnalyser(language)}";
        import { ${className} } from "./${className}";
        
        /**
        *   Class ${Names.reader(language)} is a wrapper for the various parsers of
        *   modelunits. 
        */
        export class ${Names.reader(language)} implements ${Names.PiReader} {
            parser: LanguageProcessor = Agl.processorFromString(${Names.grammarStr(language)}, new ${Names.syntaxAnalyser(language)}(), null, null);

            /**
             * Parses and performs a syntax analysis on 'sentence', using the parser and analyser
             * for 'metatype', if available. If 'sentence' is correct, a model unit will be created, 
             * otherwise an error wil be thrown containing the parse or analysis error.
             * @param sentence
             * @param metatype
             */
            readFromString(sentence: string, metatype: ModelUnitMetaType): ${Names.modelunit(language)} {
                let startRule: string = "";
                // choose the correct parser                
                ${language.units.map(unit =>
                    `if (metatype === "${Names.classifier(unit)}") {
                        startRule  = "${Names.classifier(unit)}";
                    }`).join(" else ")}
                    
                // parse the input
                let model: ${Names.modelunit(language)} = null;
                if (this.parser) {
                    try {
                        if (startRule.length > 0) {
                            let sppt = this.parser.parseForGoal(startRule, sentence, AutomatonKind_api.LOOKAHEAD_1);
                        } else {
                            let sppt = this.parser.parse(sentence);
                        }
                    } catch (e) {
                        // strip the error message, otherwise it's too long for the webapp 
                        let mess = e.message.replace("Could not match goal,", "Parse error");
                        console.log(mess);
                        throw new Error(mess);
                    }
                    try {
                        let asm = this.parser.processForGoal(null, startRule, sentence, AutomatonKind_api.LOOKAHEAD_1);
                        model = asm as ${Names.modelunit(language)};
                        const semAnalyser = new ${className}();
                        semAnalyser.correct(model);
                    } catch (e) {
                        console.log(e.message);
                        throw e;
                    }                  
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
