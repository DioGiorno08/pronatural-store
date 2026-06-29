import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import HTMLRecoveryEmail from "../utils/sendMailRecovery.js";
import { config } from "../../config.js";
import usersModel from "../models/users.js";
import empleadosModel from "../models/empleados.js";

const recoveryAdminController = {};

recoveryAdminController.requestCode = async (req, res) => {
    try {
        const { email } = req.body;

        let userFound = await usersModel.findOne({ correo: email });
        let role = "Admin";
        let isEmpleado = false;

        if (!userFound) {
            userFound = await empleadosModel.findOne({ correo: email });
            role = "Employee";
            isEmpleado = true;
        }

        if (!userFound) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const randomCode = crypto.randomBytes(3).toString("hex");

        const token = jsonwebtoken.sign(
            { email, randomCode, userType: role, verified: false, isEmpleado },
            config.JWT.secret,
            { expiresIn: "15m" },
        );

        res.cookie("recoveryAdminCookie", token, { maxAge: 15 * 60 * 1000 });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.email.user_email,
                pass: config.email.user_password,
            },
        });

        const mailOptions = {
            from: config.email.user_email,
            to: email,
            subject: "Código de recuperación de cuenta administrativa",
            html: HTMLRecoveryEmail(randomCode),
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(500).json({ message: "Error enviando email" });
            }
            return res.status(200).json({ message: "email sent" });
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

recoveryAdminController.verifyCode = async (req, res) => {
    try {
        const { code } = req.body;
        const token = req.cookies.recoveryAdminCookie;
        
        if (!token) return res.status(400).json({ message: "No recovery token found" });

        const decoded = jsonwebtoken.verify(token, config.JWT.secret);

        if (code !== decoded.randomCode) {
            return res.status(400).json({ message: "Código inválido" });
        }

        const newToken = jsonwebtoken.sign(
            { email: decoded.email, userType: decoded.userType, verified: true, isEmpleado: decoded.isEmpleado },
            config.JWT.secret,
            { expiresIn: "15m" },
        );

        res.cookie("recoveryAdminCookie", newToken, { maxAge: 15 * 60 * 1000 });
        return res.status(200).json({ message: "Code verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

recoveryAdminController.newPassword = async (req, res) => {
    try {
        const { newPassword, confirmNewPassword } = req.body;

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Las contraseñas no coinciden" });
        }

        const token = req.cookies.recoveryAdminCookie;
        if (!token) return res.status(400).json({ message: "No recovery token found" });

        const decoded = jsonwebtoken.verify(token, config.JWT.secret);

        if (!decoded.verified) {
            return res.status(400).json({ message: "Código no verificado" });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        if (decoded.isEmpleado) {
            await empleadosModel.findOneAndUpdate(
                { correo: decoded.email },
                { contraseña: passwordHash },
                { returnDocument: 'after' },
            );
        } else {
            await usersModel.findOneAndUpdate(
                { correo: decoded.email },
                { contraseña: passwordHash },
                { returnDocument: 'after' },
            );
        }

        res.clearCookie("recoveryAdminCookie");
        return res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default recoveryAdminController;
