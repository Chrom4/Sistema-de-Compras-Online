import express from 'express';
import cors from 'cors';

import { healthRouter } from './routes/health.routes.js';
import { avaliacaoRouter } from './routes/avaliacao.routes.js';
import { carrinhoRouter } from './routes/carrinho.routes.js';
import { clienteRouter } from './routes/cliente.routes.js';
import { contaRouter } from './routes/conta.routes.js';
import { enderecoRouter } from './routes/endereco.routes.js';
import { itemCarrinhoRouter } from './routes/item_carrinho.routes.js';
import { itemPedidoRouter } from './routes/item_pedido.routes.js';
import { pagamentoRouter } from './routes/pagamento.routes.js';
import { pedidoRouter } from './routes/pedido.routes.js';
import { produtoRouter } from './routes/produto.routes.js';
import { usuarioRouter } from './routes/usuario.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { atendenteRouter } from './routes/atendente.routes.js';

export const createServer = () => {
    const app = express();

    // Middlewares globais
    app.use(cors());
    app.use(express.json());

    // Rotas da aplicação
    app.use('/health', healthRouter);
    app.use('/avaliacoes', avaliacaoRouter);
    app.use('/carrinhos', carrinhoRouter);
    app.use('/clientes', clienteRouter);
    app.use('/contas', contaRouter);
    app.use('/enderecos', enderecoRouter);
    app.use('/itens-carrinho', itemCarrinhoRouter);
    app.use('/itens-pedido', itemPedidoRouter);
    app.use('/pagamentos', pagamentoRouter);
    app.use('/pedidos', pedidoRouter);
    app.use('/produtos', produtoRouter);
    app.use('/usuarios', usuarioRouter);
    app.use('/auth', authRouter);
    app.use('/atendente', atendenteRouter);
    app.use('/admin', atendenteRouter);

    return app;
};