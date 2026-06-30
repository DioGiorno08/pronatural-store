import clientesModel from "../models/Clientes.js";

//Array de funciones
const controladoresClientes = {};

//SELECT
controladoresClientes.getClientes = async (req, res) => {
    try {
        const clientes = await clientesModel.find();
        const mapeado = clientes.map(c => ({
            id: c._id,
            name: c.name || c.nombre || '',
            lastName: c.lastName || c.apellido || '',
            email: c.email || c.correo || '',
            phone: c.telefono || c.phone || '',
            birthdate: c.birthdate || c.fechaNacimiento || '',
            status: c.status || 'Active'
        }));
        return res.status(200).json(mapeado);
    } catch (error) {
        console.log("Error al obtener clientes: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

//CREATE
controladoresClientes.createCliente = async (req, res) => {
    try {
        let { name, lastName, email, phone, birthdate, status, password } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ message: "Campos requeridos" });
        }
        
        const nuevoCliente = new clientesModel({
            name,
            lastName,
            email,
            telefono: phone, // Save both to be safe
            phone,
            birthdate,
            password: password || '1234', // default if not provided by admin
            status: status || 'Active',
            isVerified: true
        });
        
        const guardado = await nuevoCliente.save();
        return res.status(201).json(guardado);
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//UPDATE
controladoresClientes.updateClientes = async (req, res) => {
    try {
        let { name, lastName, email, phone, birthdate, status } = req.body;

        const clienteActualizado = await clientesModel.findByIdAndUpdate(
            req.params.id,
            { 
                name, nombre: name, 
                lastName, apellido: lastName, 
                email, correo: email, 
                phone, telefono: phone, 
                birthdate, fechaNacimiento: birthdate, 
                status 
            },
            { returnDocument: 'after' }
        );

        if (!clienteActualizado) {
            return res.status(404).json({ message: "Cliente not found" });
        }

        return res.status(200).json({ message: "Cliente actualizado exitosamente", customer: clienteActualizado });
    } catch (error) {
        console.log("Error al actualizar cliente: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

//ELIMINAR
controladoresClientes.deleteClientes = async (req, res) => {
    try {
        const clienteEliminado = await clientesModel.findByIdAndDelete(req.params.id);

        //Si no se elimina es por que no encontró el id
        if (!clienteEliminado) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        return res.status(200).json({ message: "Cliente eliminado exitosamente" });
    } catch (error) {
        console.log("Error al eliminar cliente: " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default controladoresClientes;