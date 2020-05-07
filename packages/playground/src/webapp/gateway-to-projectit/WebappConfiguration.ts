import { PiEnvironment } from "@projectit/core";
// import { DemoEnvironment } from "../../demo/editorEnvironment/gen/DemoEnvironment";
// import { JsonEnvironment } from "../../json/editorEnvironment/gen/JsonEnvironment";
import { TaxRulesEnvironment } from "../../taxrules/environment/gen/TaxRulesEnvironment";
// import { CalculatorEnvironment } from "../../calculator/editorEnvironment/gen/CalculatorEnvironment";
import { projectitConfiguration } from "../../taxrules/projectit/ProjectitConfiguration";

/**
 * The one and only reference to the actual language for which this editor runs
 */
// export const editorEnvironment: PiEnvironment = CalculatorEnvironment.getInstance();
// export const editorEnvironment: PiEnvironment = DemoEnvironment.getInstance();
export const editorEnvironment: PiEnvironment = TaxRulesEnvironment.getInstance();
// export const editorEnvironment: PiEnvironment = JsonEnvironment.getInstance();

// the following two should be moved to editorEnvironment
export const initializer = projectitConfiguration.customInitialization;
export const languageName: string = "TaxRules";

export const SERVER_URL = "http://127.0.0.1:3001/";
