import categoriesModel from "../models/categories.js";

// Array de funciones del controlador
const categoriesController = {};

// SELECT - Obtener todas las categorías
categoriesController.getCategories = async (req, res) => {
  try {
    const categories = await categoriesModel.find();
    return res.status(200).json(categories);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SELECT por ID
categoriesController.getCategoryById = async (req, res) => {
  try {
    const category = await categoriesModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT - Crear nueva categoría
categoriesController.insertCategory = async (req, res) => {
  try {
    // #1 - Solicitar los datos
    const { name, description, isActive } = req.body;

    // Validación mínima
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Verificar que no exista una categoría con el mismo nombre
    const existing = await categoriesModel.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "A category with this name already exists" });
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
      .json({ message: "Category created", category: newCategory });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
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
      return res.status(404).json({ message: "Category not found" });
    }

    // #3 - Actualizar
    const updated = await categoriesModel.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Category updated", category: updated });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE - Eliminar categoría
categoriesController.deleteCategory = async (req, res) => {
  try {
    const deleted = await categoriesModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TOGGLE - Activar / Desactivar categoría
categoriesController.toggleCategory = async (req, res) => {
  try {
    const category = await categoriesModel.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updated = await categoriesModel.findByIdAndUpdate(
      req.params.id,
      { isActive: !category.isActive },
      { new: true }
    );

    return res.status(200).json({
      message: `Category ${updated.isActive ? "activated" : "deactivated"}`,
      category: updated,
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SELECT solo categorías activas
categoriesController.getActiveCategories = async (req, res) => {
  try {
    const categories = await categoriesModel.find({ isActive: true });
    return res.status(200).json(categories);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default categoriesController;
