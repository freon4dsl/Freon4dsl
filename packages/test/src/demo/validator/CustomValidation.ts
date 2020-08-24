import { PiError, PiErrorSeverity } from "@projectit/core";
import { DemoDefaultWorker } from "../utils/gen/DemoDefaultWorker";
import { DemoFunction, Nothing } from "../language/gen";
import { DemoCheckerInterface } from "./gen/DemoValidator";


export class CustomValidation extends DemoDefaultWorker implements DemoCheckerInterface {
    errorList: PiError[] = [];
    public execBeforeDemoFunction(modelelement: DemoFunction): boolean {
        // console.log("DOING customValidation");
        this.errorList.push(
            new PiError(
                `ER IS IETS FLINK MIS MET DIT DING`,
                modelelement,
                modelelement.name,
                PiErrorSeverity.Error
            )
        );
        return false;
    }

}
