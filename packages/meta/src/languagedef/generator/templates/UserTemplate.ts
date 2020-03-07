
export class UserTemplate {
    constructor() {
    }

    generateUserClass(userClassName: string, defaultClassName: string) {
        return `
            import { ${defaultClassName} } from "./${defaultClassName}";
        
            export class ${userClassName} extends ${defaultClassName} {
            
            }
        `
    }
}
