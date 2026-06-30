import inventoryModel from "../models/Inventario.js";
import productsModel from "../models/Productos.js";

const inventoryController = {};

// SELECT - Obtener inventario
inventoryController.getInventory = async (req, res) => {
  try {
    const inventory = await inventoryModel.find().populate("product_id");
    return res.status(200).json(inventory);
  } catch (error) {
    console.log("Error al obtener inventario: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// UPDATE - Actualizar stock manualmente
inventoryController.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await productsModel.findByIdAndUpdate(
      req.params.id,
      { stock },
      { returnDocument: 'after' }
    );

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const inventoryEntry = new inventoryModel({
      product_id: product._id,
      type: "IN",
      quantity: stock,
      reason: "Actualización manual",
    });
    await inventoryEntry.save();

    return res.status(200).json({ message: "Stock actualizado exitosamente", product });
  } catch (error) {
    console.log("Error al obtener inventario: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// INSERT - Reordenar producto
inventoryController.reorderProduct = async (req, res) => {
  try {
    const { amount } = req.body;
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    product.stock += Number(amount);
    await product.save();

    const inventoryEntry = new inventoryModel({
      product_id: product._id,
      type: "IN",
      quantity: amount,
      reason: "Reorden de inventario",
    });
    await inventoryEntry.save();

    return res.status(200).json({ message: "Reabastecimiento exitoso", product });
  } catch (error) {
    console.log("Error al obtener inventario: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default inventoryController;
