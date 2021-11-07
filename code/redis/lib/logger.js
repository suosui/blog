log4js = require('log4js');

let logger;
const initLog = () => {
    log4js.configure({
        appenders: {
            out: { type: 'file', filename: 'out.log' },
            console: { type: 'console' }
        },
        categories: {
            cheese: { appenders: ['out'], level: 'error' },
            another: { appenders: ['console'], level: 'trace' },
            default: { appenders: ['console', 'out'], level: 'trace' }
        }
    });
    logger = log4js.getLogger("default");
}

const getLogger = () => {
    if (!logger) {
        initLog();
    }
    return logger;
}

module.exports = {
    initLog,
    logger: getLogger
}