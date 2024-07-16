// export class RHSGroup extends RightHandSideEntry {
//     private subs: RightHandSideEntry[] = [];
//     constructor(subs: RightHandSideEntry[]) {
//         super();
//         this.subs = subs;
//     }
//     public propsToSet(): FreProperty[] {
//         let xx: FreProperty[] = [];
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
import { RightHandSideEntry } from "./RightHandSideEntry.js";
import { makeIndent } from "../GrammarUtils.js";

export class RHSText extends RightHandSideEntry {
    text: string = '';

    constructor(str: string) {
        super();
        this.text = str;
    }

    toGrammar(): string {
        return this.text + this.doNewline();
    }

    toMethod(): string {
        return ``;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSText: " + this.text;
    }
}
