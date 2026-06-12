# DEPENDÊNCIAS UTILIZADAS

Aqui serão listadas as dependências necessárias para a confecção do trabalho. 

- **mysql2**: Driver principal que conecta o Node.js ao nosso SGBD usado, mySQL.

- **express**: Serviço para servidor node rápido, simples para criar rotas e APIs.

- **cors**: Biblioteca que permite fazer requisições pelo navegador para o servidor por meio de *fetch*.

- **dotenv**: Para carregar variáveis de ambiente. Segurança para a senha do banco de dados e outras informações que não podem permanecer no código fonte.

- **bcrypt**: Para criptografar as senhas dos usuários antes de salvar no BD.

- **jsonwebtoken (JWT)**: Para gerenciar sessões. O usuário recebe um token para acesso a rotas bloqueadas após seu login.

- **zod**: Para criar *schemas* (esquemas) paras as tabelas e registros que irão para o BD.

- **nodemon**: Dependência de dev. Para manter o servidor vivo e rodando sempre que houver alteração no código.