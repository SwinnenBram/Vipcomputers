import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY || "API_KEY",
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net/v3"
  });
  try {
    const data = await mg.messages.create("sandbox24a588296b9643678e9abd3035db4d1d.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandbox24a588296b9643678e9abd3035db4d1d.mailgun.org>",
      to: ["bram Swinnen <winkel@vipcomputers.be>"],
      subject: "Hello bram Swinnen",
      text: "Congratulations bram Swinnen, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}