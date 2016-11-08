import { Constraints } from "./constraints";
import { Duration } from "moment";

/**
 * Specifies the execution constraints for tasks.
 */
export default class TaskConstraints extends Constraints {
    public retentionTime: Duration;
}
