import { RHSPropEntry } from "./RHSPropEntry.js";
import type {FreMetaPrimitiveProperty} from "../../../../languagedef/metalanguage/index.js";
import { FreMetaPrimitiveType} from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import {internalTransformPrimValue, ParserGenUtil} from "../../ParserGenUtil.js";

export class RHSPrimOptionalEntry extends RHSPropEntry {
    private noValue: string = '<no-value>'; // todo change to what is parsed from the edit file
    constructor(prop: FreMetaPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${getPrimCall(this.property.type, this.property.isOptional)}` + this.doNewline();
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
        return `// RHSPrimOptionalEntry
            if (notNullOrUndefined(${nodeName}.asJsReadonlyArrayView()[${index}])) {
                if (${nodeName}.asJsReadonlyArrayView()[${index}].toString() === "${this.noValue}") {
                    ${ParserGenUtil.internalName(this.property.name)} = undefined;
                } else {
                    ${ParserGenUtil.internalName(this.property.name)} = 
                        this.${mainAnalyserName}.${internalTransformPrimValue}<${tsType}>(${nodeName}.asJsReadonlyArrayView()[${index}] as unknown as string, ${typeStr}); \n
                } 
            }// end RHSPrimOptionalEntry
`
    }

    toString(depth: number): string {
        const indent: string = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}
