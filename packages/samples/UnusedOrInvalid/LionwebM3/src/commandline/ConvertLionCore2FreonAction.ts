import { FreLionwebSerializer, FreModelUnit, FreNode, FreNodeReference } from "@freon4dsl/core";
import { CommandLineAction, CommandLineStringParameter } from "@rushstack/ts-command-line";
import fs from "fs";
import { LwChunk } from "@freon4dsl/core";

import { LionWeb2FreonTemplate } from "./LionWeb2FreonTemplate";

export class ConvertLionCore2FreonAction extends CommandLineAction {
    protected metamodelfile: CommandLineStringParameter;

    constructor() {
        super({
            actionName: "folder",
            summary: "Create .ast file from folder containing LionWeb Meta-model JSON files",
            documentation: "Lionweb to Freon."
        });
    }

    protected onDefineParameters(): void {
        this.metamodelfile = this.defineStringParameter({
            argumentName: "METAMODEL_FILE",
            defaultValue: "metamodel.lmm",
            parameterLongName: "--metamodel",
            parameterShortName: "-m",
            description: "File containing the LionWeb metamodel in JSON format"
        });
    }

    protected onExecute(): Promise<void> {
        const self = this;
        return new Promise(function (resolve, rejest) {
            const freonString = self.convertLionCore2Freon();
        });
    }

    async convertLionCore2Freon(): Promise<string> {
        const serialzer = new FreLionwebSerializer();
        const filename = this.metamodelfile.value;
        let metamodel: LwChunk = JSON.parse(fs.readFileSync(filename).toString());
        const ts = serialzer.toTypeScriptInstance(metamodel);
        const result = (new LionWeb2FreonTemplate().generateFreonAst(ts as FreModelUnit));
        console.log(result);
        return result;
    }

}


export function printModel1(element: FreNode): string {
    return JSON.stringify(element, skipReferences, "  " )
}

// const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex", "$id"];
const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex"];

function skipReferences(key: string, value: Object) {
    if (ownerprops.includes(key)) {
        return undefined;
    } else if( value instanceof FreNodeReference) {
        return "REF => " + value.name;
    // }else if (key.startsWith("_FRE_")){
    //     return {key: "++" + key , value: "!!" + value};
    } else {
       return value;
    }
}
