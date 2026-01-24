import nodemailer from 'nodemailer';
import crypto from 'crypto';
import User from '@/model/User';
import bcrypt from 'bcryptjs';

export const sendEmail = async ({ email, emailType, userId, context }: any) => {
    try {
        let subject = "";
        let html = "";

        // Generate a secure, random token (only used for auth-related emails)
        const hashedToken = crypto.randomBytes(32).toString('hex');

        if (emailType === "VERIFY") {
            // await User.findByIdAndUpdate(userId, 
            //     {verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000})
            subject = "Verify your email";
            html = `<p>Click <a href="${process.env.DOMAIN}/verify?token=${hashedToken}">here</a> to verify your email.</p>`;
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId,
                { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 })
            subject = "Reset your password";
            html = `<p>Click <a href="${process.env.DOMAIN}/reset-password?token=${hashedToken}">here</a> to reset your password or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/reset-password?token=${hashedToken}</p>`;
        } else if (emailType === "DISTRIBUTOR_UPDATE") {
            subject = "Profile Updated";
            html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0070f3;">Profile Updated</h2>
                    <p>Hello,</p>
                    <p>Your distributor profile details have been updated by the manufacturer.</p>
                    ${context?.message ? `<p>${context.message}</p>` : ''}
                    <p>If you did not authorize this change, please contact support immediately.</p>
                    <hr>
                    <p style="font-size: 12px; color: #888;">SmartTrace Security Team</p>
                </div>
            `;
        } else if (emailType === "DISTRIBUTOR_WELCOME") {
            subject = "Welcome to SmartTrace Network";
            html = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0070f3;">Welcome to SmartTrace</h2>
                    <p>Hello,</p>
                    <p>You have been registered as an authorized distributor in the SmartTrace Supply Chain Network.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Username:</strong> ${context?.username}</p>
                        <p><strong>Password:</strong> ${context?.password}</p>
                        <p><strong>Distributor ID:</strong> ${context?.businessId}</p>
                    </div>
                    <p>Please login immediately and change your password for security.</p>
                    <p><a href="${process.env.DOMAIN}/login">Login to Dashboard</a></p>
                    <hr>
                    <p style="font-size: 12px; color: #888;">SmartTrace Security Team</p>
                </div>
            `;
        }

        const transport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT) || 587,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const mailOptions = {
            from: 'support@smarttrace.com',
            to: email,
            subject: subject,
            html: html
        }

        const mailresponse = await transport.sendMail(mailOptions);
        return mailresponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
}
