import { BatchResult } from "../models";

/**
 * Get an entity by ID from the Batch client
 */
export class GetProxy {
    constructor(private entity: any) {
    }

    public execute(id: string, options: any): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.get(id, options, (error, result) => {
                if (error) { return reject(error); }
                if (result) {
                    return resolve({
                        data: result,
                    });
                }
            });
        });
    }

    public executeQ(id1: string, id2: string, options: any): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.get(id1, id2, options, (error, result) => {
                if (error) { return reject(error); }
                if (result) {
                    return resolve({
                        data: result,
                    });
                }
            });
        });
    }
}
