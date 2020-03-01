import { PiScoperChecker } from "../../metalanguage/scoper/PiScoperChecker";
import { ScoperDefinition } from "../../metalanguage/scoper/ScoperDefinition";
import { PiParser } from "../PiParser";
let scoperParser = require("./ScoperGrammar");

export class ScoperParser extends PiParser<ScoperDefinition> {

    constructor() {
        super();
        this.parser = scoperParser;
        this.msg = "Scoper";
        this.checker = new PiScoperChecker();
    }
}
