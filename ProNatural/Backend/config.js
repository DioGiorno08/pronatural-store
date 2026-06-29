import dotenv from "dotenv";
dotenv.config();

export const config = {
    db: {
        URI: process.env.DB_URI,
    },
    JWT: {
        secret: process.env.JWT_secret_key,
    },
    wompi: {
        grant_type: process.env.GRANT_TYPE,
        audience: process.env.AUDIENCE,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
    },
    email: {
        user_email: process.env.USER_EMAIL || "test@gmail.com",
        user_password: process.env.USER_PASSWORD || "password123",
    }
};