"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printModel1 = exports.ConvertLionCore2FreonAction = void 0;
var core_1 = require("@freon4dsl/core");
var ts_command_line_1 = require("@rushstack/ts-command-line");
var fs_1 = require("fs");
var LionWeb2FreonTemplate_1 = require("./LionWeb2FreonTemplate");
var ConvertLionCore2FreonAction = /** @class */ (function (_super) {
    __extends(ConvertLionCore2FreonAction, _super);
    function ConvertLionCore2FreonAction() {
        return _super.call(this, {
            actionName: "folder",
            summary: "Create .ast file from folder containing LionWeb Meta-model JSON files",
            documentation: "Lionweb to Freon."
        }) || this;
    }
    ConvertLionCore2FreonAction.prototype.onDefineParameters = function () {
        this.metamodelfile = this.defineStringParameter({
            argumentName: "METAMODEL_FILE",
            defaultValue: "metamodel.lmm",
            parameterLongName: "--metamodel",
            parameterShortName: "-m",
            description: "File containing the LionWeb metamodel in JSON format"
        });
    };
    ConvertLionCore2FreonAction.prototype.onExecute = function () {
        var self = this;
        return new Promise(function (resolve, rejest) {
            var freonString = self.convertLionCore2Freon();
        });
    };
    ConvertLionCore2FreonAction.prototype.convertLionCore2Freon = function () {
        return __awaiter(this, void 0, void 0, function () {
            var serialzer, filename, metamodel, ts, result;
            return __generator(this, function (_a) {
                serialzer = new core_1.FreLionwebSerializer();
                filename = this.metamodelfile.value;
                metamodel = JSON.parse(fs_1.default.readFileSync(filename).toString());
                ts = serialzer.toTypeScriptInstance(metamodel);
                result = (new LionWeb2FreonTemplate_1.LionWeb2FreonTemplate().generateFreonAst(ts));
                console.log(result);
                return [2 /*return*/, result];
            });
        });
    };
    return ConvertLionCore2FreonAction;
}(ts_command_line_1.CommandLineAction));
exports.ConvertLionCore2FreonAction = ConvertLionCore2FreonAction;
function printModel1(element) {
    return JSON.stringify(element, skipReferences, "  ");
}
exports.printModel1 = printModel1;
// const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex", "$id"];
var ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex"];
function skipReferences(key, value) {
    if (ownerprops.includes(key)) {
        return undefined;
    }
    else if (value instanceof core_1.FreNodeReference) {
        return "REF => " + value.name;
        // }else if (key.startsWith("_FRE_")){
        //     return {key: "++" + key , value: "!!" + value};
    }
    else {
        return value;
    }
}
