import { PiClassifier, PiLanguage, PiPrimitiveType, PiPrimitiveValue } from "./PiLanguage";
import { PiElementReference } from "./PiElementReference";
import { Checker } from "../../utils";

export abstract class PiLangAbstractChecker extends Checker<PiLanguage> {
    /**
     * returns true if the 'value' conforms to 'primType'
     * @param value
     * @param primType
     */
    public checkValueToType(value: PiPrimitiveValue, type: PiPrimitiveType): boolean {
        // LOGGER.log("checkValueToType: " + value + ", " + type + ", typeof " + typeof value);
        if (type === PiPrimitiveType.identifier && typeof value === "string") {
            return true;
        } else if (type === PiPrimitiveType.string && typeof value === "string") {
            return true;
        } else if (type === PiPrimitiveType.number  && typeof value === "number") {
            // TODO add the following check
            //     if (!isNaN(Number(value)) ) {
            //         return true;
            //     }
            return true;
        } else if (type === PiPrimitiveType.boolean  && typeof value === "boolean") {
            // TODO add the following check
            //     if ((value === "false" || value === "true")) {
            //         return true;
            //     }
            return true;
        }
        return false;
    }

    public checkClassifierReference(reference: PiElementReference<PiClassifier>): void {
        // LOGGER.log("Checking classifier reference '" + reference.name + "'");
        this.nestedCheck(
            {
                check: reference.name !== undefined,
                error: `Concept or interface reference should have a name ${Checker.location(reference)}.`,
                whenOk: () => {

                    this.nestedCheck(
                        {
                            check: (!!reference.referred),
                            error: `Reference to ${reference.name} cannot be resolved ${Checker.location(reference)}.`
                        });
                }
            });
    }
}
