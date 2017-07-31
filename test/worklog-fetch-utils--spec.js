/**
 * Created by drykovanov on 24.07.2017.
 */
const utils = require('../lib/worklog-fetch-utils');
const Promise = require('bluebird');
const sinon = require('sinon');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;


chai.should();

describe("network workarounds - undefined responses", () => {
    it("should fail for undefined response", Promise.coroutine(function * () {
        //given
        const response = undefined;

        //when
        const promise = utils.promiseUndefinedChecker(Promise.resolve(response));

        //then
        yield promise.should.be.rejected;
    }));
});

describe("network workarounds - repetable promise", () => {
    it("should make repeatable attempts to request for data in cause of fail", Promise.coroutine(function * () {
        //given
        const getTargetPromiseFactory = sinon.spy(() => Promise.reject(new Error("test error")));
        const maxAttemptCount = 3;

        //when
        const promise = utils.repeatablePromise(getTargetPromiseFactory, maxAttemptCount);

        //then
        yield promise.should.be.rejected;
        getTargetPromiseFactory.callCount.should.be.eq(maxAttemptCount);
    }));

    it("should handle success response in repeatable attempts for any request", Promise.coroutine(function * () {
        //given
        const getTargetPromiseFactory = sinon.spy(() => Promise.resolve());

        //when
        const promise = utils.repeatablePromise(getTargetPromiseFactory);

        //then
        yield promise.should.be.fulfilled;
    }));
});

