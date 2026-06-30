import categoriesModel from "../models/Categorias.js";

// Array de funciones del controlador
const categoriesController = {};

// SELECT - Obtener todas las categorías
categoriesController.getCategories = async (req, res) => {
  try {
    const categories = await categoriesModel.find();
    return res.status(200).json(categories);
  } catch (error) {
    console.log("Error al obtener categorías: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// SELECT por ID
categoriesController.getCategoryById = async (req, res) => {
  try {
    const category = await categoriesModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.log("Error al obtener categoría: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// INSERT - Crear nueva categoría
categoriesController.insertCategory = async (req, res) => {
  try {
    // #1 - Solicitar los datos
    const { name, description, isActive } = req.body;

    // Validación mínima
    if (!name) {
      return res.status(400).json({ message: "El nombre de la categoría es requerido" });
    }

    // Verificar que no exista una categoría con el mismo nombre
    const existing = await categoriesModel.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Ya existe una categoría con ese nombre" });
    }

    // #2 - Llenar instancia del modelo
    const newCategory = new categoriesModel({
      name,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    // #3 - Guardar en la base de datos
    await newCategory.save();

    return res
      .status(201)
      .json({ message: "Categoría creada exitosamente", category: newCategory });
  } catch (error) {
    console.log("Error al crear categoría: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// UPDATE - Actualizar categoría
categoriesController.updateCategory = async (req, res) => {
  try {
    // #1 - Solicitar los nuevos datos
    const { name, description, isActive } = req.body;

    // #2 - Verificar que exista
    const existing = await categoriesModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    // #3 - Actualizar
    const updated = await categoriesModel.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Categoría actualizada exitosamente", category: updated });
  } catch (error) {
    console.log("Error al actualizar categoría: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// DELETE - Eliminar categoría
categoriesController.deleteCategory = async (req, res) => {
  try {
    const deleted = await categoriesModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    return res.status(200).json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    console.log("Error al eliminar categoría: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// TOGGLE - Activar / Desactivar categoría
categoriesController.toggleCategory = async (req, res) => {
  try {
    const category = await categoriesModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const updated = await categoriesModel.findByIdAndUpdate(
      req.params.id,
      { isActive: !category.isActive },
      { new: true }
    );

    return res.status(200).json({
      message: `Categoría ${updated.isActive ? "activada" : "desactivada"} exitosamente`,
      category: updated,
    });
  } catch (error) {
    console.log("Error al cambiar estado de categoría: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// SELECT solo categorías activas
categoriesController.getActiveCategories = async (req, res) => {
  try {
    const categories = await categoriesModel.find({ isActive: true });
    return res.status(200).json(categories);
  } catch (error) {
    console.log("Error al obtener categorías activas: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default categoriesController;
