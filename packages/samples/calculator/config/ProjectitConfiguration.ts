// Generated by the ProjectIt Language Generator.
import { PiProjection, PiActions, PiTyperPart, PiStdlib } from "@freon4dsl/core";
import { CustomCalculatorActions, CustomCalculatorProjection } from "../editor";
import { CustomCalculatorTyperPart } from "../typer";
import { CustomCalculatorValidator } from "../validator";
import { CustomCalculatorStdlib } from "../stdlib";
import { CalculatorCheckerInterface } from "../validator/gen";

/**
 * Class ProjectitConfiguration is the place where you can add all your customisations.
 * These will be used through the 'projectitConfiguration' constant by any generated
 * part of your language environment.
 */
class ProjectitConfiguration {
    // add your custom editor projections here
    customProjection: PiProjection[] = [new CustomCalculatorProjection("manual")];
    // add your custom editor actions here
    customActions: PiActions[] = [new CustomCalculatorActions()];
    // add your custom validations here
    customValidations: CalculatorCheckerInterface[] = [new CustomCalculatorValidator()];
    // add your custom type-providers here
    customTypers: PiTyperPart[] = [new CustomCalculatorTyperPart()];
    // add extra predefined instances here
    customStdLibs: PiStdlib[] = [new CustomCalculatorStdlib()];
}

export const projectitConfiguration = new ProjectitConfiguration();
