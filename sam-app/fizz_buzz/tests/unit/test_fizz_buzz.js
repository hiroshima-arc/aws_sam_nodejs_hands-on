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

  it('1ならば1を返す', () => {
    expect(FizzBuzz.generate(1)).to.equal(1);
  });

  it('101ならば101を返す', () => {
    expect(FizzBuzz.generate(101)).to.equal(101);
  });

  it("5ならば[1, 2, 'Fizz', 4, 'Buzz']を返す", () => {
    expect(FizzBuzz.iterate(5)).to.eql([1, 2, 'Fizz', 4, 'Buzz']);
  });
});
