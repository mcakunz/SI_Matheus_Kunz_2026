CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION postgres;



CREATE TYPE public.situacao_usuario AS ENUM (
    'ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE'
);

CREATE TYPE public.tipo_operacao AS ENUM (
    'INSERT', 'UPDATE', 'DELETE'
);


CREATE OR REPLACE FUNCTION public.fn_atualiza_data_alteracao()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW."dataAlteracao" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_auditoria()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
DECLARE
    v_registro_id int8;
    v_usuario_id  int4;
BEGIN
    BEGIN
        v_usuario_id := current_setting('app.usuario_id')::int4;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    IF (TG_OP = 'INSERT') THEN
        v_registro_id := NEW.id;
        INSERT INTO public.tb_auditoria
            ("tabela", "registroId", "operacao", "dadosDepois", "usuarioId")
        VALUES
            (TG_TABLE_NAME, v_registro_id, 'INSERT', to_jsonb(NEW), v_usuario_id);
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        v_registro_id := NEW.id;
        INSERT INTO public.tb_auditoria
            ("tabela", "registroId", "operacao", "dadosAntes", "dadosDepois", "usuarioId")
        VALUES
            (TG_TABLE_NAME, v_registro_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), v_usuario_id);
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        v_registro_id := OLD.id;
        INSERT INTO public.tb_auditoria
            ("tabela", "registroId", "operacao", "dadosAntes", "usuarioId")
        VALUES
            (TG_TABLE_NAME, v_registro_id, 'DELETE', to_jsonb(OLD), v_usuario_id);
        RETURN OLD;
    END IF;
END;
$$;



CREATE TABLE public.tb_auditoria (
    "id"           bigserial     NOT NULL,
    "tabela"       varchar(60)   NOT NULL,
    "registroId"   int8          NOT NULL,
    "operacao"     tipo_operacao NOT NULL,
    "dadosAntes"   jsonb         NULL,   -- NULL em INSERT
    "dadosDepois"  jsonb         NULL,   -- NULL em DELETE
    "usuarioId"    int4          NULL,
    "ip"           varchar(45)   NULL,
    "dataOperacao" timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_auditoria_pkey PRIMARY KEY ("id")
);
CREATE INDEX idx_auditoria_registro ON public.tb_auditoria USING btree ("tabela", "registroId");
CREATE INDEX idx_auditoria_usuario  ON public.tb_auditoria USING btree ("usuarioId");
CREATE INDEX idx_auditoria_data     ON public.tb_auditoria USING btree ("dataOperacao");


CREATE TABLE public.tb_perfis_usuario (
    "id"            smallserial  NOT NULL,
    "perfil"        varchar(30)  NOT NULL,
    "descricao"     varchar(100) NULL,
    "nivel"         int2         DEFAULT 0    NOT NULL,  -- 10=visualizador … 99=super-admin
    "ativo"         bool         DEFAULT true NOT NULL,
    "dataCadastro"  timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_perfis_usuario_pkey       PRIMARY KEY ("id"),
    CONSTRAINT tb_perfis_usuario_perfil_key UNIQUE ("perfil")
);
CREATE TRIGGER trg_perfis_usuario_alt
    BEFORE UPDATE ON public.tb_perfis_usuario
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

INSERT INTO public.tb_perfis_usuario ("perfil", "descricao", "nivel") VALUES
    ('SUPER_ADMIN', 'Acesso total ao sistema, incluindo gestão de usuários e permissões', 99),
    ('ADMIN',       'Administrador: cadastrar/editar/excluir registros e gerenciar usuários', 80),
    ('OPERADOR',    'Pode cadastrar e editar registros, mas não excluir',                    50),
    ('VISUALIZADOR','Somente leitura',                                                        10);


CREATE TABLE public.tb_permissoes (
    "id"            serial       NOT NULL,
    "recurso"       varchar(50)  NOT NULL,
    "acao"          varchar(50)  NOT NULL,
    "descricao"     varchar(100) NULL,
    "dataCadastro"  timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_permissoes_pkey             PRIMARY KEY ("id"),
    CONSTRAINT tb_permissoes_recurso_acao_key UNIQUE ("recurso", "acao")
);
CREATE TRIGGER trg_permissoes_alt
    BEFORE UPDATE ON public.tb_permissoes
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

INSERT INTO public.tb_permissoes ("recurso", "acao", "descricao") VALUES
    -- Localidades
    ('paises',   'visualizar', 'Visualizar lista de países'),
    ('paises',   'criar',      'Cadastrar novo país'),
    ('paises',   'editar',     'Editar país existente'),
    ('paises',   'ativar',     'Ativar / inativar país'),
    ('paises',   'excluir',    'Excluir país'),
    ('estados',  'visualizar', 'Visualizar lista de estados'),
    ('estados',  'criar',      'Cadastrar novo estado'),
    ('estados',  'editar',     'Editar estado existente'),
    ('estados',  'ativar',     'Ativar / inativar estado'),
    ('estados',  'excluir',    'Excluir estado'),
    ('cidades',  'visualizar', 'Visualizar lista de cidades'),
    ('cidades',  'criar',      'Cadastrar nova cidade'),
    ('cidades',  'editar',     'Editar cidade existente'),
    ('cidades',  'ativar',     'Ativar / inativar cidade'),
    ('cidades',  'excluir',    'Excluir cidade'),
    -- Cadastros
    ('clientes',       'visualizar', 'Visualizar clientes'),
    ('clientes',       'criar',      'Cadastrar cliente'),
    ('clientes',       'editar',     'Editar cliente'),
    ('clientes',       'ativar',     'Ativar / inativar cliente'),
    ('clientes',       'excluir',    'Excluir cliente'),
    ('fornecedores',   'visualizar', 'Visualizar fornecedores'),
    ('fornecedores',   'criar',      'Cadastrar fornecedor'),
    ('fornecedores',   'editar',     'Editar fornecedor'),
    ('fornecedores',   'ativar',     'Ativar / inativar fornecedor'),
    ('fornecedores',   'excluir',    'Excluir fornecedor'),
    ('funcionarios',   'visualizar', 'Visualizar funcionários'),
    ('funcionarios',   'criar',      'Cadastrar funcionário'),
    ('funcionarios',   'editar',     'Editar funcionário'),
    ('funcionarios',   'ativar',     'Ativar / inativar funcionário'),
    ('funcionarios',   'excluir',    'Excluir funcionário'),
    ('transportadoras','visualizar', 'Visualizar transportadoras'),
    ('transportadoras','criar',      'Cadastrar transportadora'),
    ('transportadoras','editar',     'Editar transportadora'),
    ('transportadoras','ativar',     'Ativar / inativar transportadora'),
    ('transportadoras','excluir',    'Excluir transportadora'),
    -- Produtos
    ('produtos',   'visualizar', 'Visualizar produtos'),
    ('produtos',   'criar',      'Cadastrar produto'),
    ('produtos',   'editar',     'Editar produto'),
    ('produtos',   'ativar',     'Ativar / inativar produto'),
    ('produtos',   'excluir',    'Excluir produto'),
    ('categorias', 'visualizar', 'Visualizar categorias'),
    ('categorias', 'criar',      'Cadastrar categoria'),
    ('categorias', 'editar',     'Editar categoria'),
    ('categorias', 'ativar',     'Ativar / inativar categoria'),
    ('categorias', 'excluir',    'Excluir categoria'),
    ('marcas',     'visualizar', 'Visualizar marcas'),
    ('marcas',     'criar',      'Cadastrar marca'),
    ('marcas',     'editar',     'Editar marca'),
    ('marcas',     'ativar',     'Ativar / inativar marca'),
    ('marcas',     'excluir',    'Excluir marca'),
    -- Financeiro
    ('contas_receber', 'visualizar', 'Visualizar contas a receber'),
    ('contas_receber', 'criar',      'Lançar conta a receber'),
    ('contas_receber', 'editar',     'Editar conta a receber'),
    ('contas_receber', 'receber',    'Registrar recebimento'),
    ('contas_receber', 'cancelar',   'Cancelar conta a receber'),
    ('contas_pagar',   'visualizar', 'Visualizar contas a pagar'),
    ('contas_pagar',   'criar',      'Lançar conta a pagar'),
    ('contas_pagar',   'editar',     'Editar conta a pagar'),
    ('contas_pagar',   'pagar',      'Registrar pagamento'),
    ('contas_pagar',   'cancelar',   'Cancelar conta a pagar'),
    -- NF-e
    ('notas_entrada', 'visualizar', 'Visualizar notas de entrada'),
    ('notas_entrada', 'criar',      'Emitir nota de entrada'),
    ('notas_entrada', 'editar',     'Editar nota de entrada'),
    ('notas_entrada', 'cancelar',   'Cancelar nota de entrada'),
    ('notas_saida',   'visualizar', 'Visualizar notas de saída'),
    ('notas_saida',   'criar',      'Emitir nota de saída'),
    ('notas_saida',   'editar',     'Editar nota de saída'),
    ('notas_saida',   'cancelar',   'Cancelar nota de saída'),
    -- Administração
    ('usuarios',  'visualizar', 'Visualizar lista de usuários'),
    ('usuarios',  'criar',      'Cadastrar novo usuário'),
    ('usuarios',  'editar',     'Editar usuário existente'),
    ('usuarios',  'ativar',     'Ativar / inativar usuário'),
    ('usuarios',  'excluir',    'Excluir usuário'),
    ('auditoria', 'visualizar', 'Visualizar log de auditoria');


CREATE TABLE public.tb_perfil_permissoes (
    "perfilId"     int2        NOT NULL,
    "permissaoId"  int4        NOT NULL,
    "dataCadastro" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_perfil_permissoes_pkey PRIMARY KEY ("perfilId", "permissaoId"),
    CONSTRAINT tb_perfil_permissoes_perfilId_fkey
        FOREIGN KEY ("perfilId")    REFERENCES public.tb_perfis_usuario("id") ON DELETE CASCADE,
    CONSTRAINT tb_perfil_permissoes_permissaoId_fkey
        FOREIGN KEY ("permissaoId") REFERENCES public.tb_permissoes("id")     ON DELETE CASCADE
);

INSERT INTO public.tb_perfil_permissoes ("perfilId", "permissaoId")
SELECT p.id, pm.id
FROM   public.tb_perfis_usuario p
CROSS  JOIN public.tb_permissoes pm
WHERE  p.perfil IN ('SUPER_ADMIN', 'ADMIN');

INSERT INTO public.tb_perfil_permissoes ("perfilId", "permissaoId")
SELECT p.id, pm.id
FROM   public.tb_perfis_usuario p
CROSS  JOIN public.tb_permissoes pm
WHERE  p.perfil = 'OPERADOR'
  AND  pm.acao    NOT IN ('excluir', 'cancelar')
  AND  pm.recurso NOT IN ('usuarios', 'auditoria');

INSERT INTO public.tb_perfil_permissoes ("perfilId", "permissaoId")
SELECT p.id, pm.id
FROM   public.tb_perfis_usuario p
CROSS  JOIN public.tb_permissoes pm
WHERE  p.perfil = 'VISUALIZADOR'
  AND  pm.acao  = 'visualizar';

CREATE TABLE public.tb_categorias (
    "id"            serial      NOT NULL,
    "categoria"     varchar(50) NOT NULL,
    "ativo"         bool        DEFAULT true NOT NULL,
    "dataCadastro"  timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_categorias_pkey PRIMARY KEY ("id")
);
CREATE INDEX idx_tb_categorias_categoria ON public.tb_categorias USING btree ("categoria");
CREATE TRIGGER trg_categorias_alt
    BEFORE UPDATE ON public.tb_categorias
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_marcas (
    "id"            serial      NOT NULL,
    "marca"         varchar(50) NOT NULL,
    "ativo"         bool        DEFAULT true NOT NULL,
    "dataCadastro"  timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_marcas_pkey PRIMARY KEY ("id")
);
CREATE INDEX idx_tb_marcas_marca ON public.tb_marcas USING btree ("marca");
CREATE TRIGGER trg_marcas_alt
    BEFORE UPDATE ON public.tb_marcas
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_unidades_medida (
    "id"            smallserial NOT NULL,
    "unidadeMedida" varchar(50) NOT NULL,
    "ativo"         bool        DEFAULT true NOT NULL,
    "dataCadastro"  timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_unidades_medida_pkey PRIMARY KEY ("id")
);
CREATE INDEX idx_tb_unidades_medida_nome ON public.tb_unidades_medida USING btree ("unidadeMedida");
CREATE TRIGGER trg_unidades_medida_alt
    BEFORE UPDATE ON public.tb_unidades_medida
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_formas_pagamento (
    "id"             smallserial  NOT NULL,
    "formaPagamento" varchar(50)  NOT NULL,
    "descricao"      varchar(100) NOT NULL,
    "ativo"          bool         DEFAULT true NOT NULL,
    "dataCadastro"   timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"  timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_formas_pagamento_pkey PRIMARY KEY ("id")
);
CREATE TRIGGER trg_formas_pagamento_alt
    BEFORE UPDATE ON public.tb_formas_pagamento
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_condicoes_pagamento (
    "id"                  smallserial  NOT NULL,
    "condicaoPagamento"   varchar(100) NOT NULL,
    "numeroParcelas"      int2         DEFAULT 1    NOT NULL,
    "diasPrimeiraParcela" int2         DEFAULT 0    NOT NULL,
    "diasEntreParcelas"   int2         DEFAULT 0    NOT NULL,
    "percentualJuros"     numeric(5,2) DEFAULT 0.00 NOT NULL,
    "percentualMulta"     numeric(5,2) DEFAULT 0.00 NOT NULL,
    "percentualDesconto"  numeric(5,2) DEFAULT 0.00 NOT NULL,
    "ativo"               bool         DEFAULT true NOT NULL,
    "dataCadastro"        timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_condicoes_pagamento_pkey PRIMARY KEY ("id")
);
CREATE INDEX idx_tb_condicoes_pagamento_nome
    ON public.tb_condicoes_pagamento USING btree ("condicaoPagamento");
CREATE TRIGGER trg_condicoes_pagamento_alt
    BEFORE UPDATE ON public.tb_condicoes_pagamento
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_parcelas_condicao_pagamento (
    "id"                  serial       NOT NULL,
    "condicaoPagamentoId" int2         NOT NULL,
    "numero"              int2         NOT NULL,
    "dias"                int2         NOT NULL,
    "percentual"          numeric(5,2) NOT NULL,
    "formaPagamentoId"    int2         NOT NULL,
    "dataCadastro"        timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_parcelas_condicao_pagamento_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_parcelas_condicao_pagamento_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId")
        REFERENCES public.tb_condicoes_pagamento("id") ON DELETE CASCADE,
    CONSTRAINT tb_parcelas_condicao_pagamento_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id")
);
CREATE TRIGGER trg_parcelas_condicao_alt
    BEFORE UPDATE ON public.tb_parcelas_condicao_pagamento
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_funcoes_funcionario (
    "id"                smallserial   NOT NULL,
    "funcaoFuncionario" varchar(50)   NOT NULL,
    "descricao"         varchar(150)  NULL,
    "salarioBase"       numeric(10,2) DEFAULT 0.00 NOT NULL,
    "cargaHoraria"      numeric(5,2)  NOT NULL,
    "requerCnh"         bool          DEFAULT false NOT NULL,
    "observacao"        varchar(150)  NULL,
    "ativo"             bool          DEFAULT true NOT NULL,
    "dataCadastro"      timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"     timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_funcoes_funcionario_pkey PRIMARY KEY ("id")
);
CREATE INDEX idx_tb_funcoes_ativo ON public.tb_funcoes_funcionario USING btree ("ativo");
CREATE TRIGGER trg_funcoes_funcionario_alt
    BEFORE UPDATE ON public.tb_funcoes_funcionario
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_modalidades_nfe (
    "id"            smallserial NOT NULL,
    "codigo"        varchar(10) NOT NULL,
    "descricao"     varchar(50) NOT NULL,
    "ativo"         bool        DEFAULT true NOT NULL,
    "dataCadastro"  timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_modalidades_nfe_pkey       PRIMARY KEY ("id"),
    CONSTRAINT tb_modalidades_nfe_codigo_key UNIQUE ("codigo")
);
CREATE TRIGGER trg_modalidades_nfe_alt
    BEFORE UPDATE ON public.tb_modalidades_nfe
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_veiculos (
    "id"            serial        NOT NULL,
    "placa"         varchar(8)    NOT NULL,
    "modelo"        varchar(50)   NOT NULL,
    "marca"         varchar(50)   NOT NULL,
    "ano"           int2          NOT NULL,
    "capacidade"    numeric(10,2) NULL,
    "ativo"         bool          DEFAULT true NOT NULL,
    "dataCadastro"  timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_veiculos_pkey      PRIMARY KEY ("id"),
    CONSTRAINT tb_veiculos_placa_key UNIQUE ("placa")
);
CREATE TRIGGER trg_veiculos_alt
    BEFORE UPDATE ON public.tb_veiculos
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


-- =============================================================
-- LOCALIZAÇÃO
-- FKs para tb_usuarios adicionadas via ALTER TABLE ao final.
-- =============================================================

CREATE TABLE public.tb_paises (
    "id"                 smallserial NOT NULL,
    "pais"               varchar(50) NOT NULL,
    "codigo"             varchar(5)  NOT NULL,
    "sigla"              varchar(3)  NOT NULL,
    "moeda"              varchar(3)  NOT NULL,
    "nacionalidade"      varchar(50) NOT NULL,
    "ativo"              bool        DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_paises_pkey              PRIMARY KEY ("id"),
    CONSTRAINT tb_paises_pais_key          UNIQUE ("pais"),
    CONSTRAINT tb_paises_sigla_key         UNIQUE ("sigla"),
    CONSTRAINT tb_paises_codigo_key        UNIQUE ("codigo"),
    CONSTRAINT tb_paises_nacionalidade_key UNIQUE ("nacionalidade")
);
CREATE INDEX idx_tb_paises_nacionalidade ON public.tb_paises USING btree ("nacionalidade");
CREATE TRIGGER trg_paises_alt
    BEFORE UPDATE ON public.tb_paises
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();
CREATE TRIGGER trg_paises_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON public.tb_paises
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria();


CREATE TABLE public.tb_estados (
    "id"                 smallserial NOT NULL,
    "estado"             varchar(50) NOT NULL,
    "uf"                 varchar(2)  NOT NULL,
    "paisId"             int2        NOT NULL,
    "ativo"              bool        DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_estados_pkey              PRIMARY KEY ("id"),
    CONSTRAINT tb_estados_uf_paisId_key     UNIQUE ("uf", "paisId"),
    CONSTRAINT tb_estados_estado_paisId_key UNIQUE ("estado", "paisId"),
    CONSTRAINT tb_estados_paisId_fkey
        FOREIGN KEY ("paisId") REFERENCES public.tb_paises("id")
);
CREATE TRIGGER trg_estados_alt
    BEFORE UPDATE ON public.tb_estados
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();
CREATE TRIGGER trg_estados_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON public.tb_estados
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria();


CREATE TABLE public.tb_cidades (
    "id"                 serial      NOT NULL,
    "cidade"             varchar(60) NOT NULL,
    "codigoIbge"         varchar(7)  NOT NULL,
    "estadoId"           int2        NOT NULL,
    "ativo"              bool        DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_cidades_pkey                PRIMARY KEY ("id"),
    CONSTRAINT tb_cidades_codigoIbge_key      UNIQUE ("codigoIbge"),
    CONSTRAINT tb_cidades_cidade_estadoId_key UNIQUE ("cidade", "estadoId"),
    CONSTRAINT tb_cidades_estadoId_fkey
        FOREIGN KEY ("estadoId") REFERENCES public.tb_estados("id")
);
CREATE TRIGGER trg_cidades_alt
    BEFORE UPDATE ON public.tb_cidades
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();
CREATE TRIGGER trg_cidades_auditoria
    AFTER INSERT OR UPDATE OR DELETE ON public.tb_cidades
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria();

CREATE TABLE public.tb_produtos (
    "id"               serial        NOT NULL,
    "produto"          varchar(100)  NOT NULL,
    "codigoBarras"     varchar(20)   NULL,
    "referencia"       varchar(30)   NULL,
    "marcaId"          int4          NOT NULL,
    "unidadeMedidaId"  int2          NOT NULL,
    "categoriaId"      int4          NOT NULL,
    "valorCompra"      numeric(10,2) NOT NULL,
    "valorVenda"       numeric(10,2) NOT NULL,
    "quantidade"       int4          DEFAULT 0 NOT NULL,
    "quantidadeMinima" int4          DEFAULT 1 NOT NULL,
    "percentualLucro"  numeric(5,2)  DEFAULT 0.00 NOT NULL,
    "descricao"        text          NULL,
    "observacoes"      varchar(150)  NULL,
    "ativo"            bool          DEFAULT true NOT NULL,
    "dataCadastro"     timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_produtos_pkey              PRIMARY KEY ("id"),
    CONSTRAINT tb_produtos_valorCompra_check CHECK ("valorCompra" >= 0),
    CONSTRAINT tb_produtos_valorVenda_check  CHECK ("valorVenda"  >= 0),
    CONSTRAINT tb_produtos_categoriaId_fkey
        FOREIGN KEY ("categoriaId")    REFERENCES public.tb_categorias("id"),
    CONSTRAINT tb_produtos_marcaId_fkey
        FOREIGN KEY ("marcaId")        REFERENCES public.tb_marcas("id"),
    CONSTRAINT tb_produtos_unidadeMedidaId_fkey
        FOREIGN KEY ("unidadeMedidaId") REFERENCES public.tb_unidades_medida("id")
);
CREATE INDEX idx_tb_produtos_ativo_categoria
    ON public.tb_produtos USING btree ("ativo", "categoriaId");
CREATE TRIGGER trg_produtos_alt
    BEFORE UPDATE ON public.tb_produtos
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_clientes (
    "id"                  serial        NOT NULL,
    "cliente"             varchar(100)  NOT NULL,
    "apelido"             varchar(50)   NULL,
    "cpfCnpj"             varchar(14)   NOT NULL,
    "rgInscricaoEstadual" varchar(20)   NULL,
    "email"               varchar(80)   NULL,
    "telefone"            varchar(15)   NULL,
    "cep"                 varchar(9)    NULL,
    "endereco"            varchar(100)  NULL,
    "numero"              varchar(10)   NULL,
    "complemento"         varchar(50)   NULL,
    "bairro"              varchar(50)   NULL,
    "cidadeId"            int4          NOT NULL,
    "condicaoPagamentoId" int2          NULL,
    "limiteCredito"       numeric(10,2) DEFAULT 0.00 NOT NULL,
    "dataNascimento"      date          NULL,
    "tipo"                varchar(1)    NOT NULL,
    "sexo"                varchar(1)    NULL,
    "observacao"          varchar(150)  NULL,
    "ativo"               bool          DEFAULT true NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_clientes_pkey         PRIMARY KEY ("id"),
    CONSTRAINT tb_clientes_cpfCnpj_key  UNIQUE ("cpfCnpj"),
    CONSTRAINT tb_clientes_tipo_check   CHECK ("tipo" IN ('F','J')),
    CONSTRAINT tb_clientes_sexo_check   CHECK ("sexo" IS NULL OR "sexo" IN ('M','F','O')),
    CONSTRAINT tb_clientes_cidadeId_fkey
        FOREIGN KEY ("cidadeId") REFERENCES public.tb_cidades("id"),
    CONSTRAINT tb_clientes_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id")
);
CREATE INDEX idx_clientes_cidadeId
    ON public.tb_clientes USING btree ("cidadeId");
CREATE INDEX idx_clientes_condicaoPagamentoId
    ON public.tb_clientes USING btree ("condicaoPagamentoId");
CREATE INDEX idx_tb_clientes_ativo
    ON public.tb_clientes USING btree ("ativo");
CREATE INDEX idx_tb_clientes_cpfCnpj
    ON public.tb_clientes USING btree ("cpfCnpj");
CREATE TRIGGER trg_clientes_alt
    BEFORE UPDATE ON public.tb_clientes
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_funcionarios (
    "id"                  serial        NOT NULL,
    "funcionario"         varchar(100)  NOT NULL,
    "apelido"             varchar(50)   NULL,
    "cpfCnpj"             varchar(14)   NOT NULL,
    "rgInscricaoEstadual" varchar(20)   NULL,
    "telefone"            varchar(15)   NOT NULL,
    "email"               varchar(80)   NOT NULL,
    "cep"                 varchar(9)    NOT NULL,
    "endereco"            varchar(100)  NOT NULL,
    "numero"              varchar(10)   NOT NULL,
    "complemento"         varchar(50)   NULL,
    "bairro"              varchar(50)   NOT NULL,
    "cidadeId"            int4          NOT NULL,
    "funcaoFuncionarioId" int2          NOT NULL,
    "dataNascimento"      date          NOT NULL,
    "dataAdmissao"        date          NOT NULL,
    "dataDemissao"        date          NULL,
    "cnh"                 varchar(11)   NULL,
    "dataValidadeCnh"     date          NULL,
    "sexo"                varchar(1)    NOT NULL,
    "estadoCivil"         varchar(20)   NOT NULL,
    "salario"             numeric(10,2) NOT NULL,
    "tipo"                varchar(20)   DEFAULT 'INTERNO' NOT NULL,
    "observacao"          varchar(150)  NULL,
    "ativo"               bool          DEFAULT true NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_funcionarios_pkey        PRIMARY KEY ("id"),
    CONSTRAINT tb_funcionarios_cpfCnpj_key UNIQUE ("cpfCnpj"),
    CONSTRAINT tb_funcionarios_tipo_check
        CHECK ("tipo" IN ('INTERNO','EXTERNO','TERCEIRIZADO')),
    CONSTRAINT tb_funcionarios_sexo_check
        CHECK ("sexo" IN ('M','F','O')),
    CONSTRAINT tb_funcionarios_estadoCivil_check
        CHECK ("estadoCivil" IN ('SOLTEIRO','CASADO','DIVORCIADO','VIUVO','UNIAO_ESTAVEL','OUTRO')),
    CONSTRAINT tb_funcionarios_cidadeId_fkey
        FOREIGN KEY ("cidadeId") REFERENCES public.tb_cidades("id"),
    CONSTRAINT tb_funcionarios_funcaoFuncionarioId_fkey
        FOREIGN KEY ("funcaoFuncionarioId") REFERENCES public.tb_funcoes_funcionario("id")
);
CREATE INDEX idx_tb_funcionarios_ativo
    ON public.tb_funcionarios USING btree ("ativo");
CREATE TRIGGER trg_funcionarios_alt
    BEFORE UPDATE ON public.tb_funcionarios
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_transportadoras (
    "id"                  serial        NOT NULL,
    "razaoSocial"         varchar(100)  NOT NULL,
    "nomeFantasia"        varchar(80)   NULL,
    "cnpj"                varchar(14)   NOT NULL,
    "rgIe"                varchar(20)   NULL,
    "email"               varchar(80)   NULL,
    "telefone"            varchar(15)   NULL,
    "cep"                 varchar(9)    NULL,
    "endereco"            varchar(100)  NULL,
    "numero"              varchar(10)   NULL,
    "complemento"         varchar(50)   NULL,
    "bairro"              varchar(50)   NULL,
    "cidadeId"            int4          NOT NULL,
    "condicaoPagamentoId" int2          NOT NULL,
    "tipo"                varchar(1)    DEFAULT 'J' NOT NULL,
    "observacao"          varchar(150)  NULL,
    "ativo"               bool          DEFAULT true NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_transportadoras_pkey      PRIMARY KEY ("id"),
    CONSTRAINT tb_transportadoras_cnpj_key  UNIQUE ("cnpj"),
    CONSTRAINT tb_transportadoras_tipo_check CHECK ("tipo" IN ('F','J')),
    CONSTRAINT tb_transportadoras_cidadeId_fkey
        FOREIGN KEY ("cidadeId") REFERENCES public.tb_cidades("id"),
    CONSTRAINT tb_transportadoras_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id")
);
CREATE TRIGGER trg_transportadoras_alt
    BEFORE UPDATE ON public.tb_transportadoras
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_transportadora_emails (
    "idEmail"  serial      NOT NULL,
    "codTrans" int4        NOT NULL,
    "email"    varchar(80) NOT NULL,
    CONSTRAINT tb_transportadora_emails_pkey PRIMARY KEY ("idEmail"),
    CONSTRAINT tb_transportadora_emails_codTrans_fkey
        FOREIGN KEY ("codTrans") REFERENCES public.tb_transportadoras("id") ON DELETE CASCADE
);


CREATE TABLE public.tb_transportadora_telefones (
    "idTelefone" serial      NOT NULL,
    "codTrans"   int4        NOT NULL,
    "telefone"   varchar(15) NOT NULL,
    CONSTRAINT tb_transportadora_telefones_pkey PRIMARY KEY ("idTelefone"),
    CONSTRAINT tb_transportadora_telefones_codTrans_fkey
        FOREIGN KEY ("codTrans") REFERENCES public.tb_transportadoras("id") ON DELETE CASCADE
);


CREATE TABLE public.tb_transportadora_veiculo (
    "transportadoraId" int4 NOT NULL,
    "veiculoId"        int4 NOT NULL,
    CONSTRAINT tb_transportadora_veiculo_pkey PRIMARY KEY ("transportadoraId", "veiculoId"),
    CONSTRAINT tb_transportadora_veiculo_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id") ON DELETE CASCADE,
    CONSTRAINT tb_transportadora_veiculo_veiculoId_fkey
        FOREIGN KEY ("veiculoId") REFERENCES public.tb_veiculos("id") ON DELETE CASCADE
);


CREATE TABLE public.tb_transp_itens (
    "id"               serial      NOT NULL,
    "codigo"           varchar(20) NOT NULL,
    "descricao"        varchar(80) NULL,
    "transportadoraId" int4        NOT NULL,
    "codigoTransp"     varchar(20) NULL,
    "ativo"            bool        DEFAULT true NOT NULL,
    "dataCadastro"     timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_transp_itens_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_transp_itens_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id")
);
CREATE TRIGGER trg_transp_itens_alt
    BEFORE UPDATE ON public.tb_transp_itens
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_fornecedores (
    "id"                  serial        NOT NULL,
    "fornecedor"          varchar(100)  NOT NULL,
    "apelido"             varchar(50)   NULL,
    "cpfCnpj"             varchar(14)   NOT NULL,
    "rgInscricaoEstadual" varchar(20)   NULL,
    "cep"                 varchar(9)    NULL,
    "endereco"            varchar(100)  NULL,
    "numero"              varchar(10)   NULL,
    "complemento"         varchar(50)   NULL,
    "bairro"              varchar(50)   NULL,
    "cidadeId"            int4          NOT NULL,
    "condicaoPagamentoId" int2          NOT NULL,
    "transportadoraId"    int4          NULL,
    "tipo"                varchar(1)    NOT NULL,
    "limiteCredito"       numeric(15,2) DEFAULT 0.00 NOT NULL,
    "observacoes"         varchar(150)  NULL,
    "ativo"               bool          DEFAULT true NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_fornecedores_pkey        PRIMARY KEY ("id"),
    CONSTRAINT tb_fornecedores_cpfCnpj_key UNIQUE ("cpfCnpj"),
    CONSTRAINT tb_fornecedores_tipo_check  CHECK ("tipo" IN ('F','J')),
    CONSTRAINT tb_fornecedores_cidadeId_fkey
        FOREIGN KEY ("cidadeId") REFERENCES public.tb_cidades("id"),
    CONSTRAINT tb_fornecedores_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id"),
    CONSTRAINT tb_fornecedores_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id")
);


CREATE TABLE public.tb_fornecedor_email (
    "id"            serial      NOT NULL,
    "fornecedorId"  int4        NOT NULL,
    "email"         varchar(80) NOT NULL,
    "tipo"          varchar(20) DEFAULT 'COMERCIAL' NULL,
    "principal"     bool        DEFAULT false NOT NULL,
    "ativo"         bool        DEFAULT true  NOT NULL,
    "dataCadastro"  timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_fornecedor_email_pkey      PRIMARY KEY ("id"),
    CONSTRAINT tb_fornecedor_email_tipo_check
        CHECK ("tipo" IN ('COMERCIAL','FINANCEIRO','FISCAL','OUTRO')),
    CONSTRAINT tb_fornecedor_email_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id") ON DELETE CASCADE
);
CREATE TRIGGER trg_fornecedor_email_alt
    BEFORE UPDATE ON public.tb_fornecedor_email
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_fornecedor_telefone (
    "id"            serial      NOT NULL,
    "fornecedorId"  int4        NOT NULL,
    "telefone"      varchar(15) NOT NULL,
    "tipo"          varchar(20) DEFAULT 'COMERCIAL' NULL,
    "principal"     bool        DEFAULT false NOT NULL,
    "ativo"         bool        DEFAULT true  NOT NULL,
    "dataCadastro"  timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_fornecedor_telefone_pkey      PRIMARY KEY ("id"),
    CONSTRAINT tb_fornecedor_telefone_tipo_check
        CHECK ("tipo" IN ('COMERCIAL','FINANCEIRO','CELULAR','OUTRO')),
    CONSTRAINT tb_fornecedor_telefone_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id") ON DELETE CASCADE
);
CREATE TRIGGER trg_fornecedor_telefone_alt
    BEFORE UPDATE ON public.tb_fornecedor_telefone
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_produto_fornecedor (
    "id"            serial        NOT NULL,
    "produtoId"     int4          NOT NULL,
    "fornecedorId"  int4          NOT NULL,
    "codigoProd"    varchar(30)   NULL,
    "custo"         numeric(10,2) NULL,
    "ativo"         bool          DEFAULT true NOT NULL,
    "dataCadastro"  timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_produto_fornecedor_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_produto_fornecedor_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id") ON DELETE CASCADE,
    CONSTRAINT tb_produto_fornecedor_produtoId_fkey
        FOREIGN KEY ("produtoId") REFERENCES public.tb_produtos("id") ON DELETE CASCADE
);
CREATE TRIGGER trg_produto_fornecedor_alt
    BEFORE UPDATE ON public.tb_produto_fornecedor
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_usuarios (
    "id"              serial           NOT NULL,
    "usuario"         varchar(50)      NOT NULL,
    "nome"            varchar(100)     NOT NULL,
    "email"           varchar(80)      NOT NULL,
    "senhaHash"       varchar(255)     NOT NULL,
    "perfilId"        int2             NOT NULL,
    "funcionarioId"   int4             NULL,
    "situacao"        situacao_usuario DEFAULT 'ATIVO' NOT NULL,
    "tentativasLogin" int2             DEFAULT 0    NOT NULL,
    "ultimoLogin"     timestamptz      NULL,
    "tokenResetSenha" varchar(255)     NULL,
    "expiracaoToken"  timestamptz      NULL,
    "fotoPerfil"      varchar(255)     NULL,
    "observacao"      varchar(150)     NULL,
    "ativo"           bool             DEFAULT true NOT NULL,
    "dataCadastro"    timestamptz      DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"   timestamptz      DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_usuarios_pkey             PRIMARY KEY ("id"),
    CONSTRAINT tb_usuarios_email_key        UNIQUE ("email"),
    CONSTRAINT tb_usuarios_usuario_key      UNIQUE ("usuario"),
    CONSTRAINT tb_usuarios_tentativas_check CHECK ("tentativasLogin" >= 0),
    CONSTRAINT tb_usuarios_funcionarioId_fkey
        FOREIGN KEY ("funcionarioId") REFERENCES public.tb_funcionarios("id") ON DELETE SET NULL,
    CONSTRAINT tb_usuarios_perfilId_fkey
        FOREIGN KEY ("perfilId") REFERENCES public.tb_perfis_usuario("id")
);
CREATE INDEX idx_tb_usuarios_ativo    ON public.tb_usuarios USING btree ("ativo");
CREATE INDEX idx_tb_usuarios_email    ON public.tb_usuarios USING btree ("email");
CREATE INDEX idx_tb_usuarios_situacao ON public.tb_usuarios USING btree ("situacao");
CREATE TRIGGER trg_usuarios_alt
    BEFORE UPDATE ON public.tb_usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_usuarios_permissoes (
    "usuarioId"    int4        NOT NULL,
    "permissaoId"  int4        NOT NULL,
    "tipo"         varchar(10) DEFAULT 'CONCEDER' NOT NULL,
    "dataCadastro" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_usuarios_permissoes_pkey      PRIMARY KEY ("usuarioId", "permissaoId"),
    CONSTRAINT tb_usuarios_permissoes_tipo_check CHECK ("tipo" IN ('CONCEDER','NEGAR')),
    CONSTRAINT tb_usuarios_permissoes_permissaoId_fkey
        FOREIGN KEY ("permissaoId") REFERENCES public.tb_permissoes("id") ON DELETE CASCADE,
    CONSTRAINT tb_usuarios_permissoes_usuarioId_fkey
        FOREIGN KEY ("usuarioId") REFERENCES public.tb_usuarios("id") ON DELETE CASCADE
);


CREATE TABLE public.tb_log_acesso (
    "id"           bigserial    NOT NULL,
    "usuarioId"    int4         NULL,
    "loginTentado" varchar(50)  NULL,
    "sucesso"      bool         NOT NULL,
    "ipOrigem"     varchar(45)  NULL,
    "userAgent"    varchar(255) NULL,
    "observacao"   varchar(150) NULL,
    "dataAcesso"   timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_log_acesso_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_log_acesso_usuarioId_fkey
        FOREIGN KEY ("usuarioId") REFERENCES public.tb_usuarios("id") ON DELETE SET NULL
);
CREATE INDEX idx_tb_log_acesso_data    ON public.tb_log_acesso USING btree ("dataAcesso");
CREATE INDEX idx_tb_log_acesso_usuario ON public.tb_log_acesso USING btree ("usuarioId");


CREATE TABLE public.tb_refresh_tokens (
    "id"           bigserial    NOT NULL,
    "usuarioId"    int4         NOT NULL,
    "token"        varchar(255) NOT NULL,
    "expiracao"    timestamptz  NOT NULL,
    "revogado"     bool         DEFAULT false NOT NULL,
    "ipOrigem"     varchar(45)  NULL,
    "userAgent"    varchar(255) NULL,
    "dataCadastro" timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_refresh_tokens_pkey      PRIMARY KEY ("id"),
    CONSTRAINT tb_refresh_tokens_token_key UNIQUE ("token"),
    CONSTRAINT tb_refresh_tokens_usuarioId_fkey
        FOREIGN KEY ("usuarioId") REFERENCES public.tb_usuarios("id") ON DELETE CASCADE
);
CREATE INDEX idx_tb_refresh_tokens_expiracao ON public.tb_refresh_tokens USING btree ("expiracao");
CREATE INDEX idx_tb_refresh_tokens_usuario   ON public.tb_refresh_tokens USING btree ("usuarioId");

CREATE TABLE public.tb_notas_entrada (
    "numero"              varchar(20)   NOT NULL,
    "modelo"              varchar(2)    DEFAULT '55'  NOT NULL,
    "serie"               varchar(3)    DEFAULT '1'   NOT NULL,
    "fornecedorId"        int4          NOT NULL,
    "condicaoPagamentoId" int2          NOT NULL,
    "formaPagamentoId"    int2          NOT NULL,
    "transportadoraId"    int4          NULL,
    "dataEmissao"         date          DEFAULT CURRENT_DATE NOT NULL,
    "dataChegada"         date          NULL,
    "tipoFrete"           varchar(3)    DEFAULT 'CIF' NOT NULL,
    "valorProdutos"       numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "valorFrete"          numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "valorSeguro"         numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "outrasDespesas"      numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "valorDesconto"       numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "valorTotal"          numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "placaVeiculo"        varchar(8)    NULL,
    "observacoes"         text          NULL,
    "situacao"            varchar(20)   DEFAULT 'PENDENTE' NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_notas_entrada_pkey
        PRIMARY KEY ("numero", "modelo", "serie", "fornecedorId"),
    CONSTRAINT tb_notas_entrada_situacao_check
        CHECK ("situacao" IN ('PENDENTE','CONFIRMADA','CANCELADA')),
    CONSTRAINT tb_notas_entrada_tipoFrete_check
        CHECK ("tipoFrete" IN ('CIF','FOB','SEM')),
    CONSTRAINT tb_notas_entrada_dataChegada_check
        CHECK ("dataChegada" IS NULL OR "dataChegada" >= "dataEmissao"),
    CONSTRAINT tb_notas_entrada_valorProdutos_check  CHECK ("valorProdutos"  >= 0),
    CONSTRAINT tb_notas_entrada_valorFrete_check     CHECK ("valorFrete"     >= 0),
    CONSTRAINT tb_notas_entrada_valorSeguro_check    CHECK ("valorSeguro"    >= 0),
    CONSTRAINT tb_notas_entrada_outrasDespesas_check CHECK ("outrasDespesas" >= 0),
    CONSTRAINT tb_notas_entrada_valorDesconto_check  CHECK ("valorDesconto"  >= 0),
    CONSTRAINT tb_notas_entrada_valorTotal_check     CHECK ("valorTotal"     >= 0),
    CONSTRAINT tb_notas_entrada_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id"),
    CONSTRAINT tb_notas_entrada_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id"),
    CONSTRAINT tb_notas_entrada_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id"),
    CONSTRAINT tb_notas_entrada_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id")
);
CREATE TRIGGER trg_notas_entrada_alt
    BEFORE UPDATE ON public.tb_notas_entrada
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_produtos_nota_entrada (
    "notaNumero"         varchar(20)   NOT NULL,
    "notaModelo"         varchar(2)    NOT NULL,
    "notaSerie"          varchar(3)    NOT NULL,
    "fornecedorId"       int4          NOT NULL,
    "produtoId"          int4          NOT NULL,
    "sequencia"          int2          DEFAULT 1    NOT NULL,
    "quantidade"         numeric(15,4) NOT NULL,
    "valorUnitario"      numeric(15,4) NOT NULL,
    "valorDesconto"      numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "percentualDesconto" numeric(5,2)  DEFAULT 0.00   NOT NULL,
    "valorTotal"         numeric(15,4) NOT NULL,
    "rateioFrete"        numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "rateioSeguro"       numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "rateioOutras"       numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "custoPrecoFinal"    numeric(15,4) NULL,
    "dataCadastro"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_produtos_nota_entrada_pkey
        PRIMARY KEY ("notaNumero", "notaModelo", "notaSerie", "fornecedorId", "produtoId", "sequencia"),
    CONSTRAINT tb_produtos_nota_entrada_sequencia_check
        CHECK ("sequencia" > 0),
    CONSTRAINT tb_produtos_nota_entrada_quantidade_check
        CHECK ("quantidade" > 0),
    CONSTRAINT tb_produtos_nota_entrada_valorUnitario_check
        CHECK ("valorUnitario" >= 0),
    CONSTRAINT tb_produtos_nota_entrada_valorDesconto_check
        CHECK ("valorDesconto" >= 0),
    CONSTRAINT tb_produtos_nota_entrada_valorTotal_check
        CHECK ("valorTotal" >= 0),
    CONSTRAINT tb_produtos_nota_entrada_percentualDesconto_check
        CHECK ("percentualDesconto" >= 0 AND "percentualDesconto" <= 100),
    CONSTRAINT tb_produtos_nota_entrada_nota_fkey
        FOREIGN KEY ("notaNumero", "notaModelo", "notaSerie", "fornecedorId")
        REFERENCES public.tb_notas_entrada("numero", "modelo", "serie", "fornecedorId") ON DELETE CASCADE,
    CONSTRAINT tb_produtos_nota_entrada_produtoId_fkey
        FOREIGN KEY ("produtoId") REFERENCES public.tb_produtos("id")
);
CREATE TRIGGER trg_produtos_nota_entrada_alt
    BEFORE UPDATE ON public.tb_produtos_nota_entrada
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_notas_saida (
    "numero"              varchar(20)   NOT NULL,
    "modelo"              varchar(2)    DEFAULT '55'  NOT NULL,
    "serie"               varchar(3)    DEFAULT '1'   NOT NULL,
    "clienteId"           int4          NOT NULL,
    "condicaoPagamentoId" int2          NOT NULL,
    "formaPagamentoId"    int2          NOT NULL,
    "transportadoraId"    int4          NULL,
    "dataEmissao"         date          DEFAULT CURRENT_DATE NOT NULL,
    "dataSaida"           date          NULL,
    "tipoFrete"           varchar(3)    DEFAULT 'CIF' NOT NULL,
    "valorProdutos"       numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "valorFrete"          numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "valorSeguro"         numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "outrasDespesas"      numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "valorDesconto"       numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "valorTotal"          numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "placaVeiculo"        varchar(8)    NULL,
    "observacoes"         text          NULL,
    "situacao"            varchar(20)   DEFAULT 'PENDENTE' NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_notas_saida_pkey
        PRIMARY KEY ("numero", "modelo", "serie", "clienteId"),
    CONSTRAINT tb_notas_saida_situacao_check
        CHECK ("situacao" IN ('PENDENTE','CONFIRMADA','CANCELADA')),
    CONSTRAINT tb_notas_saida_tipoFrete_check
        CHECK ("tipoFrete" IN ('CIF','FOB','SEM')),
    CONSTRAINT tb_notas_saida_dataSaida_check
        CHECK ("dataSaida" IS NULL OR "dataSaida" >= "dataEmissao"),
    CONSTRAINT tb_notas_saida_valorProdutos_check  CHECK ("valorProdutos"  >= 0),
    CONSTRAINT tb_notas_saida_valorFrete_check     CHECK ("valorFrete"     >= 0),
    CONSTRAINT tb_notas_saida_valorSeguro_check    CHECK ("valorSeguro"    >= 0),
    CONSTRAINT tb_notas_saida_outrasDespesas_check CHECK ("outrasDespesas" >= 0),
    CONSTRAINT tb_notas_saida_valorDesconto_check  CHECK ("valorDesconto"  >= 0),
    CONSTRAINT tb_notas_saida_valorTotal_check     CHECK ("valorTotal"     >= 0),
    CONSTRAINT tb_notas_saida_clienteId_fkey
        FOREIGN KEY ("clienteId") REFERENCES public.tb_clientes("id"),
    CONSTRAINT tb_notas_saida_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id"),
    CONSTRAINT tb_notas_saida_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id"),
    CONSTRAINT tb_notas_saida_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id")
);
CREATE TRIGGER trg_notas_saida_alt
    BEFORE UPDATE ON public.tb_notas_saida
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_produtos_nota_saida (
    "notaNumero"         varchar(20)   NOT NULL,
    "notaModelo"         varchar(2)    NOT NULL,
    "notaSerie"          varchar(3)    NOT NULL,
    "clienteId"          int4          NOT NULL,
    "produtoId"          int4          NOT NULL,
    "sequencia"          int2          NOT NULL,
    "quantidade"         numeric(15,4) NOT NULL,
    "valorUnitario"      numeric(15,4) NOT NULL,
    "valorDesconto"      numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "percentualDesconto" numeric(5,2)  DEFAULT 0.00   NOT NULL,
    "valorTotal"         numeric(15,4) NOT NULL,
    "rateioFrete"        numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "rateioSeguro"       numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "rateioOutras"       numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "custoPrecoFinal"    numeric(15,4) DEFAULT 0.0000 NOT NULL,
    "dataCadastro"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_produtos_nota_saida_pkey
        PRIMARY KEY ("notaNumero", "notaModelo", "notaSerie", "clienteId", "produtoId", "sequencia"),
    CONSTRAINT tb_produtos_nota_saida_quantidade_check
        CHECK ("quantidade" > 0),
    CONSTRAINT tb_produtos_nota_saida_valorUnitario_check
        CHECK ("valorUnitario" >= 0),
    CONSTRAINT tb_produtos_nota_saida_valorDesconto_check
        CHECK ("valorDesconto" >= 0),
    CONSTRAINT tb_produtos_nota_saida_percentualDesconto_check
        CHECK ("percentualDesconto" >= 0 AND "percentualDesconto" <= 100),
    CONSTRAINT tb_produtos_nota_saida_nota_fkey
        FOREIGN KEY ("notaNumero", "notaModelo", "notaSerie", "clienteId")
        REFERENCES public.tb_notas_saida("numero", "modelo", "serie", "clienteId") ON DELETE CASCADE,
    CONSTRAINT tb_produtos_nota_saida_produtoId_fkey
        FOREIGN KEY ("produtoId") REFERENCES public.tb_produtos("id")
);
CREATE TRIGGER trg_produtos_nota_saida_alt
    BEFORE UPDATE ON public.tb_produtos_nota_saida
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_nfe (
    "id"                  bigserial     NOT NULL,
    "numero"              varchar(50)   NOT NULL,
    "serie"               varchar(3)    NOT NULL,
    "chaveAcesso"         varchar(44)   NULL,
    "dataEmissao"         timestamptz   NOT NULL,
    "clienteId"           int4          NOT NULL,
    "formaPagamentoId"    int2          NOT NULL,
    "condicaoPagamentoId" int2          NOT NULL,
    "transportadoraId"    int4          NULL,
    "veiculoId"           int4          NULL,
    "modalidadeId"        int2          NOT NULL,
    "valorTotal"          numeric(10,2) NOT NULL,
    "cancelada"           bool          DEFAULT false NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_nfe_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_nfe_clienteId_fkey
        FOREIGN KEY ("clienteId") REFERENCES public.tb_clientes("id"),
    CONSTRAINT tb_nfe_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id"),
    CONSTRAINT tb_nfe_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id"),
    CONSTRAINT tb_nfe_modalidadeId_fkey
        FOREIGN KEY ("modalidadeId") REFERENCES public.tb_modalidades_nfe("id"),
    CONSTRAINT tb_nfe_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id"),
    CONSTRAINT tb_nfe_veiculoId_fkey
        FOREIGN KEY ("veiculoId") REFERENCES public.tb_veiculos("id")
);
CREATE TRIGGER trg_nfe_alt
    BEFORE UPDATE ON public.tb_nfe
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_itens_nfe (
    "id"            bigserial     NOT NULL,
    "nfeId"         int8          NOT NULL,
    "produtoId"     int4          NOT NULL,
    "quantidade"    numeric(10,3) NOT NULL,
    "valorUnitario" numeric(10,2) NOT NULL,
    "valorTotal"    numeric(10,2) NOT NULL,
    "dataCadastro"  timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_itens_nfe_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_itens_nfe_nfeId_fkey
        FOREIGN KEY ("nfeId") REFERENCES public.tb_nfe("id") ON DELETE CASCADE,
    CONSTRAINT tb_itens_nfe_produtoId_fkey
        FOREIGN KEY ("produtoId") REFERENCES public.tb_produtos("id")
);
CREATE TRIGGER trg_itens_nfe_alt
    BEFORE UPDATE ON public.tb_itens_nfe
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_movimentacoes_nfe (
    "id"               bigserial   NOT NULL,
    "nfeId"            int8        NOT NULL,
    "dataMovimentacao" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "status"           varchar(30) NOT NULL,
    "descricao"        text        NULL,
    "dataCadastro"     timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_movimentacoes_nfe_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_movimentacoes_nfe_nfeId_fkey
        FOREIGN KEY ("nfeId") REFERENCES public.tb_nfe("id") ON DELETE CASCADE
);
CREATE TRIGGER trg_movimentacoes_nfe_alt
    BEFORE UPDATE ON public.tb_movimentacoes_nfe
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_contas_receber (
    "id"               bigserial     NOT NULL,
    "notaNumero"       varchar(20)   NOT NULL,
    "notaModelo"       varchar(2)    NOT NULL,
    "notaSerie"        varchar(3)    NOT NULL,
    "clienteId"        int4          NOT NULL,
    "formaPagamentoId" int2          NOT NULL,
    "numeroParcela"    int2          NOT NULL,
    "totalParcelas"    int2          NOT NULL,
    "valorOriginal"    numeric(15,2) NOT NULL,
    "valorRecebido"    numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorDesconto"    numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorJuros"       numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorMulta"       numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorTotal"       numeric(15,2) NOT NULL,
    "dataEmissao"      date          NOT NULL,
    "dataVencimento"   date          NOT NULL,
    "dataRecebimento"  date          NULL,
    "situacao"         varchar(20)   DEFAULT 'PENDENTE' NOT NULL,
    "observacoes"      text          NULL,
    "dataCadastro"     timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_contas_receber_pkey         PRIMARY KEY ("id"),
    CONSTRAINT tb_contas_receber_situacao_check
        CHECK ("situacao" IN ('PENDENTE','RECEBIDO','PARCIAL','CANCELADO')),
    CONSTRAINT tb_contas_receber_clienteId_fkey
        FOREIGN KEY ("clienteId") REFERENCES public.tb_clientes("id"),
    CONSTRAINT tb_contas_receber_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id")
);
CREATE INDEX idx_contas_receber_venc ON public.tb_contas_receber USING btree ("dataVencimento");
CREATE TRIGGER trg_contas_receber_alt
    BEFORE UPDATE ON public.tb_contas_receber
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_contas_pagar (
    "id"               bigserial     NOT NULL,
    "notaNumero"       varchar(20)   NOT NULL,
    "notaModelo"       varchar(2)    NOT NULL,
    "notaSerie"        varchar(3)    NOT NULL,
    "fornecedorId"     int4          NOT NULL,
    "formaPagamentoId" int2          NOT NULL,
    "numeroParcela"    int2          NOT NULL,
    "totalParcelas"    int2          NOT NULL,
    "valorOriginal"    numeric(15,2) NOT NULL,
    "valorPago"        numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorDesconto"    numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorJuros"       numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorMulta"       numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorTotal"       numeric(15,2) NOT NULL,
    "dataEmissao"      date          NOT NULL,
    "dataVencimento"   date          NOT NULL,
    "dataPagamento"    date          NULL,
    "situacao"         varchar(20)   DEFAULT 'PENDENTE' NOT NULL,
    "observacoes"      text          NULL,
    "dataCadastro"     timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_contas_pagar_pkey         PRIMARY KEY ("id"),
    CONSTRAINT tb_contas_pagar_situacao_check
        CHECK ("situacao" IN ('PENDENTE','PAGO','PARCIAL','CANCELADO')),
    CONSTRAINT tb_contas_pagar_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id"),
    CONSTRAINT tb_contas_pagar_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id")
);
CREATE INDEX idx_contas_pagar_venc ON public.tb_contas_pagar USING btree ("dataVencimento");
CREATE TRIGGER trg_contas_pagar_alt
    BEFORE UPDATE ON public.tb_contas_pagar
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();


CREATE TABLE public.tb_contas_pagar_avulsa (
    "id"               bigserial     NOT NULL,
    "numeroNota"       varchar(50)   NULL,
    "modelo"           varchar(2)    NULL,
    "serie"            varchar(3)    NULL,
    "fornecedorId"     int4          NOT NULL,
    "formaPagamentoId" int2          NOT NULL,
    "numeroParcela"    int2          DEFAULT 1    NOT NULL,
    "valorParcela"     numeric(15,2) NOT NULL,
    "dataEmissao"      date          NOT NULL,
    "dataVencimento"   date          NOT NULL,
    "dataPagamento"    date          NULL,
    "valorPago"        numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorJuros"       numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorMulta"       numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorDesconto"    numeric(15,2) DEFAULT 0.00 NOT NULL,
    "situacao"         varchar(20)   DEFAULT 'PENDENTE' NOT NULL,
    "observacao"       text          NULL,
    "dataCadastro"     timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_contas_pagar_avulsa_pkey         PRIMARY KEY ("id"),
    CONSTRAINT tb_contas_pagar_avulsa_situacao_check
        CHECK ("situacao" IN ('PENDENTE','PAGO','PARCIAL','CANCELADO')),
    CONSTRAINT tb_contas_pagar_avulsa_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id"),
    CONSTRAINT tb_contas_pagar_avulsa_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id")
);
CREATE INDEX idx_contas_pagar_avulsa_venc
    ON public.tb_contas_pagar_avulsa USING btree ("dataVencimento");
CREATE TRIGGER trg_contas_pagar_avulsa_alt
    BEFORE UPDATE ON public.tb_contas_pagar_avulsa
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

ALTER TABLE public.tb_auditoria
    ADD CONSTRAINT tb_auditoria_usuarioId_fkey
        FOREIGN KEY ("usuarioId") REFERENCES public.tb_usuarios("id") ON DELETE SET NULL;

ALTER TABLE public.tb_paises
    ADD CONSTRAINT tb_paises_usuarioCadastroId_fkey
        FOREIGN KEY ("usuarioCadastroId")  REFERENCES public.tb_usuarios("id") ON DELETE SET NULL,
    ADD CONSTRAINT tb_paises_usuarioAlteracaoId_fkey
        FOREIGN KEY ("usuarioAlteracaoId") REFERENCES public.tb_usuarios("id") ON DELETE SET NULL;

ALTER TABLE public.tb_estados
    ADD CONSTRAINT tb_estados_usuarioCadastroId_fkey
        FOREIGN KEY ("usuarioCadastroId")  REFERENCES public.tb_usuarios("id") ON DELETE SET NULL,
    ADD CONSTRAINT tb_estados_usuarioAlteracaoId_fkey
        FOREIGN KEY ("usuarioAlteracaoId") REFERENCES public.tb_usuarios("id") ON DELETE SET NULL;

ALTER TABLE public.tb_cidades
    ADD CONSTRAINT tb_cidades_usuarioCadastroId_fkey
        FOREIGN KEY ("usuarioCadastroId")  REFERENCES public.tb_usuarios("id") ON DELETE SET NULL,
    ADD CONSTRAINT tb_cidades_usuarioAlteracaoId_fkey
        FOREIGN KEY ("usuarioAlteracaoId") REFERENCES public.tb_usuarios("id") ON DELETE SET NULL;


CREATE OR REPLACE VIEW public.vw_permissoes_usuario AS
SELECT DISTINCT
    u.id    AS "usuarioId",
    p.recurso,
    p.acao
FROM   public.tb_usuarios u
JOIN   public.tb_perfil_permissoes pp ON pp."perfilId"    = u."perfilId"
JOIN   public.tb_permissoes        p  ON p.id             = pp."permissaoId"
WHERE NOT EXISTS (
    SELECT 1
    FROM   public.tb_usuarios_permissoes up2
    WHERE  up2."usuarioId"   = u.id
      AND  up2."permissaoId" = p.id
      AND  up2.tipo          = 'NEGAR'
)

UNION

SELECT
    up."usuarioId",
    p.recurso,
    p.acao
FROM   public.tb_usuarios_permissoes up
JOIN   public.tb_permissoes p ON p.id = up."permissaoId"
WHERE  up.tipo = 'CONCEDER';

INSERT INTO public.tb_usuarios
    ("usuario", "nome", "email", "senhaHash", "perfilId")
SELECT
    'admin',
    'Administrador',
    'admin@pratica.local',
    '$2b$12$1m.4RhqgtEZS3j1rVyVNfO/PSnZjY5tYfKJag1rtkVdP1wCvD05Sa',
    id
FROM public.tb_perfis_usuario
WHERE "perfil" = 'SUPER_ADMIN';