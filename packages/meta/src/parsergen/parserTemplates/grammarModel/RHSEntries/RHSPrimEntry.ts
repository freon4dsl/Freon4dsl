import { RHSPropEntry } from "./RHSPropEntry.js";
import {FreMetaPrimitiveProperty, FreMetaPrimitiveType} from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import {internalTransformPrimValue, ParserGenUtil} from "../../ParserGenUtil.js";

export class RHSPrimEntry extends RHSPropEntry {
    constructor(prop: FreMetaPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type)}` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        let tsType: string = '';
        let typeStr: string = '';
        if (this.property.type === FreMetaPrimitiveType.identifier ) {
            tsType = "string";
            typeStr = "PrimValueType.identifier";
        } else if (this.property.type === FreMetaPrimitiveType.string ) {
            tsType = "string";
            typeStr = "PrimValueType.string";
        } else if (this.property.type === FreMetaPrimitiveType.number) {
            tsType = "number";
            typeStr = "PrimValueType.number";
        } else if (this.property.type === FreMetaPrimitiveType.boolean) {
            tsType = "boolean";
            typeStr = "PrimValueType.boolean";
        }
        return `${ParserGenUtil.internalName(this.property.name)} = 
                    this.${mainAnalyserName}.${internalTransformPrimValue}<${tsType}>(${nodeName}.asJsReadonlyArrayView()[${index}] as unknown as string, ${typeStr}); // RHSPrimEntry\n`
    }

    toString(depth: number): string {
        const indent: string = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}
