/* eslint-disable no-unused-vars,import/no-extraneous-dependencies,class-methods-use-this */

// eslint-disable-next-line import/no-extraneous-dependencies
const chai = require('chai');
// eslint-disable-next-line prefer-destructuring
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('Tests create', () => {
    let event;
    let app;
    let proxyDynamoDB;
    let dynamoDbPutStub;
    beforeEach(() => {
        event = {
            body: '{"todo_id": "1001", "active": true, "description": "What TODO next?"}',
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

    it('should successful response when todo_id exists', async () => {
        dynamoDbPutStub = sinon.stub(proxyDynamoDB.prototype, 'put')
            .returns({
                promise: () => Promise.resolve({
                }),
            });

        const result = await app.create(event);

        expect(dynamoDbPutStub.calledOnce).to.be.equal(true);
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');
        expect(result.body).to.be.equal('TODO item created with todo_id = 1001\n');
    });

    it('should 500 response when todo_id not exists', async () => {
        event = {
            body: '{"active": true, "description": "What TODO next?"}',
        };
        dynamoDbPutStub = sinon.stub(proxyDynamoDB.prototype, 'put')
            .returns({
                // eslint-disable-next-line prefer-promise-reject-errors
                promise: () => Promise.reject(new Error('ValidationException: One of the required keys was not given a value')),
            });

        const result = await app.create(event);

        expect(dynamoDbPutStub.calledOnce).to.be.equal(true);
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(500);
        expect(result.body.message).to.be.equal('ValidationException: One of the required keys was not given a value');
    });
});