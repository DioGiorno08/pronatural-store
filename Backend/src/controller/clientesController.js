import clientesModel from "../models/clientes.js";

//Array de funciones
const clientesController = {};

//SELECT
clientesController.getClientes = async (req, res) => {
  try {
    const clientes = await clientesModel.find();
    return res.status(200).json(clientes);
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//UPDATE
clientesController.updateClientes = async (req, res) => {
  try {
    //#1- solicitamos los nuevos datos
    let {
      name,
      lastName,
      birthdate,
      email,
      password,
      isVerified,
      loginAttemps,
      timeOut,
    } = req.body;

    //Validaciones
    name = name?.trim();
    email = email?.trim();

    //valores requires
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Fields required" });
    }

    //validación de fechas
    if (birthdate > new Date() || birthdate < new Date("1901-01-01")) {
      return res.status(400).json({ message: "invalid date" });
    }

    const clienteUpdated = await clientesModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        lastName,
        birthdate,
        email,
        password,
        isVerified,
        loginAttemps,
        timeOut,
      },
      { new: true },
    );

    if (!clienteUpdated) {
      return res.status(404).json({ message: "Cliente not found" });
    }

    return res.status(200).json({ message: "Cliente updated" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ELIMINAR
clientesController.deleteClientes = async (req, res) => {
  try {
    const deleteCliente = clientesModel.findByIdAndDelete(req.params.id);

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
