import { LanguageGenerator } from "./LanguageGenerator";
import { PiLanguage, piLanguage } from "./PiLanguage";

const model: PiLanguage = piLanguage;
const generator = new LanguageGenerator("output");

generator.generate(model);
