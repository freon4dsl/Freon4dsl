import { IdProvider } from "@freon4dsl/core";

export class LionwebIdProvider implements IdProvider {
    newId(): string {
        return this.availableIds.pop();
    }

    availableIds: string[];

}
