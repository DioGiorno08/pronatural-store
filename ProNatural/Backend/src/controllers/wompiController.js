import fetch from "node-fetch";
import crypto from "crypto";
import { config } from "../../config.js";

// Array de funciones
const wompiController = {};

// ─────────────────────────────────────────────
// #1 GENERAR TOKEN DE ACCESO
// ─────────────────────────────────────────────
wompiController.generarToken = async (req, res) => {
  try {
    const response = await fetch("https://id.wompi.sv/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: config.wompi.grant_type,
        audience: config.wompi.audience,
        client_id: config.wompi.client_id,
        client_secret: config.wompi.client_secret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────
// #2 TRANSACCIÓN DE PRUEBA (sin 3DS)
// ─────────────────────────────────────────────
wompiController.paymentTest = async (req, res) => {
  try {
    const { token, formData } = req.body;

    if (!token || !formData) {
      return res
        .status(400)
        .json({ message: "token and formData are required" });
    }

    const response = await fetch(
      "https://api.wompi.sv/TransaccionCompra/TokenizadaSin3Ds",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────
// #3 TRANSACCIÓN REAL CON 3DS
// ─────────────────────────────────────────────
wompiController.payment3DS = async (req, res) => {
  try {
    const { token, formData } = req.body;

    if (!token || !formData) {
      return res
        .status(400)
        .json({ message: "token and formData are required" });
    }

    const response = await fetch("https://api.wompi.sv/TransaccionCompra/3Ds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────
// #4 CONSULTAR ESTADO DE UNA TRANSACCIÓN
// ─────────────────────────────────────────────
wompiController.getTransactionStatus = async (req, res) => {
  try {
    // #1 - Obtener token primero
    const tokenResponse = await fetch("https://id.wompi.sv/connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: config.wompi.grant_type,
        audience: config.wompi.audience,
        client_id: config.wompi.client_id,
        client_secret: config.wompi.client_secret,
      }),
    });

    if (!tokenResponse.ok) {
      return res.status(500).json({ message: "Error getting Wompi token" });
    }

    const { access_token } = await tokenResponse.json();

    // #2 - Consultar transacción por ID
    const { transactionId } = req.params;

    const response = await fetch(
      `https://api.wompi.sv/TransaccionCompra/${transactionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────
// #5 WEBHOOK - Recibir notificaciones de Wompi
// Wompi envía una firma HMAC-SHA256 que se valida
// con el client_secret para confirmar autenticidad
// ─────────────────────────────────────────────
wompiController.webhook = async (req, res) => {
  try {
    // #1 - Leer la firma del header que envía Wompi
    const wompiSignature = req.headers["x-wompi-signature"];

    if (!wompiSignature) {
      return res.status(400).json({ message: "Missing Wompi signature" });
    }

    // #2 - Recrear la firma con el body recibido y el client_secret
    const rawBody = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", config.wompi.client_secret)
      .update(rawBody)
      .digest("hex");

    // #3 - Comparar firmas de forma segura (timingSafeEqual evita ataques de tiempo)
    const sigBuffer = Buffer.from(wompiSignature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    // #4 - Procesar el evento
    const { evento, transaccion } = req.body;

    console.log(`Wompi webhook - Evento: ${evento}`, transaccion);

    // Aquí puedes manejar los distintos eventos:
    // 'TransaccionAprobada', 'TransaccionRechazada', 'TransaccionReversada'
    switch (evento) {
      case "TransaccionAprobada":
        // TODO: actualizar estado del pedido a 'completed'
        break;
      case "TransaccionRechazada":
        // TODO: actualizar estado del pedido a 'cancelled'
        break;
      case "TransaccionReversada":
        // TODO: reembolso - restituir stock y actualizar estado
        break;
      default:
        console.log("Evento no manejado:", evento);
    }

    // Siempre responder 200 para que Wompi no reintente
    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default wompiController;
