/**
 * Created by drykovanov on 24.07.2017.
 */
const Promise = require('bluebird');
const log4js = require('log4js');
const logger = log4js.getLogger('fetch-utils');

const promiseUndefinedChecker = (targetpromise) => {
    return targetpromise.then((response) => {
        if (response == undefined) {
            return Promise.reject(new Error("Unexpected response 'undefined' is received."));
        } else {
            return response;
        }
    });
};

const repeatablePromise = Promise.coroutine(function * (promiseFactory, maxAttemptCount) {
    let attemptCount = 0;
    let lastError;
    do {
        try {
            return yield promiseFactory();
        } catch (error) {
            attemptCount++;
            lastError = error;
            logger.debug(`Promise couldn't be processed ${error} , attempt ${attemptCount} of ${maxAttemptCount}`);
            const delay = 2000; //fixme to config
            logger.debug(`Start delay ${delay}`);
            yield Promise.delay(delay);
        }
    } while (attemptCount < maxAttemptCount);

    return Promise.reject(lastError);
});

module.exports = {
    promiseUndefinedChecker: promiseUndefinedChecker,
    repeatablePromise: repeatablePromise
};
