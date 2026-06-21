import { createServer } from './app.js';
import { pool } from './config/database.js';
import { env } from './config/env.js';

const app = createServer();

const startServer = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL com sucesso!');
        connection.release(); // Libera a conexão de volta para o pool

        // Inicia o servidor Express apenas se o banco estiver OK
        app.listen(env.httpPort, () => {
            console.log(`Server está rodando na porta ${env.httpPort}`);
        });

    } catch (error) {
        console.error('Erro fatal: Não foi possível conectar ao banco de dados.', error);
        process.exit(1); // Derruba a aplicação se o banco de dados estiver fora do ar
    }
};

startServer();