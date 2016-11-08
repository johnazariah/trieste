import { BatchResult } from "../models";

/**
 * Delete an entity by ID from the Batch client
 */
export class DeleteProxy {
    constructor(private entity: any) {
    }

    public execute(id: string, options: any): Promise<BatchResult> {
        return new Promise((resolve, reject) => {
            this.entity.deleteMethod(id, options, (error, result, request, response) => {
                if (error) { return reject(error); }
                return resolve();
            });
        });
    }
}
