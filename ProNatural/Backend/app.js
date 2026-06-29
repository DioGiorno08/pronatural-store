import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import wompiRoutes from "./src/routes/wompi.js";
import categoriesRoutes from "./src/routes/categories.js";
import salesRoutes from "./src/routes/sales.js";
import productsRoutes from "./src/routes/products.js";
import inventoryRoutes from "./src/routes/inventory.js";
import authRoutes from "./src/routes/auth.js";
import empleadosRoutes from "./src/routes/empleados.js";
import recoveryAdminRoutes from "./src/routes/recoveryAdmin.js";
import clientesRoutes from "./src/routes/clientes.js";
import registerClienteRoutes from "./src/routes/registerCliente.js";
import recoveryPasswordRoutes from "./src/routes/recoveryPassword.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/wompi", wompiRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth/recoveryAdmin", recoveryAdminRoutes);
app.use("/api/employees", empleadosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/registerCliente", registerClienteRoutes);
app.use("/api/auth/recoveryCustomer", recoveryPasswordRoutes);

export default app;