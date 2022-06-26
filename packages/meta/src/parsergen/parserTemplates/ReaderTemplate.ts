import {  PiLanguage } from "../../languagedef/metalanguage";
import { PiEditUnit } from "../../editordef/metalanguage";
import { LANGUAGE_GEN_FOLDER, Names, PROJECTITCORE } from "../../utils";

export class ReaderTemplate {

    /**
     * Returns a string representation of a generic parser for 'language'. This parser is able
     * to handle every modelunit in the language.
     */
    public generateReader(language: PiLanguage, editDef: PiEditUnit, relativePath: string): string {
        const semanticAnalyser: string = Names.semanticAnalyser(language);
        const syntaxAnalyser: string = Names.syntaxAnalyser(language);

        // Template starts here
        return `
        import { ${Names.PiReader} } from "${PROJECTITCORE}";
        import { net } from "net.akehurst.language-agl-processor";
        import LanguageProcessor = net.akehurst.language.api.processor.LanguageProcessor;
        import Agl = net.akehurst.language.agl.processor.Agl;
        import AutomatonKind_api = net.akehurst.language.api.processor.AutomatonKind_api;
        import { ${Names.modelunit(language)}, ModelUnitMetaType, ${Names.classifier(language.modelConcept)} } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
        import { ${Names.grammarStr(language)} } from "./${Names.grammar(language)}";
        import { ${Names.syntaxAnalyser(language)} } from "./${Names.syntaxAnalyser(language)}";
        import { ${semanticAnalyser} } from "./${semanticAnalyser}";
        
        /**
        *   Class ${Names.reader(language)} is a wrapper for the various parsers of
        *   modelunits. 
        */
        export class ${Names.reader(language)} implements ${Names.PiReader} {
            analyser: ${syntaxAnalyser} = new ${syntaxAnalyser}();
            parser: LanguageProcessor = Agl.processorFromString(${Names.grammarStr(language)}, this.analyser, null, null);

            /**
             * Parses and performs a syntax analysis on 'sentence', using the parser and analyser
             * for 'metatype', if available. If 'sentence' is correct, a model unit will be created, 
             * otherwise an error wil be thrown containing the parse or analysis error.
             * @param sentence      the input string which will be parsed
             * @param metatype      the type of the unit to be created
             * @param model         the model to which the unit will be added
             * @param sourceName    the (optional) name of the source that contains 'sentence'
             */
            readFromString(sentence: string, metatype: ModelUnitMetaType, model: ${Names.classifier(language.modelConcept)}, sourceName?: string): ${Names.modelunit(language)} {
                this.analyser.sourceName = sourceName;
                let startRule: string = "";
                // choose the correct parser                
                ${language.units.map(unit =>
                    `if (metatype === "${Names.classifier(unit)}") {
                        startRule  = "${Names.classifier(unit)}";
                    }`).join(" else ")}
                    
                // parse the input
                let unit: ${Names.modelunit(language)} = null;
                if (this.parser) {
                    try {
                        let asm;
                        if (startRule.length > 0) {
                            asm = this.parser.processForGoal(null, startRule, sentence, AutomatonKind_api.LOOKAHEAD_1);
                        } else {
                            asm = this.parser.process(null, sentence, AutomatonKind_api.LOOKAHEAD_1);
                        }
                        unit = asm as ${Names.modelunit(language)};
                    } catch (e) {
                        // strip the error message, otherwise it's too long for the webapp
                        let mess = e.message.replace("Could not match goal,", "Parse error in " + sourceName + ":");
                        if (!!mess && mess.length > 0) {
                            console.log(mess);
                            throw new Error(mess);
                        } else {
                            throw e;
                        }
                    }
                    // do semantic analysis taking into account the whole model, because references could be pointing anywhere
                    if (!!model) {
                        try {
                            if (model.getUnits().filter(existing => existing.name === unit.name).length > 0) {
                                throw new Error(\`Unit named '\${unit.name}' already exists.\`);
                            } else {
                                model.addUnit(unit);
                                const semAnalyser = new ${semanticAnalyser}();
                                semAnalyser.correct(unit);
                            }
                        } catch (e) {
                            console.log(e.message);
                            throw e;
                        }
                    }              
                } else {
                    throw new Error(\`No parser for \${metatype} available: grammar incorrect.\`);
                }
                return unit;        
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
