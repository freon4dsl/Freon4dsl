import { Checker } from "../../utils";
import { PiDefEditorLanguage } from "./PiDefEditorLanguage";

export class PiDefEditorChecker extends Checker<PiDefEditorLanguage> {

    public check(language: PiDefEditorLanguage): void {
        this.nestedCheck(
            {
                check: !!language.name,
                error: "Editor should have a name, it is empty"
            });
    }

}

