import { IdProvider } from "../../util/index";

export class LocalLionwebIdProvider implements IdProvider {
    index: number = 300;

    newId(): string {
        this.index++;
        let newId = "ID-" + this.index;
        while (this.existingIds.includes(newId)) {
            this.index++;
            newId = "ID-" + this.index;
        }
        this.usedId(newId);
        return newId;
    }

    existingIds: string[] = [];
    usedId(id: string): void {
        this.existingIds.push(id);
    }
}
