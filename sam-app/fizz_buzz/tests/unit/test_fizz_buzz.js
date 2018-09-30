const chai = require('chai');
const FizzBuzz = require('../../src/fizz_buzz');

const { expect } = chai;

describe('Tests FizzBuzz', () => {
  it('3ならばFizzを返す', () => {
    expect(FizzBuzz.generate(3)).to.equal('Fizz');
  });

  it('6ならばFizzを返す', () => {
    expect(FizzBuzz.generate(6)).to.equal('Fizz');
  });

  it('30ならばFizzを返す', () => {
    expect(FizzBuzz.generate(30)).to.equal('Fizz');
  });

  it('5ならばBuzzを返す', () => {
    expect(FizzBuzz.generate(5)).to.equal('Buzz');
  });
});
