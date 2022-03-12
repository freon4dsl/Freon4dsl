// Generated by the ProjectIt Language Generator.
import { PiError, PiErrorSeverity } from "@projectit/core";
import { TyTestDefaultWorker } from "../utils/gen/TyTestDefaultWorker";
import { TyTestCheckerInterface } from "./gen/TyTestValidator";
import { ExpWithType } from "../language/gen";
import { TyTestEnvironment } from "../environment/gen/TyTestEnvironment";

export class CustomTyTestValidator extends TyTestDefaultWorker implements TyTestCheckerInterface {
    errorList: PiError[] = [];

    public execBeforeExpWithType(modelelement: ExpWithType): boolean {
        let hasFatalError: boolean = false;
        const typer = TyTestEnvironment.getInstance().typer;
        const writer = TyTestEnvironment.getInstance().writer;
        // typecheck equalsType (self.expr, self.type)
        if (!typer.equalsType(modelelement.expr, modelelement.type)) {
            this.errorList.push(
                new PiError(
                    "Type " +
                    writer.writeToString(typer.inferType(modelelement.expr)) +
                    " of [" +
                    writer.writeNameOnly(modelelement.expr) +
                    "] is not equal to " +
                    writer.writeToString(modelelement.type),
                    modelelement.expr,
                    writer.writeNameOnly(modelelement.expr),
                    PiErrorSeverity.Error
                )
            );
            hasFatalError = true;
        }
        return hasFatalError;
    }
}
