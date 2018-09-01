/* eslint-disable no-unused-vars,import/no-extraneous-dependencies,class-methods-use-this */

// eslint-disable-next-line import/no-extraneous-dependencies
const chai = require('chai');
// eslint-disable-next-line prefer-destructuring
const expect = chai.expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('Tests deleteComplete', () => {
    let event;
    let app;
    let proxyDynamoDB;
    let dynamoDbScanStub;
    let dynamoDbDeleteStub;
    beforeEach(() => {
        event = {};
        proxyDynamoDB = class {
            scan(params) {
                return {
                    promise: () => {},
                };
            }

            delete(params) {
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
        dynamoDbScanStub = sinon.stub(proxyDynamoDB.prototype, 'scan')
            .returns({
                promise: () => Promise.resolve({
                    Items: [
                        {
                            todo_id: '1001',
                            active: true,
                            description: 'What TODO next?',
                        },
                        {
                            todo_id: '1002',
                            active: false,
                            description: 'What TODO next?',
                        },
                        {
                            todo_id: '1003',
                            active: false,
                            description: 'What TODO next?',
                        },
                    ].filter(item => (item.active === false)),
                    Count: 2,
                }),
            });

        dynamoDbDeleteStub = sinon.stub(proxyDynamoDB.prototype, 'delete')
            .returns({
                promise: () => Promise.resolve({
                    Attributes: [
                        {
                            todo_id: '1002',
                        },
                        {
                            todo_id: '1003',
                        },
                    ].filter(item => (item.active === false)),
                }),
            });

        const result = await app.deleteComplete(event);

        expect(dynamoDbScanStub.calledOnce).to.be.equal(true);
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');
        expect(result.body).to.be.equal('2 items submitted for deletion\n');
    });

    it('should 404 response when not data exist', async () => {
        dynamoDbScanStub = sinon.stub(proxyDynamoDB.prototype, 'scan')
            .returns({ promise: () => Promise.resolve({}) });

        const result = await app.deleteComplete(event);

        expect(dynamoDbScanStub.calledOnce).to.be.equal(true);
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(404);
        expect(result.body).to.be.equal('NO ITEMS FOUND FOR DELETION\n');
    });

    it('should 500 response when invalid data exist', async () => {
        dynamoDbScanStub = sinon.stub(proxyDynamoDB.prototype, 'scan')
            .returns({
                promise: () => Promise
                    .reject(new Error('ValidationException: One of the required keys was not given a value')),
            });

        const result = await app.deleteComplete(event);
        expect(dynamoDbScanStub.calledOnce).to.be.equal(true);
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(500);
        expect(result.body.message).to.be.equal('ValidationException: One of the required keys was not given a value');
    });
});
