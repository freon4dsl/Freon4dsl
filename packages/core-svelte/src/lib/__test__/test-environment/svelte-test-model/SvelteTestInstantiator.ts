import {OtherType, SimpleNode, SvelteTestUnit} from "$lib/__test__/test-environment/svelte-test-model/language/gen";
import {AST, type FreNamedNode, type FreNode, FreNodeReference} from "@freon4dsl/core";

export class SvelteTestInstantiator {
    static makeTestUnit(name: string): SvelteTestUnit {
        let result: SvelteTestUnit | undefined = undefined;
        AST.change(() => {
            const list1: SimpleNode[] = this.makeSimpleNodeList('LIST1');
            const list2: SimpleNode[] = this.makeSimpleNodeList('LIST2');
            const list3: OtherType[] = this.makeOtherTypeList('LIST3');
            const list4: SimpleNode[] = this.makeSimpleNodeList('LIST4');
            const list5: SimpleNode[] = this.makeSimpleNodeList('LIST5');
            const list6: OtherType[] = this.makeOtherTypeList('LIST6');
            const list7: FreNodeReference<SimpleNode>[] = this.makeRefList<SimpleNode>(list1, 'LIST7');
            const list8: FreNodeReference<SimpleNode>[] = this.makeRefList<SimpleNode>(list2, 'LIST8');
            const list9: FreNodeReference<OtherType>[] = this.makeRefList<OtherType>(list3, 'LIST9');
            result = SvelteTestUnit.create({name: name, myList1: list1, myList2: list2, myList3: list3,
                myList4: list4, myList5: list5, myList6: list6,
                myList7: list7,
                myList8: list8,
                myList9: list9
            })
        })
        if (!!result) {
            return result;
        } else {
            return new SvelteTestUnit('id32');
        }
    }

    static makeSimpleNodeList(name: string): SimpleNode[] {
        const result: SimpleNode[] = [];
        // AST.change(() => {
            result.push(SimpleNode.create({name: name + '-ELEMENT1'}));
            result.push(SimpleNode.create({name: name + '-ELEMENT2'}));
            result.push(SimpleNode.create({name: name + '-ELEMENT3'}));
            result.push(SimpleNode.create({name: name + '-ELEMENT4'}));
        // });
        return result;
    }
    static makeOtherTypeList(name: string): OtherType[] {
        const result: OtherType[] = [];
        // AST.change(() => {
        result.push(OtherType.create({name: name + '_OTHER1'}));
        result.push(OtherType.create({name: name + '_OTHER2'}));
        result.push(OtherType.create({name: name + '_OTHER3'}));
        result.push(OtherType.create({name: name + '_OTHER4'}));
        result.push(OtherType.create({name: name + '_OTHER5'}));
        // });
        return result;
    }

    static makeRefList<T extends FreNamedNode>(list: T[], name: string): FreNodeReference<T>[] {
        const result: FreNodeReference<T>[] = [];
        list.forEach(elem => {
            result.push(FreNodeReference.create<T>(elem, 'SimpleNode'));
        });
        return result;
    }
}
