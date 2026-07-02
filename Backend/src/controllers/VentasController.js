import salesModel from "../models/Ventas.js";
import productsModel from "../models/Productos.js";
import nodemailer from "nodemailer";
import { config } from "../../config.js";

// Array de funciones del controlador
const controladoresVentas = {};

// SELECT - Obtener todas las ventas con populate
controladoresVentas.getSales = async (req, res) => {
  try {
    const sales = await salesModel
      .find()
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "nombreProducto precio");

    return res.status(200).json(sales);
  } catch (error) {
    console.log("Error al obtener ventas: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// SELECT por ID
controladoresVentas.getSaleById = async (req, res) => {
  try {
    const sale = await salesModel
      .findById(req.params.id)
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "nombreProducto precio descripcion");

    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    return res.status(200).json(sale);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// INSERT - Crear nueva venta (admin registra venta manual)
controladoresVentas.insertSale = async (req, res) => {
  try {
    // #1 - Solicitar los datos
    const { customerId, products, paymentMethod, status, notes } = req.body;
    
    // El middleware validateAuthCookie ya inyecta el usuario autenticado en req.user
    const employeeId = req.user ? req.user.id : null;

    // Validaciones mínimas
    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Se requiere al menos un producto" });
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
          message: `Producto ${products[i].productId} no encontrado`,
        });
      }

      // Verificar stock disponible
      if (productFound.stock < products[i].quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${productFound.nombreProducto}. Available: ${productFound.stock}`,
        });
      }

      // Precio al momento de la venta
      const unitPrice = productFound.precio || 0;
      const subtotal = unitPrice * products[i].quantity;
      total += subtotal;

      newProducts.push({
        productId: products[i].productId,
        quantity: products[i].quantity,
        unitPrice,
        subtotal,
      });

      // #3 - Descontar stock del producto SOLO si no es venta de WhatsApp pendiente
      if (status !== 'Pendiente WhatsApp') {
        const updatedProduct = await productsModel.findByIdAndUpdate(
          products[i].productId,
          { $inc: { stock: -products[i].quantity } },
          { new: true }
        );

        if (updatedProduct && updatedProduct.stock <= 15) {
          try {
            const transporter = nodemailer.createTransport({
              host: config.SMTP_HOST || "smtp.gmail.com",
              port: config.SMTP_PORT || 465,
              secure: true,
              auth: {
                user: config.SMTP_USER || "pronatural.store.sv@gmail.com",
                pass: config.SMTP_PASSWORD || "zndq kvqj rblb ahcw",
              },
            });
            await transporter.sendMail({
              from: '"Sistema ProNatural" <pronatural.store.sv@gmail.com>',
              to: config.SMTP_USER || "pronatural.store.sv@gmail.com",
              subject: `⚠️ Alerta de Bajo Stock: ${updatedProduct.nombreProducto}`,
              html: `
                <h2>Alerta de Inventario</h2>
                <p>El producto <strong>${updatedProduct.nombreProducto}</strong> ha alcanzado niveles críticos de inventario.</p>
                <p><strong>Stock actual:</strong> <span style="color:red; font-size:18px; font-weight:bold">${updatedProduct.stock}</span> unidades.</p>
                <p>Por favor, reabastece este producto lo antes posible.</p>
              `,
            });
          } catch (emailError) {
            console.error("Error enviando alerta de stock:", emailError);
          }
        }
      }
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
    const savedSale = await newSale.save();
    
    const populatedSale = await salesModel.findById(savedSale._id)
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "nombreProducto precio");

    return res.status(201).json(populatedSale);
  } catch (error) {
    console.log("Error al crear venta: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// UPDATE - Actualizar estado de una venta (ej: cancelar)
controladoresVentas.updateSaleStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const sale = await salesModel.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Si se cancela, devolver el stock (solo si no estaba pendiente)
    if (status === "cancelled" && sale.status !== "cancelled" && sale.status !== "Pendiente WhatsApp") {
      for (const item of sale.products) {
        await productsModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true }
        );
      }
    }

    // Si se confirma una venta de WhatsApp, descontar el stock
    if (status === "Completado" && sale.status === "Pendiente WhatsApp") {
      for (const item of sale.products) {
        const updatedProduct = await productsModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );

        if (updatedProduct && updatedProduct.stock <= 15) {
          try {
            const transporter = nodemailer.createTransport({
              host: config.SMTP_HOST || "smtp.gmail.com",
              port: config.SMTP_PORT || 465,
              secure: true,
              auth: {
                user: config.SMTP_USER || "pronatural.store.sv@gmail.com",
                pass: config.SMTP_PASSWORD || "zndq kvqj rblb ahcw",
              },
            });
            await transporter.sendMail({
              from: '"Sistema ProNatural" <pronatural.store.sv@gmail.com>',
              to: config.SMTP_USER || "pronatural.store.sv@gmail.com",
              subject: `⚠️ Alerta de Bajo Stock: ${updatedProduct.nombreProducto}`,
              html: `
                <h2>Alerta de Inventario</h2>
                <p>El producto <strong>${updatedProduct.nombreProducto}</strong> ha alcanzado niveles críticos de inventario.</p>
                <p><strong>Stock actual:</strong> <span style="color:red; font-size:18px; font-weight:bold">${updatedProduct.stock}</span> unidades.</p>
                <p>Por favor, reabastece este producto lo antes posible.</p>
              `,
            });
          } catch (emailError) {
            console.error("Error enviando alerta de stock:", emailError);
          }
        }
      }
    }

    const updated = await salesModel.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Estado de venta actualizado", sale: updated });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE - Eliminar una venta
controladoresVentas.deleteSale = async (req, res) => {
  try {
    const sale = await salesModel.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }
    return res.status(200).json({ message: "Venta eliminada exitosamente" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SELECT - Ventas por rango de fechas
controladoresVentas.getSalesByDateRange = async (req, res) => {
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
      .populate("products.productId", "nombreProducto precio");

    return res.status(200).json(sales);
  } catch (error) {
    console.log("Error al obtener ventas por rango: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// SELECT - Total de ventas (reporte rápido)
controladoresVentas.getSalesSummary = async (req, res) => {
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
    console.log("Error al obtener resumen de ventas: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
// POST - Enviar Factura Digital al Correo
controladoresVentas.sendInvoiceEmail = async (req, res) => {
  try {
    //#1- Solicito el ID de la venta
    const { id } = req.params;

    //#2- Busco la venta y el cliente en la base de datos
    const sale = await salesModel
      .findById(id)
      .populate("customerId", "name lastName email")
      .populate("products.productId", "nombreProducto precio");

    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    //#3- Verifico que haya un cliente con correo asociado
    if (!sale.customerId || !sale.customerId.email) {
      return res.status(400).json({ message: "El cliente no tiene un correo registrado." });
    }

    //#4- Construyo la plantilla HTML para el correo
    const emailTo = sale.customerId.email;
    const clientName = `${sale.customerId.name} ${sale.customerId.lastName}`;
    
    let productsHtml = "";
    sale.products.forEach(p => {
      const pName = p.productId ? p.productId.nombreProducto : "Producto desconocido";
      const pPrice = p.unitPrice.toFixed(2);
      const subtotal = p.subtotal.toFixed(2);
      productsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #fff;">${pName}</td>
          <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: center; color: #fff;">${p.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #fff;">$${pPrice}</td>
          <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #4ade80;">$${subtotal}</td>
        </tr>
      `;
    });

    const htmlTemplate = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1114; border: 1px solid #1b4332; border-radius: 12px; overflow: hidden; color: #e2e8f0;">
        <div style="background-color: #1b4332; padding: 30px 20px; text-align: center;">
          <h1 style="color: #4ade80; margin: 0; font-size: 28px; letter-spacing: 2px; font-weight: bold;">PRONATURAL</h1>
          <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 14px;">Pasión por lo natural</p>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #fff; margin-top: 0; font-size: 20px;">Factura de Compra</h2>
          <p style="color: #94a3b8; font-size: 14px;">Hola <strong style="color: #fff;">${clientName}</strong>, gracias por tu compra en ProNatural.</p>
          
          <div style="background-color: #161b1e; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin: 25px 0;">
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #94a3b8;"><strong>Recibo N°:</strong> ${sale._id}</p>
            <p style="margin: 0 0 5px 0; font-size: 13px; color: #94a3b8;"><strong>Fecha:</strong> ${new Date(sale.createdAt).toLocaleDateString()}</p>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;"><strong>Método de pago:</strong> ${sale.paymentMethod}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr>
                <th style="padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.1); text-align: left; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Producto</th>
                <th style="padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.1); text-align: center; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Cant.</th>
                <th style="padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Precio</th>
                <th style="padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 15px 10px 5px 10px; text-align: right; color: #94a3b8; font-size: 14px; font-weight: bold;">TOTAL:</td>
                <td style="padding: 15px 10px 5px 10px; text-align: right; color: #4ade80; font-size: 18px; font-weight: bold;">$${sale.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <p style="text-align: center; color: #94a3b8; font-size: 13px; margin-top: 30px;">Si tienes alguna duda con tu pedido, no dudes en contactarnos.</p>
        </div>
        
        <div style="background-color: #0b0e11; padding: 15px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
          <p style="color: #64748b; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} ProNatural. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    //#5- Configuro Nodemailer y envío el correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user_email,
        pass: config.email.user_password,
      },
    });

    const mailOptions = {
      from: config.email.user_email,
      to: emailTo,
      subject: `ProNatural - Factura de Compra #${sale._id.toString().substring(0, 8)}`,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);

    //#6- Respondo éxito
    return res.status(200).json({ message: "Factura enviada exitosamente" });
  } catch (error) {
    console.log("Error al enviar factura: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default controladoresVentas;
