import { PiEnvironment } from "@projectit/core";
// import { DemoEnvironment } from "../../demo/environment/gen/DemoEnvironment";
// import { JsonEnvironment } from "../../json/environment/gen/JsonEnvironment";
import { TaxRulesEnvironment } from "../../taxrules/environment/gen/TaxRulesEnvironment";
// import { CalculatorEnvironment } from "../../calculator/environment/gen/CalculatorEnvironment";

/**
 * The one and only reference to the actual language for which this editor runs
 */
// export const environment: PiEnvironment = CalculatorEnvironment.getInstance();
// export const environment: PiEnvironment = DemoEnvironment.getInstance();
export const environment: PiEnvironment = TaxRulesEnvironment.getInstance();
// export const environment: PiEnvironment = JsonEnvironment.getInstance();

export const SERVER_URL = "http://127.0.0.1:3001/";
