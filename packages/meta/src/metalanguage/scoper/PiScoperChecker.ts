import { Checker } from "../Checker";
import { ScoperDefinition } from "./ScoperDefinition";

export class PiScoperChecker extends Checker<ScoperDefinition> {

    public check(language: ScoperDefinition): void {
        this.nestedCheck(
            {
                check: true,
                error: "This error never happens"
            });
    }

}

