import { type Box, type FreNode, TableBox, TableBoxRowOriented } from '@freon4dsl/core';

export class TableBox2 extends TableBox {
    constructor(
        node: FreNode,
        propertyName: string,
        conceptName: string,
        role: string,
        hasHeaders: boolean,
        children?: Box[],
        initializer?: Partial<TableBoxRowOriented>
    ) {
        super(node, propertyName, conceptName, role, hasHeaders, children, initializer);
    }
}
