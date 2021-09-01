// adapted from "net.akehurst.language/examples/js/node/src/main.js"
import {net} from "net.akehurst.language-agl-processor";
import LanguageProcessor = net.akehurst.language.api.processor.LanguageProcessor;
import Agl = net.akehurst.language.agl.processor.Agl;
import AutomatonKind_api = net.akehurst.language.api.processor.AutomatonKind_api;
import { ExModelSyntaxAnalyser } from "./ExModelSyntaxAnalyser";
import { ExampleEveryConcept, ExampleModelUnitType } from "../language/gen";
import { ExampleModelUnitWriter } from "../writer/gen/ExampleModelUnitWriter";
import { grammarStr } from "./ExModelGrammar";

export class ExModelAglParser {
    analyser = new ExModelSyntaxAnalyser();
    proc: LanguageProcessor = null;
    writer: ExampleModelUnitWriter = new ExampleModelUnitWriter();

    constructor() {
        try {
            this.proc = Agl.processorFromString(grammarStr, this.analyser, null, null);
        } catch (e) {
            console.log( e );
        }
    }

    parse(sentence: string): ExampleModelUnitType {
        if (this.proc) {

            let sppt = this.proc.parse(sentence);
            // console.info(sppt);

            let asm = this.proc.process(null, sentence, AutomatonKind_api.LOOKAHEAD_1);
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
            console.info(this.writer.writeToString(asm as ExampleEveryConcept, 0, false));
            console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
        }
        return null;
    }
}



