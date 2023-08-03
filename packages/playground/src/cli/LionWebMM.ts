import { FreLanguage, FreLionwebSerializer, FreNode, FreNodeReference } from "@freon4dsl/core";
import { CommandLineAction, CommandLineStringParameter } from "@rushstack/ts-command-line";
import fs from "fs";
import path from "node:path";
import { LIonCoreM3Environment } from "../lionwebM3/config/gen/LIonCoreM3Environment";
import { LwChunk } from "@freon4dsl/core";

export class LionWebMM extends CommandLineAction {
    protected metamodelfile: CommandLineStringParameter;

    constructor() {
        super({
            actionName: "lionweb",
            summary: "Create .ast file from Lionwebmetamodel JSON",
            documentation:
                "Lionweb to Freon."
        });
    }

    protected onDefineParameters(): void {
        this.metamodelfile = this.defineStringParameter({
            argumentName: "METAMODEL_FILE",
            defaultValue: "metamodel.lmm",
            parameterLongName: "--metamodel",
            parameterShortName: "-m",
            description: "File containing the metamodel in JSON format"
        });
    }

    private readonly LIONWEB_MM_FILE = "properties.lmm.json";

    async copy() {
        //
        const concepts = [];
        const freonLanguage = {};
        console.log("================================")
        const currentDirectory: string = path.basename(process.cwd());

        const filename = this.metamodelfile.value;
        let metamodel: LwChunk = JSON.parse(fs.readFileSync(filename).toString());
        const nodes = metamodel.nodes;
        const metamodelInfo = metamodel.languages[0];
        for(const node of nodes) {
            const id = node.id;
            const properties = node.properties;
            const children = node.children;
            const references = node.references;

            if (node.concept.key === "Concept") {
                const aname = node.properties.find(p => p.property.key === "NamespacedEntity_name").value;
                const key = node.properties.find(p => p.property.key === "key").value;
                const isAbstract = node.properties.find(p => p.property.key === "abstract").value
                const propName = node.properties.find(p => p.property.key === "NamespacedEntity_name").value
                console.log(`Concept ` + aname + " key " + key + ` isAbstract ${isAbstract}`);
                for(const child of node.children) {
                    for(const ch of child.children) {
                        console.log(`    child: ${ch}`)
                    }
                }
                concepts.push({concept: node, name: aname, key: key})
            }
            if (node.concept.key === "Metamodel") {
                const mmname = node.properties.find(p => p.property.key === "Metamodel_name").value;
                // const key = node.properties.find(p => p.property.key === "key").value;

                console.log(`Metamodel ` + mmname );
            }
        }
        for(const concept of concepts) {
            for(const child of concept.concept.children) {
                for(const ch of child.children) {
                    console.log(`   ==> child: ${ch} is ${concepts.find(c => c.key === ch)?.name}`)
                }
            }
        }

    }

    async readLionweb() {
        // ensure language is initialized
        const tmp = LIonCoreM3Environment.getInstance();
        for (const x of FreLanguage.getInstance().getNamedConcepts()) {
            console.log("Named concept " + x);
        }
        const serialzer = new FreLionwebSerializer();
        const filename = this.metamodelfile.value;
        let metamodel: LwChunk = JSON.parse(fs.readFileSync(filename).toString());
        const ts = serialzer.toTypeScriptInstance(metamodel)
        // console.log(JSON.stringify(ts, null, 2));
        console.log(printModel1(ts));
        console.log(`language ${ts}`)
    }
    protected onExecute(): Promise<void> {
        const self = this;
        console.log("haha")
        return new Promise(function (resolve, rejest) {
            // self.copy();
            self.readLionweb();
            console.log("===== DONE =======");
        });
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
