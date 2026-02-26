import sgMail from '@sendgrid/mail';

// Setup SendGrid using the Web API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const sendEmailOTP = async (email: string, otp: string) => {
    try {
        const htmlTemplate = `
      <div style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px; text-align: center;">
        <h2 style="color: #4F46E5;">Jhuggee Authentication</h2>
        <p style="color: #555;">Your One-Time Password (OTP) for verifying your email is:</p>
        <div style="margin: 20px auto; padding: 15px; max-width: 200px; background-color: #fff; border: 2px dashed #F97316; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #777; font-size: 13px;">This OTP will expire in 10 minutes. Please do not share this with anyone.</p>
        <p style="color: #aaa; margin-top: 30px; font-size: 11px;">&copy; Jhuggee Marketplace</p>
      </div>
    `;

        const msg = {
            to: email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || "support@jhuggee.com",
                name: "Jhuggee",
            },
            subject: "Jhuggee - Your Verification OTP",
            html: htmlTemplate,
        };

        const response = await sgMail.send(msg);
        console.log("Email sent successfully via SendGrid! Status code:", response[0].statusCode);
        return true;
    } catch (error: any) {
        console.error("Error sending email OTP via SendGrid:");
        if (error.response) {
            console.error(error.response.body);
        } else {
            console.error(error);
        }

        // If we're in development and don't have SMTP configured, we just simulate sending it
        if (process.env.NODE_ENV === "development" && !process.env.SENDGRID_API_KEY) {
            console.warn("⚠️ Sendgrid API Key not found in development! Simulated sending OTP:", otp, "to", email);
            return true;
        }
        return false;
    }
};
