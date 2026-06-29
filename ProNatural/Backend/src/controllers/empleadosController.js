import empleadosModel from "../models/empleados.js";
import bcrypt from "bcryptjs";

const empleadosController = {};

// GET - Obtener todos los empleados
empleadosController.getEmpleados = async (req, res) => {
  try {
    const empleados = await empleadosModel.find();
    const mapped = empleados.map(e => ({
      id: e._id,
      name: e.nombre,
      lastName: e.apellido,
      role: e.cargo,
      phone: e.telefono,
      email: e.correo,
      password: "",
      salary: e.salario
    }));
    return res.status(200).json(mapped);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET por ID
empleadosController.getEmpleadoById = async (req, res) => {
  try {
    const e = await empleadosModel.findById(req.params.id);
    if (!e) return res.status(404).json({ message: "Empleado no encontrado" });
    
    const mapped = {
      id: e._id,
      name: e.nombre,
      lastName: e.apellido,
      role: e.cargo,
      phone: e.telefono,
      email: e.correo,
      password: "",
      salary: e.salario
    };
    return res.status(200).json(mapped);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST - Crear empleado
empleadosController.createEmpleado = async (req, res) => {
  try {
    let { name, lastName, role, phone, email, password, salary } = req.body;
    email = email.toLowerCase().trim();
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const nuevoEmpleado = new empleadosModel({
      nombre: name,
      apellido: lastName,
      cargo: role,
      telefono: phone,
      correo: email,
      contraseña: hashedPassword,
      salario: salary
    });

    const guardado = await nuevoEmpleado.save();

    const mapped = {
      id: guardado._id,
      name: guardado.nombre,
      lastName: guardado.apellido,
      role: guardado.cargo,
      phone: guardado.telefono,
      email: guardado.correo,
      password: "", 
      salary: guardado.salario
    };
    return res.status(201).json(mapped);
  } catch (error) {
    console.log("error" + error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado." });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PUT - Actualizar empleado
empleadosController.updateEmpleado = async (req, res) => {
  try {
    let { name, lastName, role, phone, email, password, salary } = req.body;
    email = email.toLowerCase().trim();
    
    const updateData = {
      nombre: name,
      apellido: lastName,
      cargo: role,
      telefono: phone,
      correo: email,
      salario: salary
    };

    if (password && password.trim() !== "") {
      // If the password starts with $2 it might already be hashed (if frontend sends back same value), 
      // but usually the frontend won't send the password on update unless it's changing.
      if (!password.startsWith('$2')) {
        updateData.contraseña = await bcrypt.hash(password, 10);
      } else {
        updateData.contraseña = password;
      }
    }

    const actualizado = await empleadosModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    );

    if (!actualizado) return res.status(404).json({ message: "Empleado no encontrado" });

    const mapped = {
      id: actualizado._id,
      name: actualizado.nombre,
      lastName: actualizado.apellido,
      role: actualizado.cargo,
      phone: actualizado.telefono,
      email: actualizado.correo,
      password: "", 
      salary: actualizado.salario
    };
    return res.status(200).json(mapped);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE - Eliminar empleado
empleadosController.deleteEmpleado = async (req, res) => {
  try {
    const eliminado = await empleadosModel.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ message: "Empleado no encontrado" });
    return res.status(200).json({ message: "Empleado eliminado" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default empleadosController;
