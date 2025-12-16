const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const { Resend } = require("resend");

const mailTemplatePath = path.join(__dirname, "..", "/views/mailTemplate.html");
const mailTemplate = fs.readFileSync(mailTemplatePath, { encoding: "utf-8" });

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendMail = async (data, resetPasswordLink) => {
  const template = mailTemplate
    .replace("[resetPasswordLink]", resetPasswordLink)
    .replace("[email]", data?.email)
    .replace("[name]", data?.name);

  const emailPayload = {
    from: "Zenmonk <onboarding@resend.dev>",
    to: data?.email,
    subject: "Reset Password",
    html: template,
  };

  try {
    const response = await resend.emails.send(emailPayload);
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data;
  } catch (error) {
    console.error("Resend error", error);
    throw error;
  }
};
