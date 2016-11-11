const electron = require("@node/electron");
const monitorProxy = (<any> electron.remote.getCurrentWindow()).monitorProxy;

export default monitorProxy;
