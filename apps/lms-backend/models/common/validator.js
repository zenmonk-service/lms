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

exports.isValidTime = (time) => {
  return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
};