// adapted from "net.akehurst.language/examples/js/node/src/main.js"
import {net} from "net.akehurst.language-agl-processor";
import LanguageProcessor = net.akehurst.language.api.processor.LanguageProcessor;
import Agl = net.akehurst.language.agl.processor.Agl;
import AutomatonKind_api = net.akehurst.language.api.processor.AutomatonKind_api;
import {grammarStr} from "./Grammar";

export class ParserUsingAGL {
    // analyser = new SimpleExampleSyntaxAnalyser();
    analyser = null;
    proc: LanguageProcessor  = Agl.processorFromString(grammarStr, this.analyser, null, null);


    doIt() {
        let sentence = `
model XX {
model wide Methods:
}
`;
        let sppt = this.proc.parse(sentence);
        console.info(sppt);

        // let asm = this.proc.process(sentence);
        // console.info(typeof asm);
        // console.info(asm);
        //
        // let formatted = this.proc.formatAsm(asm)
        // console.info("formatted: " + formatted);
    }
}



