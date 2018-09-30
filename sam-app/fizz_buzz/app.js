/* eslint-disable no-console,max-len,prefer-destructuring */

const FizzBuzz = require('./src/fizz_buzz');

const createResponse = (statusCode, body) => ({
  statusCode,
  body,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

exports.generate = async (event) => {
  let number;
  let data;
  if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
    if (event.queryStringParameters.number !== null && event.queryStringParameters.number !== undefined) {
      number = event.queryStringParameters.number;
    }
  }

  try {
    data = FizzBuzz.generate(number);
  } catch (err) {
    console.log(`Application error occurred: ${err}`);
    return createResponse(500, err);
  }

  console.log(`Application execute with params: ${number}`);
  return createResponse(200, data);
};

exports.iterate = async (event) => {
  const params = {
    Item: JSON.parse(event.body),
  };
  let data;

  try {
    data = FizzBuzz.iterate(params.Item.count);
  } catch (err) {
    console.log(`Application error occurred: ${err}`);
    return createResponse(500, err);
  }

  console.log(`Application execute with params: ${JSON.stringify(params.Item)}`);
  return createResponse(200, data);
};
