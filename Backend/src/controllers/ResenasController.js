import reviewsModel from "../models/Resenas.js";

// Array de funciones del controlador
const reviewsController = {};

// SELECT - Obtener todas las reseñas
reviewsController.getReviews = async (req, res) => {
  try {
    const reviews = await reviewsModel.find().sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// INSERT - Crear reseña (Público)
reviewsController.createReview = async (req, res) => {
  try {
    //#1- Solicito los datos del cuerpo
    const { name, rating, comment } = req.body;

    //#2- Instancio un nuevo objeto
    const newReview = new reviewsModel({
      name,
      rating,
      comment
    });

    //#3- Guardo en base de datos
    await newReview.save();

    //#4- Respondo éxito
    return res.status(201).json({ message: "Reseña creada", review: newReview });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// DELETE - Eliminar reseña (Admin)
reviewsController.deleteReview = async (req, res) => {
  try {
    //#1- Solicito el ID de la URL
    const { id } = req.params;

    //#2- Busco y elimino
    const deletedReview = await reviewsModel.findByIdAndDelete(id);

    //#3- Verifico existencia
    if (!deletedReview) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    //#4- Respondo éxito
    return res.status(200).json({ message: "Reseña eliminada" });
  } catch (error) {
    console.log("error: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default reviewsController;
