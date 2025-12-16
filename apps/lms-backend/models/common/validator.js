const { validate } = require("uuid");

exports.isValidUUID = (id) => {
  return validate(id);
};

exports.isValidPhoneNumber = async (phoneNumber) => {
  const phoneNumberRegex = new RegExp(/^\+?[1-9]\d{1,14}$/)
  return phoneNumberRegex.test(phoneNumber);
}

exports.isValidDate = (datString) => {
  return (datString && new Date(datString).toString() !== "Invalid Date") || false;
}