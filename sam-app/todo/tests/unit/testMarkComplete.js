/* eslint-disable no-unused-vars,import/no-extraneous-dependencies,class-methods-use-this */

// eslint-disable-next-line import/no-extraneous-dependencies
const chai = require('chai');
// eslint-disable-next-line prefer-destructuring
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('Tests markComplete', () => {
    let event;
    let app;
    let proxyDynamoDB;
    let dynamoDbPutStub;
    beforeEach(() => {
        event = {
            body: '{"todo_id": "1001", "active": true, "description": "Something TODO"}',
        };
        proxyDynamoDB = class {
            put(params) {
                return {
                    promise: () => {},
                };
            }
        };
        app = proxyquire('../../app.js', {
            'aws-sdk': {
                DynamoDB: {
                    DocumentClient: proxyDynamoDB,
                },
            },
        });
    });

    it('should successful response when data exist', async () => {
        dynamoDbPutStub = sinon.stub(proxyDynamoDB.prototype, 'put')
            .returns({
                promise: () => Promise.resolve({
                }),
            });

        const result = await app.markComplete(event);

        expect(dynamoDbPutStub.calledOnce).to.be.equal(true);
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');
        expect(result.body).to.be.equal('TODO item marked complete with todo_id = 1001\n');
    });

    it('should successful response when invalid data exist', async () => {
        dynamoDbPutStub = sinon.stub(proxyDynamoDB.prototype, 'put')
            .returns({
                // eslint-disable-next-line prefer-promise-reject-errors
                promise: () => Promise.reject(new Error('ValidationException: One of the required keys was not given a value')),
            });

        const result = await app.markComplete(event);

        expect(dynamoDbPutStub.calledOnce).to.be.equal(true);
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(500);
        expect(result.body.message).to.be.equal('ValidationException: One of the required keys was not given a value');
    });
});
