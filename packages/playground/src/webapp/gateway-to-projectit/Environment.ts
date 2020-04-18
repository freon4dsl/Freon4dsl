import { PiEnvironment } from "@projectit/core";
import { DemoEnvironment } from "../../demo/environment/gen/DemoEnvironment";
import { TaxRulesEnvironment } from "../../taxrules/environment/gen/TaxRulesEnvironment";

/**
 * The one and only reference to the actual language for which this editor runs
 */
// export const environment: PiEnvironment = DemoEnvironment.getInstance();
export const environment: PiEnvironment = TaxRulesEnvironment.getInstance();
