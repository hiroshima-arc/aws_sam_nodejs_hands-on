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

  it('5ならばBuzzを返す', () => {
    expect(FizzBuzz.generate(5)).to.equal('Buzz');
  });

  it('10ならばBuzzを返す', () => {
    expect(FizzBuzz.generate(10)).to.equal('Buzz');
  });

  it('50ならばBuzzを返す', () => {
    expect(FizzBuzz.generate(50)).to.equal('Buzz');
  });

  it('15ならばFizzBuzzを返す', () => {
    expect(FizzBuzz.generate(15)).to.equal('FizzBuzz');
  });

  it('30ならばFizzBuzzを返す', () => {
    expect(FizzBuzz.generate(30)).to.equal('FizzBuzz');
  });
});
