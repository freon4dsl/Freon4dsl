import { AsciidocFile } from "./AsciidocFile";
import * as program from "commander";
import * as fs from "fs";

// console.log("Args: " + process.argv);

const cli = program
    .version("1.0.0")
    .usage("[options]")
    .option("-e, --examples [examples]", "The module examples folder", "../examples")
    .option("-d, --directory <directory>", "The directory with the asciidoc files")
    .parse(process.argv);
const dirName = cli.directory;
const exampleDir = dirName + "../examples";

function copyDir(dirName: string) {
    // console.log("copyDir " + dirName);

    const dir: fs.Dirent[] = fs.readdirSync(dirName, {encoding: "utf8", withFileTypes: true});
    for (let file of dir) {
        console.log("================================== fixing " + file.name);

        if (file.isFile()) {
            const adf = new AsciidocFile(file.name);
            adf.directory = dirName;
            adf.read();
            adf.parse();
            adf.copyFiles(exampleDir);
        } else if (file.isDirectory()) {
            copyDir(dirName + file.name + "/");
        }
    }

}

copyDir(dirName);
