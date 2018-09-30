const chai = require('chai');
const FizzBuzz = require('../../src/fizz_buzz');

const { expect } = chai;

describe('Tests FizzBuzz', () => {
  it('3ならばFizzを返す', () => {
    expect(FizzBuzz.generate(3)).to.equal('Fizz');
  });
});
