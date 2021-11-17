import { RHSPropEntry } from "./RHSPropEntry";
import { RightHandSideEntry } from "./RightHandSideEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";

export class RHSOptionalGroup extends RHSPropEntry {
    private subs: RightHandSideEntry[] = [];

    constructor(prop: PiProperty, subs: RightHandSideEntry[]) {
        super(prop);
        this.subs = subs;
    }

    toGrammar(): string {
        if (this.subs.length > 1) {
            return `( ${this.subs.map(sub => `${sub.toGrammar()}`).join(" ")} )?\n\t`;
        } else if (this.subs.length === 1) {
            const first = this.subs[0];
            if (first.isList) {
                return `${first.toGrammar()}` + this.doNewline(); // no need for the extra '?'
            } else {
                return `${first.toGrammar()}?` + this.doNewline();
            }
        }
        return "";
    }

    toMethod(propIndex: number, nodeName: string): string {
        if (this.subs.length > 1) {
            return `
            // RHSOptionalGroup
            if (!${nodeName}[${propIndex}].isEmptyMatch) {
                const optGroup = this.getGroup(${nodeName}[${propIndex}]).nonSkipChildren.toArray();` + // to avoid an extra newline
                `${this.subs.map((sub, index) => `${sub.toMethod(index, "optGroup")}`).join("\n")}
            }`;
        } else if (this.subs.length === 1) {
            const first = this.subs[0];
            if (first.isList) {
                return `
                    // RHSOptionalGroup
                    if (!${nodeName}[${propIndex}].isEmptyMatch) {
                        ${this.subs.map((sub, index) => `${sub.toMethod(propIndex, nodeName)}`).join("\n")}
                    }`;
            } else {
                return `
                    // RHSOptionalGroup
                    if (!${nodeName}[${propIndex}].isEmptyMatch) {
                        const optBranch = this.getChildren(${nodeName}[${propIndex}]);
                        ${this.subs.map((sub, index) => `${sub.toMethod(index, "optBranch")}`).join("\n")}
                    }`;
            }
        }
        return `// ERROR no elements within optional group`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSOptionalGroup: " + indent + this.subs.map(sub => sub.toString(depth + 1)).join(indent);
    }
}
