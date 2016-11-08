export class ObjectUtils {
    /**
     * Return the values of an object.
     */
    public static values<T>(obj: { [key: string]: T }): T[] {
        return Object.keys(obj).map(x => obj[x]);
    }

    public static slice(obj: { [key: string]: any }, keys: string[]): { [key: string]: any } {
        const out = {};
        for (let key of keys) {
            if (key in this) {
                out[key] = obj[key];
            }
        }
        return out;
    }

    public static except(obj: { [key: string]: any }, keys: string[]): { [key: string]: any } {
        const out = Object.assign({}, obj);
        for (let key of keys) {
            delete out[key];
        }
        return out;
    }
}
