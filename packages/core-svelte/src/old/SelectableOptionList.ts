import { action, observable, makeObservable, computed } from "mobx";
import { SelectOption, PiEditor, MatchUtil, PiLogger } from "@projectit/core";

const LOGGER = new PiLogger("SelectOptionList").mute();

export class SelectOptionList {
    editor: PiEditor = null;
    options: SelectOption[] = [];
    _text: string = "";

    constructor(editor: PiEditor) {
        this.editor = editor;
        makeObservable(this, {
           options: observable,
            _text: observable,
            text: computed,
            replaceOptions: action
        });
    }

    get text() {
        return this._text;
    }

    set text(v: string) {
        this._text = v;
    }

    replaceOptions(newOptions: SelectOption[]) {
        LOGGER.log("+++ Replace length "+ this.options.length + "  with " + newOptions.length + " ["+ newOptions.map(o => o.id) + "]");
        // this.options = newOptions;
        while(this.options.length > 0) {
            this.options.pop();
        }
        newOptions.forEach(o => this.options.push(o))
    }

    getFilteredOptions(): SelectOption[] {
        const txt = this.text.trim();
        LOGGER.log("text is ["+ txt + "]");
        if( txt === "" || txt === undefined || txt === null ||  txt === "\n") {
            LOGGER.log("No filter, returning list of length "+ this.options.length)
            return this.options;
        }
        const result = this.options
            .filter(option => MatchUtil.partialMatch(txt, option.label));
        LOGGER.log("Returning filtered list of length "+ result.length+ "  from "+ this.options.length)
        return result;
    }
}


