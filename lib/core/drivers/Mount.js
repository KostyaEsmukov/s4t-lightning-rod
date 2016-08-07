

function Mount(driversState, driverName, mountpoint, remote, mirrorBoard) {
    this.driversState = driversState;
    this.driverName = driverName;
    this.mountpoint = mountpoint;
    this.remote = remote;
    this.mirrorBoard = mirrorBoard;
}

Mount.prototype.mount = function () {

};

Mount.prototype._loadDriver = function () {
    return driversState.readDriversConfig(driverName)
        .then(function(driverConf) {
            var driver = require(driversState.getModulePathByName(driverName));


            var driverName = driverConf.name;

            var type = driverConf.type;
            var permissions = base10To8(driverConf.permissions);
            // var root_permissions = MaskConversion(driverConf.root_permissions);
            var children = driverConf.children;

            logger.debug("[DRIVER] - " + this.driverName + " --> driver configuration loaded!");


        }.bind(this));
};



function base10To8(number) {
    return parseInt(number.toString(10), 8);
}


module.exports = Mount;
