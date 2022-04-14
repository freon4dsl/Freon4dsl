// Generated by the ProjectIt Language Generator.
import { net } from "net.akehurst.language-agl-processor";
import LanguageProcessor = net.akehurst.language.api.processor.LanguageProcessor;
import Agl = net.akehurst.language.agl.processor.Agl;
import AutomatonKind_api = net.akehurst.language.api.processor.AutomatonKind_api;
import { PiTyperDef } from "../new-metalanguage";
import { MetaTyperGrammarStr } from "./PiTyperGrammar";
import { PiTyperSyntaxAnalyser } from "./PiTyperSyntaxAnalyser";

/**
 *   Class MetaTyperModelUnitReader is a wrapper for the various parsers of
 *   modelunits.
 */
export class PiTyperReader {
    analyser: PiTyperSyntaxAnalyser = new PiTyperSyntaxAnalyser();
    parser: LanguageProcessor = Agl.processorFromString(MetaTyperGrammarStr, this.analyser, null, null);
    // parser: LanguageProcessor = Agl.processorFromString(MetaTyperGrammarStr, null, null, null);

    /**
     * Parses and performs a syntax analysis on 'sentence'. If 'sentence' is correct,
     * a model unit will be created,
     * otherwise an error wil be thrown containing the parse or analysis error.
     * @param sentence
     */
    readFromString(sentence: string, sourceFileName: string): Object {
        this.analyser.filename = sourceFileName;
        let startRule: string = "PiTyperDef";

        // parse the input
        let unit: Object = null;
        if (this.parser) {
            try {
                if (startRule.length > 0) {
                    unit = this.parser.processForGoal(null, startRule, sentence, AutomatonKind_api.LOOKAHEAD_1);
                } else {
                    unit = this.parser.process(null, sentence, AutomatonKind_api.LOOKAHEAD_1);
                }
            } catch (e) {
                // strip the error message, otherwise it's too long for the webapp
                // console.log(e.message);
                let mess = e.message?.replace("Could not match goal,", "Parse error");
                if (!!mess && mess.length > 0) {
                    throw new Error(mess);
                } else {
                    throw e;
                }
            }
            // do semantic analysis taking into account the whole model, because references could be pointing anywhere
            // if (!!model) {
            //     try {
            //         if (model.getUnits().filter(existing => existing.name === unit.name).length > 0) {
            //             throw new Error(`Unit named '${unit.name}' already exists.`);
            //         } else {
            //             model.addUnit(unit);
            //             const semAnalyser = new MetaTyperSemanticAnalyser();
            //             semAnalyser.correct(unit);
            //         }
            //     } catch (e) {
            //         console.log(e.message);
            //         throw e;
            //     }
            // }
        }
        return unit;
    }
}