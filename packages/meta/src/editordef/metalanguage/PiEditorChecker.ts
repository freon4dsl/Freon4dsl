import { Checker } from "../../utils/Checker";
import { PiLanguageEditor } from "./PiLanguageEditor";

export class PiEditorChecker extends Checker<PiLanguageEditor> {

    public check(language: PiLanguageEditor): void {
        this.nestedCheck(
            {
                check: !!language.name,
                error: "Editor should have a name, it is empty"
            });
    }

}

