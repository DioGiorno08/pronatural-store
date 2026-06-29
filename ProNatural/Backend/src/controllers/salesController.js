import salesModel from "../models/sales.js";
import productsModel from "../models/products.js";

// Array de funciones del controlador
const salesController = {};

// SELECT - Obtener todas las ventas con populate
salesController.getSales = async (req, res) => {
  try {
    const sales = await salesModel
      .find()
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "name price");

    return res.status(200).json(sales);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SELECT por ID
salesController.getSaleById = async (req, res) => {
  try {
    const sale = await salesModel
      .findById(req.params.id)
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "name price description");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    return res.status(200).json(sale);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT - Crear nueva venta (admin registra venta manual)
salesController.insertSale = async (req, res) => {
  try {
    // #1 - Solicitar los datos
    const { customerId, employeeId, products, paymentMethod, status, notes } =
      req.body;

    // Validaciones mínimas
    if (!employeeId) {
      return res.status(400).json({ message: "employeeId is required" });
    }
    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one product is required" });
    }

    // #2 - Calcular totales y verificar stock
    let total = 0;
    const newProducts = [];

    for (let i = 0; i < products.length; i++) {
      const productFound = await productsModel.findById(
        products[i].productId
      );

      if (!productFound) {
        return res.status(404).json({
          message: `Product ${products[i].productId} not found`,
        });
      }

      // Verificar stock disponible
      if (productFound.stock < products[i].quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${productFound.name}. Available: ${productFound.stock}`,
        });
      }

      // Precio al momento de la venta
      const unitPrice = productFound.price;
      const subtotal = unitPrice * products[i].quantity;
      total += subtotal;

      newProducts.push({
        productId: products[i].productId,
        quantity: products[i].quantity,
        unitPrice,
        subtotal,
      });

      // #3 - Descontar stock del producto
      await productsModel.findByIdAndUpdate(
        products[i].productId,
        { $inc: { stock: -products[i].quantity } },
        { new: true }
      );
    }

    // #4 - Llenar instancia del modelo
    const newSale = new salesModel({
      customerId: customerId || null,
      employeeId,
      products: newProducts,
      total,
      paymentMethod: paymentMethod || "cash",
      status: status || "completed",
      notes,
    });

    // #5 - Guardar en la base de datos
    await newSale.save();

    return res.status(201).json({ message: "Sale created", sale: newSale });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE - Actualizar estado de una venta (ej: cancelar)
salesController.updateSaleStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const sale = await salesModel.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Si se cancela, devolver el stock
    if (status === "cancelled" && sale.status !== "cancelled") {
      for (const item of sale.products) {
        await productsModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
    }

    const updated = await salesModel.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Sale status updated", sale: updated });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SELECT - Ventas por rango de fechas
salesController.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const sales = await salesModel
      .find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "name price");

    return res.status(200).json(sales);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SELECT - Total de ventas (reporte rápido)
salesController.getSalesSummary = async (req, res) => {
  try {
    const totalSales = await salesModel.countDocuments({
      status: "completed",
    });

    const totalRevenue = await salesModel.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    return res.status(200).json({
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default salesController;
