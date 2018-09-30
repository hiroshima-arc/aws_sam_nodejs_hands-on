module.exports = class FizzBuzz {
  static generate(number) {
    let value = number;
    if (number % 3 === 0) {
      value = 'Fizz';
    } else if (number % 5 === 0) {
      value = 'Buzz';
    }
    return value;
  }
};
