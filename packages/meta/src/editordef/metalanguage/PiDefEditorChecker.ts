import { Checker } from "../../utils";
import { DefEditorLanguage } from "./DefEditorLanguage";

export class PiDefEditorChecker extends Checker<DefEditorLanguage> {

    public check(language: DefEditorLanguage): void {
        this.nestedCheck(
            {
                check: !!language.name,
                error: "Editor should have a name, it is empty"
            });
    }

}

