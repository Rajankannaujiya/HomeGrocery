import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
  secure: false,
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.EMAILPASS,
  },
});

export const sendMail = async(to:string, subject: string, html: string)=>{
    const info = await transporter.sendMail({
    from: `"HomeGrocery" <${process.env.EMAILUSER}>`,
    to,
    subject,
    html
  });

  console.log("Message sent:", info.messageId);
}
