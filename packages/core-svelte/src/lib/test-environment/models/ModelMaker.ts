import { ElementWithList } from './ElementWithList.js';
import { SimpleElement } from './SimpleElement.js';
import { ElementWithOptional } from './ElementWithOptional.js';
import { AST } from '@freon4dsl/core';

export class ModelMaker {
    static makeList(name: string): ElementWithList {
        const owner: ElementWithList = new ElementWithList(name);
        AST.change(() => {
            owner.myList.push(new SimpleElement(name + '_ELEMENT1'));
            owner.myList.push(new SimpleElement(name + '_ELEMENT2'));
            owner.myList.push(new SimpleElement(name + '_ELEMENT3'));
            owner.myList.push(new SimpleElement(name + '_ELEMENT4'));
        });
        return owner;
    }

    static makeOptional(): ElementWithOptional {
        const owner: ElementWithOptional = new ElementWithOptional('OPTIONAL-OWNER');
        const optional: SimpleElement = new SimpleElement('OPTIONAL_ELEMENT');
        owner.myOptional = optional;
        return owner;
    }
}
