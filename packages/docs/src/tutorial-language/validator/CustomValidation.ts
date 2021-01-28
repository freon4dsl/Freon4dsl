import { PiError, PiErrorSeverity } from "@projectit/core";
import { EntityDefaultWorker } from "../utils/gen/EntityDefaultWorker";
import { EntityFunction } from "../language/gen";
import { EntityCheckerInterface } from "./gen/EntityValidator";

// tag::custom-validator[]
export class CustomValidation extends EntityDefaultWorker implements EntityCheckerInterface {
    errorList: PiError[] = [];
    public execBeforeEntityFunction(modelelement: EntityFunction): boolean {
        if (modelelement.name == "determine") {
            this.errorList.push(
                new PiError(
                    `SOMETHING IS TERRIBLY WRONG WITH THIS ELEMENT`,
                    modelelement,
                    modelelement.name,
                    PiErrorSeverity.Error
                )
            );
            return true;
        }
        return false;
    }
}
// end::custom-validator[]
