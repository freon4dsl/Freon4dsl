import { PiConcept, PiInterface, PiLanguage, PiLimitedConcept, PiProperty } from "../../languagedef/metalanguage";
import { ListUtil } from "../../utils";

export class InterpreterBaseTemplate {
    withHtml: boolean;

    constructor(html: boolean) {
        this.withHtml = html;
    }

    public interpreterBase(language: PiLanguage): string {
        return `export class ...
        
        
        
        `
    }

}
