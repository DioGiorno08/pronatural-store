import usersModel from "../models/Usuarios.js";
import empleadosModel from "../models/Empleados.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { config } from "../../config.js";
import clientesModel from "../models/Clientes.js";

const authController = {};

authController.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existsAdmin = await usersModel.findOne({ correo: email });
    const existsEmpleado = await empleadosModel.findOne({ correo: email });
    if (existsAdmin || existsEmpleado) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const randomNumber = crypto.randomBytes(3).toString("hex");

    const token = jwt.sign(
      { randomNumber, name, email, password: hashedPassword },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("registrationAdminCookie", token, { maxAge: 15 * 60 * 1000 });

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
      subject: "Verificación de cuenta Admin/Vendedor",
      text: "Para verificar tu cuenta, utiliza este código: " + randomNumber + " expira en 15 minutos",
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error enviando email: ", error);
        return res.status(500).json({ message: "Error enviando email: " + error.message });
      }
      return res.status(200).json({ message: "Email sent" });
    });
  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({ message: "Error de servidor: " + error.message });
  }
};

authController.verifyCode = async (req, res) => {
  try {
    const { verificationCodeRequest } = req.body;
    const token = req.cookies.registrationAdminCookie;
    
    if (!token) return res.status(400).json({ message: "No token found" });

    const decoded = jwt.verify(token, config.JWT.secret);
    const { randomNumber: storedCode, name, email, password } = decoded;

    if (verificationCodeRequest !== storedCode) {
      return res.status(400).json({ message: "Código inválido" });
    }

    const newAdmin = new usersModel({
      nombre: name,
      correo: email,
      contraseña: password,
      isVerified: true,
    });

    await newAdmin.save();
    res.clearCookie("registrationAdminCookie");
    return res.status(200).json({ message: "Administrador registrado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

authController.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const emailRegex = new RegExp('^' + email + '$', 'i');

    let user = await usersModel.findOne({ correo: emailRegex });
    let role = "Admin";
    let isCliente = false;
    let isEmpleado = false;

    if (!user) {
      user = await empleadosModel.findOne({ correo: emailRegex });
      if (user) {
        role = "Employee";
        isEmpleado = true;
      }
    }

    if (!user) {
      user = await clientesModel.findOne({ email: emailRegex }) || await clientesModel.findOne({ correo: emailRegex });
      if (user) {
        role = "Customer";
        isCliente = true;
      }
    }

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    if (user.timeOut && user.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada temporalmente" });
    }

    const userPasswordHash = user.contraseña || user.password;
    console.log("LOGIN ATTEMPT:");
    console.log("Email from request:", emailRegex);
    console.log("Password from request:", `'${password}'`);
    console.log("User found:", user.correo || user.email);
    console.log("Hash in DB:", userPasswordHash);
    const isMatch = await bcrypt.compare(password, userPasswordHash);
    console.log("Is Match:", isMatch);

    if (!isMatch) {
      user.loginAttemps = (user.loginAttemps || 0) + 1;
      
      if (user.loginAttemps >= 8) {
        user.timeOut = Date.now() + 5 * 60 * 1000; // 5 minutos de bloqueo
        user.loginAttemps = 0;
        await user.save();
        return res.status(403).json({ message: "Cuenta bloqueada por múltiples intentos fallidos" });
      }
      
      await user.save();
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    if (isEmpleado && user.firstLogin === true) {
      return res.status(403).json({ 
        requirePasswordChange: true, 
        email: user.correo,
        message: "Por seguridad, debes cambiar la contraseña temporal asignada." 
      });
    }

    user.loginAttemps = 0;
    user.timeOut = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, userType: role, email: user.correo, name: user.nombre },
      config.JWT.secret,
      { expiresIn: "1d" }
    );

    res.cookie("authCookie", token, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      expires: new Date(Date.now() + 24 * 3600000) // 24 horas
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        name: user.nombre,
        email: user.correo,
        role: role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

authController.logout = async (req, res) => {
  try {
    res.clearCookie("authCookie");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

authController.forceChangePassword = async (req, res) => {
  try {
    let { email, oldPassword, newPassword } = req.body;
    email = email.toLowerCase().trim();

    const user = await empleadosModel.findOne({ correo: email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.contraseña);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.contraseña = hashedPassword;
    user.firstLogin = false;
    user.loginAttemps = 0;
    user.timeOut = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, userType: "Employee", email: user.correo, name: user.nombre },
      config.JWT.secret,
      { expiresIn: "1d" }
    );

    res.cookie("authCookie", token, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      expires: new Date(Date.now() + 24 * 3600000)
    });

    return res.status(200).json({
      message: "Contraseña actualizada y login exitoso",
      token,
      user: {
        id: user._id,
        name: user.nombre,
        email: user.correo,
        role: "Employee",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default authController;
