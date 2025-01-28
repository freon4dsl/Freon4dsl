import { RtBoolean, RtObject } from "@freon4dsl/core";
import { Page } from "../../language/gen/index.js";

export class RtPage extends RtObject {
    readonly _type: string = "RtPage";
    page: Page;

    constructor(page: Page) {
        super();
        this.page = page;
    }

    equals(other: RtObject): RtBoolean {
        if (isRtPage(other)) {
            return RtBoolean.of(this.page === other.page);
        } else {
            return RtBoolean.FALSE;
        }
    }

    override toString(): string {
        return `Page: ${this.page?.name}`;
    }
}

export function isRtPage(object: any): object is RtPage {
    const _type = (object as any)?._type;
    return !!_type && _type === "RtPage";
}
