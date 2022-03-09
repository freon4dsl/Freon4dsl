import { PiClassifier, PiLangElement, PiLanguage } from "../../../languagedef/metalanguage";

export abstract class PitExp extends PiLangElement {
    language: PiLanguage;
    get type(): PiClassifier {
        return null;
    }
    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PitExp'";
    }
}
