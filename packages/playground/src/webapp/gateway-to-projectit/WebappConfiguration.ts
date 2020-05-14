import { PiEnvironment } from "@projectit/core";
import { DemoEnvironment } from "../../demo/environment/gen/DemoEnvironment";
// import { CalculatorEnvironment } from "../../calculator/environment/gen/CalculatorEnvironment";
//import { HeatEnvironment } from "../../heating/environment/gen/HeatEnvironment";

// import { TaxRulesEnvironment } from "../../taxrules/environment/gen/TaxRulesEnvironment";
// import { CalculatorEnvironment } from "../../calculator/editorEnvironment/gen/CalculatorEnvironment";
// import { JsonEnvironment } from "../../json/editorEnvironment/gen/JsonEnvironment";

/**
 * The one and only reference to the actual language for which this editor runs
 */
export const editorEnvironment: PiEnvironment = DemoEnvironment.getInstance();
// export const editorEnvironment: PiEnvironment = CalculatorEnvironment.getInstance();
// export const editorEnvironment: PiEnvironment = HeatEnvironment.getInstance();

// export const editorEnvironment: PiEnvironment = TaxRulesEnvironment.getInstance();
// export const editorEnvironment: PiEnvironment = CalculatorEnvironment.getInstance();
// export const editorEnvironment: PiEnvironment = JsonEnvironment.getInstance();

/**
 * The one and only reference to the server on which the models are stored
 */
export const SERVER_URL = "http://127.0.0.1:3001/";
