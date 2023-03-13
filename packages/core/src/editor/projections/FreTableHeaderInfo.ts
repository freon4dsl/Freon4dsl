export class FreTableHeaderInfo {
    conceptName: string;
    projectionName: string;
    headerRow: string[];

    constructor(conceptName: string, projectionName: string, headerRow: string[]) {
        this.headerRow = headerRow;
        this.conceptName = conceptName;
        this.projectionName = projectionName;
    }
}
