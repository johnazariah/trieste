const electron = require("@node/electron");
const launchProxy = (<any> electron.remote.getCurrentWindow()).launchProxy;

export default launchProxy;
