
export class Connector {
    public id: string;
    public name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}

export const connectors = {
    and: new Connector("and", "And"),
    or: new Connector("or", "Or"),
};

function byId(src: any, id: string): any {
    for (let key of Object.keys(src)) {
        if (src[key].id === id) {
            return src[key];
        }
    }

    console.error(`Unable to find '${id}'`, src);
}

export function connectorById(id: string): Connector {
    return byId(connectors, id);
}
