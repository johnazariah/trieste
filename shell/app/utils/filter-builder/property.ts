import { Filter } from "./filter";
import { or, prop } from "./filter-builder";
import { Operator, operators } from "./operator";

export class Property extends Filter {
    public name: string;
    public operator: Operator;
    public value: any;

    constructor(name: string) {
        super();
        this.name = name;
        this.operator = null;
    }

    public do(operator: Operator, value: any): Filter {
        this.operator = operator;
        this.value = value;
        return this;
    }

    public eq(value: any, validOptions?: any[]): Filter {
        if (validOptions) {
            if (validOptions.indexOf(value) === -1) {
                return null;
            }
        }
        return this.do(operators.equal, value);
    }

    public inList(values: any[], validOptions?: any[]): Filter {
        const props = values.map((value) => prop(this.name).eq(value, validOptions));
        return or(...props);
    }

    public startswith(value: any): Filter {
        return this.do(operators.startswith, value);
    }

    public ne(value: any): Filter {
        return this.do(operators.notEqual, value);
    }

    public ge(value: any): Filter {
        return this.do(operators.greaterOrEqual, value);
    }

    public gt(value: any): Filter {
        return this.do(operators.greaterThan, value);
    }

    public le(value: any): Filter {
        return this.do(operators.lessOrEqual, value);
    }

    public lt(value: any): Filter {
        return this.do(operators.lessThan, value);
    }

    public operatorName(): string {
        return this.operator && this.operator.name;
    }

    public toOData(): string {
        return this.operator.format.format(this.name, this._formattedValue());
    }

    public isEmpty() {
        return false;
    }

    private _formattedValue(): string {
        if (typeof this.value === "string") {
            return "'{0}'".format(this.value);
        } else if (this.value instanceof Date) {
            return "datetime'{0}'".format(this.value.toJSON());
        } else {
            return this.value.toString();
        }
    }
}
