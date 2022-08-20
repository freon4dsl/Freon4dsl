import { ElementWithList } from "./ElementWithList";
import { SimpleElement } from "./SimpleElement";
import { ElementWithOptional } from "./ElementWithOptional";
import { ElementWithText } from "./ElementWithText";

export class ModelMaker {
    static makeList(): ElementWithList {
        const owner: ElementWithList = new ElementWithList("LIST-OWNER");
        const element1: SimpleElement = new SimpleElement("LIST_ELEMENT1");
        const element2: SimpleElement = new SimpleElement("LIST_ELEMENT2");
        const element3: SimpleElement = new SimpleElement("LIST_ELEMENT3");
        const element4: SimpleElement = new SimpleElement("LIST_ELEMENT4");
        owner.myList.push(element1);
        owner.myList.push(element2);
        owner.myList.push(element3);
        owner.myList.push(element4);
        return owner;
    }

    static makeOptional(): ElementWithOptional {
        const owner: ElementWithOptional = new ElementWithOptional("OPTIONAL-OWNER");
        const optional: SimpleElement = new SimpleElement("OPTIONAL_ELEMENT");
        owner.myOptional = optional;
        return owner;
    }

    static makeText(): ElementWithText {
        const owner: ElementWithText = new ElementWithText("TEXT-OWNER");
        owner.myText1 = "initialText1";
        owner.myText2 = "initialText2";
        return owner;
    }
}
