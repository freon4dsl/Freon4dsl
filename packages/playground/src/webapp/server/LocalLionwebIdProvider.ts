import { IdProvider } from "@freon4dsl/core";

export class LocalLionwebIdProvider implements IdProvider {
    index: number = 300;

    newId(): string {
        let newId = "ID-" + this.index;
        this.index++;
        while (this.existingIds.includes(newId)) {
            let newId = "ID-" + this.index;
            this.index++;
        }
        this.usedId(newId);
        return newId;
    }

    existingIds: string[] = [];
    usedId(id: string): void {
        this.existingIds.push(id);
    }
}
