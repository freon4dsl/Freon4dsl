import { PiConcept, PiLanguage, PiPrimitiveProperty, PiProperty } from "../../../languagedef/metalanguage/PiLanguage";
import { ListJoinType, PiEditConcept, PiEditProjectionText, PiEditSubProjection, PiEditUnit } from "../../metalanguage";
import { Names } from "../../../utils";

export class PegjsTemplate {
    referredConcepts: PiConcept[] = [];
    textForListConcepts: string[] = [];
    listNumber: number = 0;

    generatePegjsForUnit(language: PiLanguage, langUnit: PiConcept, editDef: PiEditUnit): string {
        this.referredConcepts = [];
        this.textForListConcepts = [];
        this.listNumber= 0;
        const creatorName = Names.parserCreator(language);

        // Note that the order in which the rules are stated, determines whether the parser is functioning or not
        // first create a rule for the unit, next for its children, etc.
        const sortedEditorDefs = this.findEditorDefsForUnit(langUnit, editDef.conceptEditors);

        // Template starts here, no prettier for pegjs files, therefore we take indentation into account in this template
        return `
{
    let creator = require("./${creatorName}");
}
        
${sortedEditorDefs.map(conceptDef => `${this.makeConceptRule(conceptDef)}`).join("")}
${this.referredConcepts.map(concept => `${this.makeReferenceRule(concept)}`).join("")}
${this.textForListConcepts.map(listRule => `${listRule}`).join("")}

ws "whitespace" = (([ \\t\\n\\r]) / (SingleLineComment) / (MultiLineComment) )*
rws "required whitespace" = (([ \\t\\n\\r]) / (SingleLineComment) / (MultiLineComment) )+

variable "variable"
  = first:varLetter rest:identifierChar* { return first + rest.join(""); }

stringLiteral       = chars:anyChar* { return chars.join(""); }

varLetter           = [a-zA-Z]
identifierChar      = [a-zA-Z0-9_$] // any char but not /.,!?@~%^&*-=+(){}"':;<>?[]\\/
anyChar             = [*a-zA-Z0-9' /\\-[\\]+<>=#$_.,!?@~%^&*-=+(){}:;<>?]
number              = [0-9]

numberLiteral     = nums:number+ { return nums.join(""); }
booleanLiteral    = fbool:"false" \ tbool:"true" { if (!!fbool) { return fbool; } else { return tbool; } }

SingleLineComment
  = "//" (!LineTerminator SourceCharacter)*

LineTerminator
  = [\\n\\r\\u2028\\u2029]

Comment "comment"
  = MultiLineComment
  / SingleLineComment

MultiLineComment
  = "/*" (!"*/" SourceCharacter)* "*/"

SourceCharacter
  = .
  
char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\\\"
      / "/"
      / "\\["
      / "\\]"
      / "$"
      / "b" { return "\\b"; }
      / "f" { return "\\f"; }
      / "n" { return "\\n"; }
      / "r" { return "\\r"; }
      / "t" { return "\\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\\\"

unescaped
  = [^\\0-\\x1F\\x22\\x5C]

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]
`;
        // end Template
    }

    private makeConceptRule(conceptDef: PiEditConcept): string {
        const concept = conceptDef.concept.referred;
        if (concept.isModel) return ``;

        const propsToSet: PiProperty[] = [];

        conceptDef.projection.lines.forEach(l => {
            l.items.forEach(item => {
                if (item instanceof PiEditSubProjection) {propsToSet.push(item.expression.findRefOfLastAppliedFeature())}
            });
        });

        // TODO escape all quotes in a text string
        return `${concept.name} = ${conceptDef.projection.lines.map(l => 
            `${l.items.map(item => 
                `${(item instanceof PiEditProjectionText)? 
                    `\"${item.text.trim()}\" ws ` 
                    : 
                    `${(item instanceof PiEditSubProjection)? 
                        `${this.makeSubProjectionRule(item)} ws `
                        : 
                        `` }` 
            }`).join("")}`
        ).join("\n\t")}\n\t{ return creator.create${concept.name}({${propsToSet.map(prop => `${prop.name}:${prop.name}`).join(", ")}}); }\n\n`;
    }

    private makeSubProjectionRule(item: PiEditSubProjection): string {
        const myElem = item.expression.findRefOfLastAppliedFeature();
        if (myElem.isList) {
            this.listNumber++;
            let listRuleName: string;
            if (myElem instanceof PiPrimitiveProperty) {
                listRuleName = Names.startWithUpperCase(myElem.primType) + "List" + this.listNumber;
            } else {
                if (item.listJoin?.joinType === ListJoinType.Separator) {
                    listRuleName = Names.startWithUpperCase(myElem.type.referred.name) + "List" + this.listNumber;
                } else {
                    listRuleName = Names.startWithUpperCase(myElem.type.referred.name);
                }
            }

            if (item.listJoin?.joinType === ListJoinType.Separator) {
                this.makeRuleForList(item, myElem, listRuleName);
                return `${myElem.name}:${listRuleName} ws `;
            } else {
                if (!myElem.isPart) {
                    listRuleName += "Reference";
                    if (!this.referredConcepts.includes(myElem.type.referred)) {
                        this.referredConcepts.push(myElem.type.referred);
                    }
                }
                return `${myElem.name}:(${listRuleName} ws "${item.listJoin?.joinText}" ws)* `;
            }
        } else {
            if (myElem instanceof PiPrimitiveProperty) {
                if (myElem.name === "name") {
                    return `${myElem.name}:variable`;
                }
                switch (myElem.primType) {
                    case "string":
                        return `${myElem.name}:stringLiteral ws`;
                    case "boolean":
                        return `${myElem.name}:booleanLiteral ws`;
                    case "number":
                        return `${myElem.name}:numberLiteral ws`;
                }
                return ``;
            } else {
                const typeName = myElem.type.referred.name;
                if (myElem.isPart) {
                    return `${myElem.name}:${typeName}`;
                } else { // the property is a reference
                    if (!this.referredConcepts.includes(myElem.type.referred)) {
                        this.referredConcepts.push(myElem.type.referred);
                    }
                    return `${myElem.name}:${typeName}Reference ws `;
                }
            }
        }
    }

    private makeReferenceRule(concept: PiConcept): string {
        return `${concept.name}Reference = name:variable
    { return creator.create${concept.name}Reference({name: name}); }\n\n`;
    }

    private makeRuleForList(item: PiEditSubProjection, myElem: PiProperty, listRuleName: string) {
        let typeName = myElem.type.referred.name;
        if (!myElem.isPart) {
            typeName += "Reference";
            if (!this.referredConcepts.includes(myElem.type.referred)) {
                this.referredConcepts.push(myElem.type.referred);
            }
        }
        const joinText = item.listJoin?.joinText.trimRight();
        if (item.listJoin?.joinType === ListJoinType.Separator) {
            this.textForListConcepts.push(`${listRuleName} = head:${typeName} tail:("${joinText}" ws v:${typeName} { return v; })*
    { return [head].concat(tail); }\n\n`);
        }
    }

    private findPartConceptsInUnit(langUnit: PiConcept): PiConcept[] {
        let result: PiConcept[] = [];
        result.push(langUnit);
        this.addPartConcepts(langUnit, result);
        return result;
    }

    private addPartConcepts(langUnit: PiConcept, result: PiConcept[]) {
        langUnit.allParts().forEach(part => {
            const type = part.type.referred;
            if (!result.includes(type)) {
                result.push(type);
                this.addPartConcepts(type, result);
            }
        });
    }

    private findEditorDefsForUnit(langUnit: PiConcept, conceptEditors: PiEditConcept[]): PiEditConcept[] {
        let result : PiEditConcept[] = [];
        const unitConcepts = this.findPartConceptsInUnit(langUnit);
        // Again note that the order in which the rules are stated, determines whether the parser is functioning or not
        // first create a rule for the unit, next for its children, etc.
        unitConcepts.forEach(con => {
            result.push(...conceptEditors.filter(editor => editor.concept.referred == con));
        });
        // conceptEditors.forEach(editor => {
        //     if (unitConcepts.includes(editor.concept.referred)) {
        //         result.push(editor);
        //     }
        // });
        return result;
    }
}

