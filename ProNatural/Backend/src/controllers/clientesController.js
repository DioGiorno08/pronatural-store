import clientesModel from "../models/clientes.js";

//Array de funciones
const clientesController = {};

//SELECT
clientesController.getClientes = async (req, res) => {
    try {
        const clientes = await clientesModel.find();
        const mapped = clientes.map(c => ({
            id: c._id,
            name: c.name || c.nombre || '',
            lastName: c.lastName || c.apellido || '',
            email: c.email || c.correo || '',
            phone: c.telefono || c.phone || '',
            birthdate: c.birthdate || c.fechaNacimiento || '',
            status: c.status || 'Active'
        }));
        return res.status(200).json(mapped);
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//CREATE
clientesController.createCliente = async (req, res) => {
    try {
        let { name, lastName, email, phone, birthdate, status, password } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ message: "Fields required" });
        }
        
        const newCliente = new clientesModel({
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
        
        const saved = await newCliente.save();
        return res.status(201).json(saved);
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//UPDATE
clientesController.updateClientes = async (req, res) => {
    try {
        let { name, lastName, email, phone, birthdate, status } = req.body;

        const clienteUpdated = await clientesModel.findByIdAndUpdate(
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

        if (!clienteUpdated) {
            return res.status(404).json({ message: "Cliente not found" });
        }

        return res.status(200).json({ message: "Cliente updated", customer: clienteUpdated });
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//ELIMINAR
clientesController.deleteClientes = async (req, res) => {
    try {
        const deleteCliente = await clientesModel.findByIdAndDelete(req.params.id);

        //Si no se elimina es por que no encontró el id
        if (!deleteCliente) {
            return res.status(404).json({ message: "Cliente not found" });
        }

        return res.status(200).json({ message: "Cliente deleted" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default clientesController;