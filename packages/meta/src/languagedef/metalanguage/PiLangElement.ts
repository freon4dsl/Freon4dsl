import { ParseLocation } from "../../utils";

// root of the inheritance structure of all language elements

export abstract class PiLangElement {
    location: ParseLocation;
    name: string; // TODO move name to PiLanguage.ts
}
