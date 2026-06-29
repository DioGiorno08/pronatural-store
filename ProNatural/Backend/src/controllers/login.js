import clientesModel from "../models/clientes.js";

import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";


const loginClientesController = {};

loginClientesController.login = async (req, res) => {

    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Correo inválido" });
    }

    try {

        const clientesFound = await clientesModel.findOne({ email });


        if (!clientesFound) {
            return res.status(400).json({ message: "Customer not found" });
        }


        if (clientesFound.timeOut && clientesFound.timeOut > Date.now()) {
            return res.status(403).json({ message: "Cuenta bloqueada" });
        }

        const isMatch = await bcrypt.compare(password, clientesFound.password);

        if (!isMatch) {
            clientesFound.loginAttemps = (clientesFound.loginAttemps || 0) + 1;


            if (clientesFound.loginAttemps >= 5) {
                clientesFound.timeOut = Date.now() + 5 * 60 * 1000;
                clientesFound.loginAttemps = 0;

                await clientesFound.save();

                return res
                    .status(403)
                    .json({ message: "Cuenta bloqueda por multiples intentos fallidos" });
            }

            await clientesFound.save();

            return res.status(401).json({ message: "Contraseña incorrecta" })

        }



        clientesFound.loginAttemps = 0;
        clientesFound.timeOut = null;


        const token = jsonwebtoken.sign(
            { id: clientesFound._id, userType: "Cliente" },
            config.JWT.secret,
            { expiresIn: "30d" },
        );


        res.cookie("authCookie", token);

        return res.status(200).json({ message: "Login exitoso" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default loginClientesController;