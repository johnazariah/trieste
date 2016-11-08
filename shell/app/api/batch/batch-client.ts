const electron = require("@node/electron");
const batchClient = (<any> electron.remote.getCurrentWindow()).batchClient;

export default batchClient;
