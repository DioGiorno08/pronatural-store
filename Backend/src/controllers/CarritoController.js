import carritoModel from "../models/Carrito.js";
import productsModel from "../models/Productos.js";

const carritoController = {};

// Obtener carrito por sessionId
carritoController.getCarrito = async (req, res) => {
  try {
    const { sessionId } = req.params;
    let carrito = await carritoModel.findOne({ sessionId }).populate("productos.productId", "nombreProducto precio imagenProducto stock");
    
    if (!carrito) {
      carrito = new carritoModel({ sessionId, productos: [] });
      await carrito.save();
    }
    
    res.status(200).json(carrito);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

// Sincronizar carrito completo
carritoController.syncCarrito = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productos } = req.body; // Array de { productId, quantity }

    let carrito = await carritoModel.findOne({ sessionId });
    
    if (!carrito) {
      carrito = new carritoModel({ sessionId, productos: [] });
    }

    // Filtrar productos inválidos
    const validProducts = [];
    for (const item of productos) {
      const product = await productsModel.findById(item.productId || item.id);
      if (product && product.stock >= item.quantity) {
        validProducts.push({
          productId: product._id,
          quantity: item.quantity
        });
      }
    }

    carrito.productos = validProducts;
    await carrito.save();
    
    const populatedCarrito = await carritoModel.findById(carrito._id).populate("productos.productId", "nombreProducto precio imagenProducto stock");
    res.status(200).json(populatedCarrito);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al sincronizar carrito" });
  }
};

// Vaciar carrito
carritoController.vaciarCarrito = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await carritoModel.findOneAndUpdate({ sessionId }, { productos: [] });
    res.status(200).json({ message: "Carrito vaciado" });
  } catch (error) {
    res.status(500).json({ message: "Error al vaciar carrito" });
  }
};

export default carritoController;
