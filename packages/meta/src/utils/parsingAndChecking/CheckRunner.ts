export type NestedCheck = { check: boolean; error: string; whenOk?: () => void };

export class CheckRunner {
    errors: string[] = [];
    warnings: string[] = [];

    constructor(errors: string[], warnings: string[]) {
        this.errors = errors;
        this.warnings = warnings;
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public hasWarnings(): boolean {
        return this.warnings.length > 0;
    }

    public simpleCheck(check: boolean, error: string): boolean {
        if (!check) {
            this.errors.push(error);
            return false;
        }
        return true;
    }

    public nestedCheck(check: NestedCheck | NestedCheck[]): void {
        if (Array.isArray(check)) {
            check.forEach(chk => this.simpleCheck(chk.check, chk.error));
        } else {
            if (this.simpleCheck(check.check, check.error)) {
                if (!!check.whenOk) {
                    check.whenOk();
                }
            }
        }
    }

    public simpleWarning(check: boolean, error: string): boolean {
        if (!check) {
            this.warnings.push(error);
            return false;
        }
        return true;
    }

    public nestedWarning(check: NestedCheck | NestedCheck[]): void {
        if (Array.isArray(check)) {
            check.forEach(chk => this.simpleWarning(chk.check, chk.error));
        } else {
            if (this.simpleWarning(check.check, check.error)) {
                if (!!check.whenOk) {
                    check.whenOk();
                }
            }
        }
    }


}
