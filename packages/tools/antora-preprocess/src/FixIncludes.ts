import { AsciidocFile } from "./AsciidocFile";
import * as program from "commander";
import * as fs from "fs";

console.log("Args: " + process.argv);

const cli = program
    .version("1.0.0")
    .usage("[options]")
    .option("-e, --examples [examples]", "The module examples folder", "../examples")
    .option("-d, --directory <directory>", "The directory with the asciidoc files")
    .parse(process.argv);

const dirName = cli.directory;
const dir: string[] = fs.readdirSync(dirName);

console.log("Dir " + dir);

for (let file of dir) {
    console.log("================================== file " + file);

    const adf = new AsciidocFile(file);
    adf.directory = dirName;
    adf.read();
    adf.parse();
    adf.copyFiles();
}
