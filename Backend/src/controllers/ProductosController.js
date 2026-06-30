import productsModel from "../models/Productos.js";

// Array de funciones del controlador
const controladoresProductos = {};

// SELECT - Obtener todos los productos
controladoresProductos.getProducts = async (req, res) => {
  try {
    const productos = await productsModel.find();
    // Map to frontend expected format
    const mapeado = productos.map(prod => ({
      id: prod._id,
      name: prod.nombreProducto,
      desc: prod.descripcion,
      price: prod.precio,
      stock: prod.stock,
      category: prod.idCategoria,
      img: prod.imagenProducto && prod.imagenProducto.length > 0 ? prod.imagenProducto[0] : null,
      sku: prod.sku || prod._id
    }));
    return res.status(200).json(mapeado);
  } catch (error) {
    console.log("Error al obtener productos: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// SELECT por ID
controladoresProductos.getProduct = async (req, res) => {
  try {
    const prod = await productsModel.findById(req.params.id);
    if (!prod) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    const mapeado = {
      id: prod._id,
      name: prod.nombreProducto,
      desc: prod.descripcion,
      price: prod.precio,
      stock: prod.stock,
      category: prod.idCategoria,
      img: prod.imagenProducto && prod.imagenProducto.length > 0 ? prod.imagenProducto[0] : null,
      sku: prod.sku || prod._id
    };
    return res.status(200).json(mapeado);
  } catch (error) {
    console.log("Error al obtener producto: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// INSERT - Crear nuevo producto
controladoresProductos.createProduct = async (req, res) => {
  try {
    const { name, desc, description, price, stock, category } = req.body;
    const img = req.file ? req.file.path : (req.body.img || null);
    
    if (!name) {
      return res.status(400).json({ message: "El nombre del producto es requerido" });
    }

    // #1 - Llenar instancia del modelo
    const nuevoProducto = new productsModel({
      nombreProducto: name,
      descripcion: desc || description,
      precio: price,
      stock: stock,
      idCategoria: category,
      imagenProducto: img ? [img] : []
    });
    // #2 - Guardar en la base de datos
    const productoGuardado = await nuevoProducto.save();
    
    // Map back to frontend expected format
    const mapeado = {
      id: productoGuardado._id,
      name: productoGuardado.nombreProducto,
      desc: productoGuardado.descripcion,
      price: productoGuardado.precio,
      stock: productoGuardado.stock,
      category: productoGuardado.idCategoria,
      img: productoGuardado.imagenProducto && productoGuardado.imagenProducto.length > 0 ? productoGuardado.imagenProducto[0] : null,
      sku: productoGuardado.sku || productoGuardado._id
    };
    
    return res.status(201).json(mapeado);
  } catch (error) {
    console.log("Error al crear producto: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// UPDATE - Actualizar producto
controladoresProductos.updateProduct = async (req, res) => {
  try {
    const { name, desc, description, price, stock, category } = req.body;
    const img = req.file ? req.file.path : req.body.img;

    const existente = await productsModel.findById(req.params.id);
    if (!existente) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const updateData = { 
      nombreProducto: name, 
      descripcion: desc || description, 
      precio: price, 
      stock: stock,
      idCategoria: category,
    };
    if (img !== undefined) {
      updateData.imagenProducto = img ? [img] : [];
    }

    const productoActualizado = await productsModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    );
    // Map back to frontend expected format
    const mapeado = {
      id: productoActualizado._id,
      name: productoActualizado.nombreProducto,
      desc: productoActualizado.descripcion,
      price: productoActualizado.precio,
      stock: productoActualizado.stock,
      category: productoActualizado.idCategoria,
      img: productoActualizado.imagenProducto && productoActualizado.imagenProducto.length > 0 ? productoActualizado.imagenProducto[0] : null,
      sku: productoActualizado.sku || productoActualizado._id
    };
    
    return res.status(200).json(mapeado);
  } catch (error) {
    console.log("Error al actualizar producto: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// DELETE - Eliminar producto
controladoresProductos.deleteProduct = async (req, res) => {
  try {
    const eliminado = await productsModel.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    return res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.log("Error al eliminar producto: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default controladoresProductos;
