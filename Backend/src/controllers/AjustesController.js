import ajustesModel from "../models/AjustesSistema.js";
import productsModel from "../models/Productos.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { config } from "../../config.js";

const controladoresAjustes = {};

// Obtener la configuración única (si no existe, la crea)
controladoresAjustes.getConfig = async (req, res) => {
  try {
    let ajustes = await ajustesModel.findOne();
    if (!ajustes) {
      const nuevosAjustes = new ajustesModel({});
      ajustes = await nuevosAjustes.save();
    }
    return res.status(200).json(ajustes);
  } catch (error) {
    console.log("Error al obtener ajustes: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar la configuración
controladoresAjustes.updateConfig = async (req, res) => {
  try {
    const data = req.body;
    let ajustes = await ajustesModel.findOne();
    
    if (!ajustes) {
      ajustes = new ajustesModel(data);
      await ajustes.save();
    } else {
      ajustes = await ajustesModel.findByIdAndUpdate(ajustes._id, data, { new: true });
    }
    
    return res.status(200).json({ message: "Ajustes actualizados", ajustes });
  } catch (error) {
    console.log("Error al actualizar ajustes: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

import cron from 'node-cron';

// Variables para manejar el cron job
let scheduledJob = null;

// Inicializa o reinicia el cron job basado en la DB
controladoresAjustes.initCronJob = async () => {
  try {
    const ajustes = await ajustesModel.findOne();
    if (scheduledJob) {
      scheduledJob.stop(); // Detener job anterior si existe
    }

    if (ajustes && ajustes.reporteSemanal?.enabled) {
      const { dia, hora } = ajustes.reporteSemanal;
      // node-cron usa: minuto hora diaDelMes mes diaDeLaSemana
      // diaDeLaSemana: 0-6 (0=Domingo, 1=Lunes...)
      const cronExpression = `0 ${hora} * * ${dia}`;
      
      scheduledJob = cron.schedule(cronExpression, async () => {
        console.log("Ejecutando reporte semanal de inventario...");
        await controladoresAjustes.sendInventoryReport();
      });
      console.log(`Cron job configurado: ${cronExpression}`);
    }
  } catch (error) {
    console.log("Error al configurar cron job:", error);
  }
};

// Generar y enviar PDF de Inventario
controladoresAjustes.sendInventoryReport = async (req, res) => {
  try {
    // 1. Fetch config to get the email address to send to
    const ajustes = await ajustesModel.findOne();
    const adminEmail = ajustes?.email || config.SMTP_USER || "pronatural.store.sv@gmail.com";

    // 2. Fetch all products
    const products = await productsModel.find().sort({ stock: 1 });

    // 3. Generate PDF in memory
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    
    // Header
    doc.fontSize(20).text("Pro Natural - Reporte de Inventario", { align: "center" });
    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(2);

    // Table Header
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Producto", 50, doc.y, { continued: true, width: 250 });
    doc.text("Categoría", 300, doc.y, { continued: true, width: 100 });
    doc.text("Stock", 400, doc.y, { continued: true, width: 50 });
    doc.text("Precio", 450, doc.y);
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(1);

    // Table Rows
    doc.font("Helvetica");
    products.forEach((p) => {
      // Check if we need a new page
      if (doc.y > 700) {
        doc.addPage();
      }
      
      const isLowStock = p.stock <= 15;
      if (isLowStock) doc.fillColor("red");
      
      doc.text(p.nombreProducto.substring(0, 35), 50, doc.y, { continued: true, width: 250 });
      doc.text(p.categoria || "N/A", 300, doc.y, { continued: true, width: 100 });
      doc.text(p.stock.toString(), 400, doc.y, { continued: true, width: 50 });
      doc.text(`$${p.precio.toFixed(2)}`, 450, doc.y);
      
      doc.fillColor("black"); // Reset color
      doc.moveDown(0.5);
    });

    doc.end();

    const pdfBuffer = await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });

    // 4. Send Email with PDF attachment
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
      from: '"Sistema ProNatural" <' + (config.SMTP_USER || "pronatural.store.sv@gmail.com") + '>',
      to: adminEmail,
      subject: `Reporte de Inventario - ProNatural - ${new Date().toLocaleDateString()}`,
      text: "Adjunto encontrarás el reporte de inventario actual en formato PDF.",
      attachments: [
        {
          filename: `Inventario_${new Date().toISOString().split("T")[0]}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });

    // Si es invocado desde cron, req y res pueden ser undefined
    if (res) {
      return res.status(200).json({ message: "Reporte enviado exitosamente" });
    }
  } catch (error) {
    console.error("Error al generar y enviar reporte de inventario:", error);
    if (res) {
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  }
};

export default controladoresAjustes;
