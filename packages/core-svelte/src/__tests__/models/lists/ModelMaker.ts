import { ElementWithList } from "./ElementWithList";
import { SimpleElement } from "../one-element/SimpleElement";

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
}
