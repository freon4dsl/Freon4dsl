"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHandler = void 0;
var fs = require("fs");
var FileHandler = /** @class */ (function () {
    function FileHandler() {
    }
    /**
     * Reads a string from the file located at 'filepath'. If the
     * file is not present an Error will be thrown.
     * @param filepath
     */
    FileHandler.prototype.stringFromFile = function (filepath) {
        // read language file
        if (!fs.existsSync(filepath)) {
            console.error(this, "File '" + filepath + "' does not exist, exiting.");
            throw new Error("File '".concat(filepath, "' not found."));
        }
        return fs.readFileSync(filepath, { encoding: "utf8" });
    };
    /**
     * Writes a string to the file located at 'filepath'. If the
     * file is not present it will be created.
     * May throw an Error if the file cannot be written or created.
     * @param filepath
     * @param output
     */
    FileHandler.prototype.stringToFile = function (filepath, output) {
        if (fs.existsSync(filepath)) {
            console.log(this, "FileHandler: file " + filepath + " already exists, overwriting it.");
        }
        fs.writeFileSync(filepath, output);
    };
    return FileHandler;
}());
exports.FileHandler = FileHandler;
