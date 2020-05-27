const {transports, createLogger, format} = require('winston');

function getLogger(module) {
    const path = module.filename.split('/').slice(-2).join('/');


    return createLogger({
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports : [
            new transports.Console({
                colorize:   true,
                level:      'debug',
                label:      path
            }),
            // new transports.File({ filename: 'logs/error.log', level: 'error' }),
            // new transports.File({ filename: 'logs/combined.log' })
        ],
        
    });
}

module.exports = getLogger;