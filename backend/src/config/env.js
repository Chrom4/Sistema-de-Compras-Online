import "dotenv/config";

export const env = {
    httpPort: process.env.HTTP_PORT || 3001,
    dbHost: process.env.DB_HOST || 'localhost',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME || 'online_shopping',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRES_IN || '1h',
}