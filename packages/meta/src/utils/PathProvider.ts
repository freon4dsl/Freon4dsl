
/**
 * Defines all paths to files and folders that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class PathProvider {

    public static editFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".edit";
    }
    
    public static langFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".lang";
    }
    
    public static validFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".valid";
    }
    
    public static scopeFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".scop";
    }
    
    public static typeFile(defFolder: string, languageFile: string) : string {
        let languageName : string = languageFile.slice(0, languageFile.length-5);
        return defFolder + "/" + languageName + ".type";
    }
    
}
