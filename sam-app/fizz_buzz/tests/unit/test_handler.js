/* eslint-disable import/no-extraneous-dependencies */

const chai = require('chai');
const app = require('../../app.js');

const { expect } = chai;

describe('Tests FizzBuzzFunction', () => {
  let event;

  beforeEach(() => {
    event = {
      body: '{}',
    };
  });

  it('3ならばFizzを返す', async () => {
    event = {
      queryStringParameters: { number: '3' },
    };
    const result = await app.generate(event);

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an('string');
    expect(result.body).to.equal('Fizz');
  });

  it("5ならば[1, 2, 'Fizz', 4, 'Buzz']を返す", async () => {
    event = {
      body: '{"count": "5"}',
    };
    const result = await app.iterate(event);

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an('array');
    expect(result.body).to.eql([1, 2, 'Fizz', 4, 'Buzz']);
  });
});
