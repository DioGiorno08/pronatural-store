import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Importando las rutas antiguas en español (como están en tu repo actual testpronatural)
import authRoutes from "./src/routes/auth.js";
import categoriasRoutes from "./src/routes/Categorias.js";
import productosRoutes from "./src/routes/Productos.js";
import ventasRoutes from "./src/routes/Ventas.js";
import inventarioRoutes from "./src/routes/Inventario.js";
import empleadosRoutes from "./src/routes/Empleados.js";
import clientesRoutes from "./src/routes/Clientes.js";
import registerClienteRoutes from "./src/routes/registerCliente.js";
import carritoRoutes from "./src/routes/Carrito.js";
import resenasRoutes from "./src/routes/Resenas.js";
import recoveryAdminRoutes from "./src/routes/recoveryAdmin.js";
import recoveryPasswordRoutes from "./src/routes/recoveryPassword.js";

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriasRoutes);
app.use("/api/products", productosRoutes);
app.use("/api/sales", ventasRoutes);
app.use("/api/inventory", inventarioRoutes);
app.use("/api/employees", empleadosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/registerCliente", registerClienteRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/reviews", resenasRoutes);
app.use("/api/auth/recoveryAdmin", recoveryAdminRoutes);
app.use("/api/auth/recoveryCustomer", recoveryPasswordRoutes);

export default app;
