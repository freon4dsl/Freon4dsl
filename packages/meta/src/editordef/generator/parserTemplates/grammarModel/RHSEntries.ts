// the classes for the various choices of properties
import { PiPrimitiveProperty, PiProperty } from "../../../../languagedef/metalanguage";
import { getBaseTypeAsString, Names } from "../../../../utils";
import { getPrimCall, getTypeCall } from "./GrammarUtils";

export abstract class RightHandSideEntry {
    public isList: boolean = false;
    // addNewLineToGrammar exists solely to be able to manage the layout of the grammar
    // if true we end the grammar string with a newline
    // for this purpose, every subclass needs to call 'doNewline' after
    // the grammar string has been created.
    addNewLineToGrammar: boolean = false;
    doNewline() : string {
        if (this.addNewLineToGrammar) {
            return `\n\t`;
        }
        return ``;
    }
    toGrammar() : string {
        return `RightHandSideEntry.toGrammar() should be implemented by its subclasses.`;
    }
    toMethod(index: number, nodeName: string) : string {
        return `RightHandSideEntry.toGrammar() should be implemented by its subclasses.`;
    }
    toString(depth: number) : string {
        return `RightHandSideEntry.toString() should be implemented by its subclasses.`;
    }

}
// export class RHSGroup extends RightHandSideEntry {
//     private subs: RightHandSideEntry[] = [];
//     constructor(subs: RightHandSideEntry[]) {
//         super();
//         this.subs = subs;
//     }
//     public propsToSet(): PiProperty[] {
//         let xx: PiProperty[] = [];
//         for (const part of this.subs) {
//             if (part instanceof RHSPropEntry) {
//                 xx.push(part.property);
//             } else if (part instanceof RHSGroup) {
//                 xx.push(...part.propsToSet());
//             }
//         }
//         return xx;
//     }
//     toGrammar() : string {
//         return `${this.subs.map(t => `${t.toGrammar()}`).join(' ')}`;
//     }
//     toMethod(propIndex: number, nodeName: string) : string {
//         // cannot join with '\n' because RHSText parts may return an empty string
//         // using propIndex here, because the RHSGroup does not introduce a new parse group
//         return `${this.subs.map((sub, index) => `${sub.toMethod(propIndex + index, `${nodeName}`)}`).join(' ')}`;
//     }
//     toString(depth: number) : string {
//         let indent: string = "\n\t";
//         return indent + "RHSGroup: " + indent + this.subs.map(sub => sub.toString(depth+1)).join(indent);
//     }
// }
export class RHSText extends RightHandSideEntry {
    text: string;
    constructor(str: string) {
        super();
        this.text = str;
    }
    toGrammar() : string {
        // TODO apparently the .edit parser does not remove the space char after the end quote (')
        // therefore we do it here
        return this.text.trimEnd() + this.doNewline();
    }
    toMethod(index: number, nodeName: string) : string {
        return ``;
    }
    toString(depth: number) : string {
        let indent = makeIndent(depth);
        return indent + "RHSText: " + this.text;
    }
}
export abstract class RHSPropEntry extends RightHandSideEntry {
    property: PiProperty;

    constructor(prop: PiProperty) {
        super();
        this.property = prop;
    }
}
export abstract class RHSPropPartWithSeparator extends RHSPropEntry {
    protected separatorText: string = '';

    constructor(prop: PiProperty, separatorText) {
        super(prop);
        this.separatorText = separatorText;
    }
}
export class RHSOptionalGroup extends RHSPropEntry {
    private subs: RightHandSideEntry[] = [];
    constructor(prop: PiProperty, subs: RightHandSideEntry[]) {
        super(prop);
        this.subs = subs;
    }
    toGrammar() : string {
        if (this.subs.length > 1) {
            return `( ${this.subs.map(sub => `${sub.toGrammar()}`).join(' ')} )?\n\t`;
        } else if (this.subs.length === 1) {
            const first = this.subs[0];
            if (first.isList) {
                return `${first.toGrammar()}`+this.doNewline(); // no need for the extra '?'
            } else {
                return `${first.toGrammar()}?`+this.doNewline();
            }
        }
        return '';
    }
    toMethod(propIndex: number, nodeName: string) : string {
        if (this.subs.length > 1) {
            return `// RHSOptionalGroup
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                const optGroup = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray();` + // to avoid an extra newline
                `${this.subs.map((sub, index) => `${sub.toMethod(index, 'optGroup')}`).join('\n')}
            }`;
        } else if (this.subs.length === 1) {
            return `// RHSOptionalGroup
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                ${this.subs.map((sub, index) => `${sub.toMethod(propIndex, nodeName)}`).join('\n')}
            }`;
        }
        return `// ERROR no elements within optional group`;
    }
    toString(depth: number) : string {
        let indent = makeIndent(depth);
        return indent + "RHSOptionalGroup: " + indent + this.subs.map(sub => sub.toString(depth+1)).join(indent);
    }
}
export class RHSBooleanWithKeyWord extends RHSPropEntry {
    private keyword: string = '';
    constructor(prop: PiPrimitiveProperty, keyword) {
        super(prop);
        this.keyword = keyword;
        this.isList = false;
    }
    toGrammar(): string {
        // no need for the closing '?' because this is always within an optional group
        // e.g [?${self.primBoolean @keyword [<BOOL>]}]
        return `'${this.keyword}'` + this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        return `// RHSBooleanWithKeyWord
                if (!${nodeName}[${propIndex}].isEmptyMatch) {
                    ${this.property.name} = true;
                }`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSBooleanWithKeyWord: " + this.property.name + ": "+ this.keyword;
    }
}
export class RHSPrimEntry extends RHSPropEntry {
    constructor(prop: PiPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        return `${getPrimCall(this.property.type.referred)}`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        return `${this.property.name} = this.transformNode(${nodeName}[${propIndex}]); // RHSPrimEntry\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}
export class RHSPrimOptionalEntry extends RHSPropEntry {
    constructor(prop: PiPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        return `${getPrimCall(this.property.type.referred)}?`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        return `// RHSPrimOptionalEntry
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
                ${this.property.name} = this.transformNode(subNode);
            }`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}
export class RHSPrimListEntry extends RHSPropEntry {
    constructor(prop: PiPrimitiveProperty) {
        super(prop);
        this.isList = true;
    }
    toGrammar(): string {
        return `${getPrimCall(this.property.type.referred)}*`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.transformList<${baseType}>(${nodeName}[${propIndex}]); // RHSPrimListEntry\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPrimListEntry: " + this.property.name;
    }
}
export class RHSPrimListEntryWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: PiProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }
    toGrammar(): string {
        return `[ ${getPrimCall(this.property.type.referred)} / '${this.separatorText}' ]*`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.transformList<${baseType}>(${nodeName}[${propIndex}], '${this.separatorText}'); // RHSPrimListEntryWithSeparator\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPrimListEntryWithSeparator: " + this.property.name;
    }
}
export class RHSPartEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        getBaseTypeAsString(this.property);
        return `${this.property.name} = this.transformNode(${nodeName}[${propIndex}]); // RHSPartEntry\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartEntry: " + this.property.name;
    }
}
export class RHSPartOptionalEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}?`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        getBaseTypeAsString(this.property);
        return `// RHSPartOptionalEntry
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
                ${this.property.name} = this.transformNode(subNode);
            }`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartEntry: " + this.property.name;
    }
}
export class RHSPartListEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.property = prop;
        this.isList = true;
    }
    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}*`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.transformList<${baseType}>(${nodeName}[${propIndex}]); // RHSPartListEntry\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartListEntry: " + this.property.name;
    }
}
export class RHSPartListEntryWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: PiProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }
    toGrammar(): string {
        return `[ ${getTypeCall(this.property.type.referred)} / '${this.separatorText}' ]*`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.transformList<${baseType}>(${nodeName}[${propIndex}], '${this.separatorText}'); // RHSPartListEntryWithSeparator\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSPartListEntryWithSeparator: " + this.property.name;
    }
}
export class RHSRefEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        // TODO make pathname possible
        return `identifier`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.piElemRef<${baseType}>(${nodeName}[${propIndex}], '${baseType}'); // RHSRefEntry\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
export class RHSRefOptionalEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        // TODO make pathname possible
        return `identifier?`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `// RHSRefOptionalEntry
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
                ${this.property.name} = this.piElemRef<${baseType}>(subNode, '${baseType}');
            }`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
export class RHSRefListEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = true;
    }
    toGrammar(): string {
        return `identifier*`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const propType: string = Names.classifier(this.property.type.referred);
        const baseType: string = getBaseTypeAsString(this.property);
        // if (doOptional && this.property.isOptional) {
        //     return `// RHSRefListEntry - optional
        //     if (!${nodeName}[${propIndex}].isEmptyMatch) {
        //         // take the zeroth element of the group that represents the optional part
        //         const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
        //         ${this.property.name} = this.transformRefList<${baseType}>(${nodeName}[${propIndex}], '${propType}');
        //     }`;
        // } else
        return `${this.property.name} = this.transformRefList<${baseType}>(${nodeName}[${propIndex}], '${propType}'); // RHSRefListEntry\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefListEntry: " + this.property.name;
    }
}
export class RHSRefListWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: PiProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }

    toGrammar(): string {
        return `[ identifier / '${this.separatorText}' ]*`+this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        const propType: string = Names.classifier(this.property.type.referred);
        const baseType: string = getBaseTypeAsString(this.property);
        // if (doOptional && this.property.isOptional) {
        //     return `// RHSRefListWithSeparator - optional
        //     if (!${nodeName}[${propIndex}].isEmptyMatch) {
        //         // take the zeroth element of the group that represents the optional part
        //         const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
        //         ${this.property.name} = this.transformRefList<${baseType}>(${nodeName}[${propIndex}], '${propType}', '${this.separatorText}');
        //     }`;
        // } else
        return `${this.property.name} = 
                        this.transformRefList<${baseType}>(${nodeName}[${propIndex}], '${propType}', '${this.separatorText}'); // RHSRefListWithSeparator\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSRefListWithSeparator: " + this.property.name;
    }
}
export class RHSLimitedRefEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `${this.property.name} = this.piElemRef<${baseType}>(${nodeName}[${propIndex}], '${baseType}'); // RHSLimitedRefEntry\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSLimitedRefEntry: " + this.property.name;
    }
}
export class RHSLimitedRefOptionalEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}?`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const baseType: string = getBaseTypeAsString(this.property);
        return `// RHSLimitedRefOptionalEntry
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // take the first element of the group that represents the optional part  
                const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
                ${this.property.name} = this.piElemRef<${baseType}>(subNode, '${baseType}');
            }`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSLimitedRefEntry: " + this.property.name;
    }
}
export class RHSLimitedRefListEntry extends RHSPropEntry {
    constructor(prop: PiProperty) {
        super(prop);
        this.isList = false;
    }
    toGrammar(): string {
        return `${getTypeCall(this.property.type.referred)}*`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const propType: string = Names.classifier(this.property.type.referred);
        const baseType: string = getBaseTypeAsString(this.property);
        // if (doOptional && this.property.isOptional) {
        //     return `// RHSLimitedRefListEntry - optional
        //     if (!${nodeName}[${propIndex}].isEmptyMatch) {
        //         // take the zeroth element of the group that represents the optional part
        //         const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
        //         ${this.property.name} = this.transformRefList<${baseType}>(${nodeName}[${propIndex}], '${propType}');
        //     }`;
        // } else
        return `${this.property.name} = this.transformRefList<${baseType}>(${nodeName}[${propIndex}], '${propType}'); // RHSLimitedRefListEntry\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSLimitedRefListEntry: " + this.property.name;
    }
}
export class RHSLimitedRefListWithSeparator extends RHSPropPartWithSeparator {
    constructor(prop: PiProperty, separatorText: string) {
        super(prop, separatorText);
        this.isList = true;
    }
    toGrammar(): string {
        return `[ ${getTypeCall(this.property.type.referred)} / '${this.separatorText}' ]*`+this.doNewline();
    }
    toMethod(propIndex: number, nodeName: string): string {
        const propType: string = Names.classifier(this.property.type.referred);
        const baseType: string = getBaseTypeAsString(this.property);
        // if (doOptional && this.property.isOptional) {
        //     return `// RHSLimitedRefListWithSeparator - optional
        //     if (!${nodeName}[${propIndex}].isEmptyMatch) {
        //         // take the zeroth element of the group that represents the optional part
        //         const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
        //         ${this.property.name} = this.transformRefList<${baseType}>(${nodeName}[${propIndex}], '${propType}', '${this.separatorText}');
        //     }`;
        // } else
        return `${this.property.name} = this.transformRefList<${baseType}>(${nodeName}[${propIndex}], '${propType}', '${this.separatorText}'); // RHSLimitedRefListEntryWithSeparator\n`;
    }
    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSLimitedRefListWithSeparator: " + this.property.name;
    }
}
export class RHSListGroup extends RHSPropPartWithSeparator {
    // `(${propTypeName} '${joinText}' )* /* option C */`
    private entry: RHSPropEntry;
    constructor(prop: PiProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
    }
    toGrammar() : string {
        return `( ${this.entry.toGrammar()} '${this.separatorText}' )*\n\t`;
    }
    toMethod(propIndex: number, nodeName: string) : string {
        const propType: string = Names.classifier(this.property.type.referred);
        const baseType: string = getBaseTypeAsString(this.property);
        return `// ListGroup 
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                // take the zeroth element of the group that represents the optional part
                const subNode = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray()[0];
                ${this.property.name} = this.transformList<${baseType}>(${nodeName}[${propIndex}], '${this.separatorText}');
            }`;
    }
    toString(depth: number) : string {
        let indent = makeIndent(depth+1);
        return indent + "RHSListGroup: " + indent + this.entry.toString(depth+1) + " " + this.separatorText;
    }
}
function makeIndent(depth: number) {
    let indent: string = "\n";
    for (let i = depth; i >= 1; i--) {
        indent += "\t";
    }
    return indent;
}
