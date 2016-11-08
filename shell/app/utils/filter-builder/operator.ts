import formats from "./formats";

export class Operator {
    public id: string;
    public name: string;
    public format: string;

    constructor(id: string, name: string, format: string) {
        this.id = id;
        this.name = name;
        this.format = format;
    }
}

export const operators = {
    equal: new Operator("eq", "=", formats.eq),
    greaterOrEqual: new Operator("ge", ">=", formats.ge),
    greaterThan: new Operator("gt", ">", formats.gt),
    lessOrEqual: new Operator("le", "<=", formats.le),
    lessThan: new Operator("lt", "<", formats.lt),
    notEqual: new Operator("ne", "!=", formats.ne),
    startswith: new Operator("startswith", "Start with", formats.startswith),
};

function byId(src: any, id: string): any {
    for (let key of Object.keys(src)) {
        if (src[key].id === id) {
            return src[key];
        }
    }

    console.error(`Unable to find '${id}'`, src);
}

export function operatorById(id: string): Operator {
    return byId(operators, id);
}
