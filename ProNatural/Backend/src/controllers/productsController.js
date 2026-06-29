import productsModel from "../models/products.js";

// Array de funciones del controlador
const productsController = {};

// SELECT - Obtener todos los productos
productsController.getProducts = async (req, res) => {
  try {
    const products = await productsModel.find();
    // Map to frontend expected format
    const mapped = products.map(p => ({
      id: p._id,
      name: p.nombreProducto,
      desc: p.descripcion,
      price: p.precio,
      stock: p.stock,
      category: p.idCategoria,
      img: p.imagenProducto && p.imagenProducto.length > 0 ? p.imagenProducto[0] : null,
      sku: p.sku || p._id
    }));
    return res.status(200).json(mapped);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SELECT por ID
productsController.getProduct = async (req, res) => {
  try {
    const p = await productsModel.findById(req.params.id);
    if (!p) {
      return res.status(404).json({ message: "Product not found" });
    }
    const mapped = {
      id: p._id,
      name: p.nombreProducto,
      desc: p.descripcion,
      price: p.precio,
      stock: p.stock,
      category: p.idCategoria,
      img: p.imagenProducto && p.imagenProducto.length > 0 ? p.imagenProducto[0] : null,
      sku: p.sku || p._id
    };
    return res.status(200).json(mapped);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT - Crear nuevo producto
productsController.createProduct = async (req, res) => {
  try {
    const { name, desc, description, price, stock, category, img } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    // #1 - Llenar instancia del modelo
    const newProduct = new productsModel({
      nombreProducto: name,
      descripcion: desc || description,
      precio: price,
      stock: stock,
      idCategoria: category,
      imagenProducto: img ? [img] : []
    });
    // #2 - Guardar en la base de datos
    const savedProduct = await newProduct.save();
    
    // Map back to frontend expected format
    const mapped = {
      id: savedProduct._id,
      name: savedProduct.nombreProducto,
      desc: savedProduct.descripcion,
      price: savedProduct.precio,
      stock: savedProduct.stock,
      category: savedProduct.idCategoria,
      img: savedProduct.imagenProducto && savedProduct.imagenProducto.length > 0 ? savedProduct.imagenProducto[0] : null,
      sku: savedProduct.sku || savedProduct._id
    };
    
    return res.status(201).json(mapped);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE - Actualizar producto
productsController.updateProduct = async (req, res) => {
  try {
    const { name, desc, description, price, stock, category, img } = req.body;

    const existing = await productsModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await productsModel.findByIdAndUpdate(
      req.params.id,
      { 
        nombreProducto: name, 
        descripcion: desc || description, 
        precio: price, 
        stock: stock,
        idCategoria: category,
        imagenProducto: img ? [img] : []
      },
      { returnDocument: 'after' }
    );
    // Map back to frontend expected format
    const mapped = {
      id: updatedProduct._id,
      name: updatedProduct.nombreProducto,
      desc: updatedProduct.descripcion,
      price: updatedProduct.precio,
      stock: updatedProduct.stock,
      category: updatedProduct.idCategoria,
      img: updatedProduct.imagenProducto && updatedProduct.imagenProducto.length > 0 ? updatedProduct.imagenProducto[0] : null,
      sku: updatedProduct.sku || updatedProduct._id
    };
    
    return res.status(200).json(mapped);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE - Eliminar producto
productsController.deleteProduct = async (req, res) => {
  try {
    const deleted = await productsModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default productsController;
