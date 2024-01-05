import nodemailer from "nodemailer";

const sendEmail = async function (email, subject, message){

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_FROM_EMAIL,
            pass: process.env.SMTP_PASSWORD
            
        }
    });
    //send mail with defiend transport object
   await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL, // sender address
        to: email , // list of receivers
        subject: subject, // Subject line
        html: message, // html body
    });
};

export default sendEmail;