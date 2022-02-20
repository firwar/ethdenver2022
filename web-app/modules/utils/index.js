const getRandomString = (length) => {
  let randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
};

const getRandomNumber = (length) => {
  let randomNumbers = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += randomNumbers.charAt(
      Math.floor(Math.random() * randomNumbers.length)
    );
  }
  return result;
};

export { getRandomString, getRandomNumber };
