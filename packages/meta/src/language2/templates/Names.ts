import { PiLangConcept, PiLangEnumeration, PiLanguage } from "@projectit/meta/language2/PiLanguage";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    public static context(language: PiLanguage){
        return language.name + "Context";
    }

    public static actions(language: PiLanguage){
        return language.name + "Actions";
    }

    public static projection(language: PiLanguage){
        return language.name + "Projection";
    }

    public static editor(language: PiLanguage){
        return language.name + "Editor";
    }

    public static mainProjectionalEditor(langauge: PiLanguage){
        return "MainProjectionalEditor";
    }

    public static concept(concept: PiLangConcept){
        return concept.name;
    }

    public static enumeration(enumeration: PiLangEnumeration){
        return enumeration.name;
    }

}
