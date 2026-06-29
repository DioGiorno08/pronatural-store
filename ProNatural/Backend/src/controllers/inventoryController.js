import inventoryModel from "../models/inventory.js";
import productsModel from "../models/products.js";

const inventoryController = {};

// SELECT - Obtener inventario
inventoryController.getInventory = async (req, res) => {
  try {
    const inventory = await inventoryModel.find().populate("product_id");
    return res.status(200).json(inventory);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
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
      return res.status(404).json({ message: "Product not found" });
    }

    const inventoryEntry = new inventoryModel({
      product_id: product._id,
      type: "IN",
      quantity: stock,
      reason: "Manual update",
    });
    await inventoryEntry.save();

    return res.status(200).json({ message: "Stock updated successfully", product });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT - Reordenar producto
inventoryController.reorderProduct = async (req, res) => {
  try {
    const { amount } = req.body;
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.stock += Number(amount);
    await product.save();

    const inventoryEntry = new inventoryModel({
      product_id: product._id,
      type: "IN",
      quantity: amount,
      reason: "Reorder",
    });
    await inventoryEntry.save();

    return res.status(200).json({ message: "Reorder successful", product });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default inventoryController;
