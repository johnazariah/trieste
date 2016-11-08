import { connectors } from "./connector";
import { Filter } from "./filter";
import { Property } from "./property";

export function prop(name: string): Property {
    return new Property(name);
}

export function and(...args: Filter[]): Filter {
    return new Filter(connectors.and, args);
}

export function or(...args: Filter[]): Filter {
    return new Filter(connectors.or, args);
}

export function none(): Filter {
    return new Filter();
}
