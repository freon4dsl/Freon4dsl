import { PiNewScoper } from "./PiNewScoper";
import { PiLanguageUnit } from "./PiLanguage";

export class PiMetaEnvironment {
    // static language: PiLanguageUnit;
    static metascoper = new PiNewScoper();

    // static set language(language: PiLanguageUnit) {
    //     this.language = language;
    //     this.metascoper = new PiNewScoper(language);
    // }
}
