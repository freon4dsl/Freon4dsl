import * as fs from "fs";

// For all different line endings
const END_OF_LINE = /\r\n|\r|\n/;

type Include = {
    attribute: string;
    path: string;
};
/**
 * Represents an AsciiDoc file with attribute definitions and includes.
 * All other structure is ignored.
 */
export class AsciidocFile {
    public directory: string = ".";
    public name: string;
    public contents: string = "";
    public attributes: Map<string, string> = new Map<string, string>();
    public includes: Include[] = [];

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Read the whole file in memory.
     */
    public read(): void {
        this.contents = fs.readFileSync(this.directory + "/" + this.name, "utf8");
    }

    /**
     * Find all attribute definitions and all includes in the asciidoc file
     * and store them in the respective properties.
     */
    public parse(): void {
        const lines = this.contents.split(END_OF_LINE);
        lines.forEach(line => {
            if (line.startsWith("include::")) {
                const match = line.match(
                    /^(include::{)(?<attribute>[A-Za-z0-9_]+)(})(?<path>[^[]+)(\[tag=[A-Za-z0-9_]+\])?$/
                );
                const attribute = match["groups"]["attribute"];
                const path = match["groups"]["path"];
                this.includes.push({ attribute: attribute, path: path });
            } else {
                const match: string[] = line.match(/^(:)(?<attribute>[A-Za-z0-9_\.]+)(:)( *)(?<value>.+)/);
                if (match !== null) {
                    const attribute = match["groups"]["attribute"];
                    const attributeValue = match["groups"]["value"];
                    this.attributes.set(attribute, attributeValue);
                }
            }
        });
    }

    /**
     * Copy all included files to the Antora example folder.
     */
    public copyFiles() {
        for (let [key, value] of this.attributes) {
            console.log("Attribute [" + key + "] = [" + value + "]");
        }
        this.includes.forEach(inc => {
            const source = this.directory + this.attributes.get(inc.attribute) + inc.path;
            const target = this.directory + "../examples" + inc.path;
            console.log("Copy from [" + source + "] to [" + target + "]");
            this.createDirIfNotExisting(target);
            fs.copyFileSync(source, target);
        });
    }

    /**
     * Helper method
     * @param dir
     */
    private createDirIfNotExisting(dir: string) {
        // console.log("createDirIfNotExisting: " + dir);
        const parts = dir.split("/");
        let current = ".";
        // console.log(parts);
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            current = current + "/" + part;
            // console.log("checking " + current);
            if (!fs.existsSync(current)) {
                // console.log("creating part " + part);
                fs.mkdirSync(current);
            }
        }
    }
}
