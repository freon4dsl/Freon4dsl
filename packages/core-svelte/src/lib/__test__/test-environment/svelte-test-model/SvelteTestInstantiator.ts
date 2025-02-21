import {OtherType, SimpleNode, SvelteTestUnit} from "$lib/__test__/test-environment/svelte-test-model/language/gen";
import {AST} from "@freon4dsl/core";

export class SvelteTestInstantiator {
    static makeTestUnit(name: string): SvelteTestUnit {
        let result: SvelteTestUnit | undefined = undefined;
        AST.change(() => {
            const list1: SimpleNode[] = this.makeSimpleNodeList(name + '-LIST1');
            const list2: SimpleNode[] = this.makeSimpleNodeList(name + '-LIST2');
            const list3: OtherType[] = this.makeOtherTypeList(name + '-LIST3');
            const list4: SimpleNode[] = this.makeSimpleNodeList(name + '-LIST4');
            const list5: SimpleNode[] = this.makeSimpleNodeList(name + '-LIST5');
            const list6: OtherType[] = this.makeOtherTypeList(name + '-LIST6');
            result = SvelteTestUnit.create({name: name, myList1: list1, myList2: list2, myList3: list3, myList4: list4, myList5: list5, myList6: list6})
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
}
