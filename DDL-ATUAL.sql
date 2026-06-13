CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION postgres;

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

CREATE TABLE public.tb_formas_pagamento (
    "id"             smallserial  NOT NULL,
    "formaPagamento" varchar(50)  NOT NULL,
    "descricao"      varchar(100) NOT NULL,
    "ativo"          bool         DEFAULT true NOT NULL,
    "dataCadastro"   timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"  timestamptz  DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_formas_pagamento_pkey PRIMARY KEY ("id")
);


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



CREATE TABLE public.tb_transportadoras (
    "id"                  serial        NOT NULL,
    "razaoSocial"         varchar(100)  NOT NULL,
    "nomeFantasia"        varchar(80)   NULL,
    "cnpj"                varchar(14)   NOT NULL,
    "rgIe"                varchar(20)   NULL,
    "cep"                 varchar(9)    NULL,
    "endereco"            varchar(100)  NULL,
    "numero"              varchar(10)   NULL,
    "complemento"         varchar(50)   NULL,
    "bairro"              varchar(50)   NULL,
    "cidadeId"            int4          NOT NULL,
    "condicaoPagamentoId" int2          NOT NULL,
    "tipo"                varchar(1)    DEFAULT 'J' NOT NULL,
    "limiteCredito"       numeric(15,2) DEFAULT 0.00 NOT NULL,
    "observacoes"         varchar(150)  NULL,
    "ativo"               bool          DEFAULT true NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_transportadoras_pkey       PRIMARY KEY ("id"),
    CONSTRAINT tb_transportadoras_cnpj_key   UNIQUE ("cnpj"),
    CONSTRAINT tb_transportadoras_tipo_check CHECK ("tipo" IN ('F','J')),
    CONSTRAINT tb_transportadoras_cidadeId_fkey
        FOREIGN KEY ("cidadeId") REFERENCES public.tb_cidades("id"),
    CONSTRAINT tb_transportadoras_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id")
);


CREATE TABLE public.tb_transportadora_email (
    "id"               serial      NOT NULL,
    "transportadoraId" int4        NOT NULL,
    "email"            varchar(80) NOT NULL,
    "tipo"             varchar(20) DEFAULT 'COMERCIAL' NULL,
    "principal"        bool        DEFAULT false NOT NULL,
    "ativo"            bool        DEFAULT true  NOT NULL,
    "dataCadastro"     timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_transportadora_email_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_transportadora_email_tipo_check
        CHECK ("tipo" IN ('COMERCIAL','FINANCEIRO','FISCAL','OUTRO')),
    CONSTRAINT tb_transportadora_email_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id") ON DELETE CASCADE
);



CREATE TABLE public.tb_transportadora_telefone (
    "id"               serial      NOT NULL,
    "transportadoraId" int4        NOT NULL,
    "telefone"         varchar(15) NOT NULL,
    "tipo"             varchar(20) DEFAULT 'COMERCIAL' NULL,
    "principal"        bool        DEFAULT false NOT NULL,
    "ativo"            bool        DEFAULT true  NOT NULL,
    "dataCadastro"     timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_transportadora_telefone_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_transportadora_telefone_tipo_check
        CHECK ("tipo" IN ('COMERCIAL','FINANCEIRO','CELULAR','OUTRO')),
    CONSTRAINT tb_transportadora_telefone_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id") ON DELETE CASCADE
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


CREATE TABLE public.tb_transportadora_itens (
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

CREATE TYPE public.situacao_usuario AS ENUM (
    'ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE'
);

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
    CONSTRAINT tb_usuarios_usuario_key      UNIQUE ("usuario")
);

CREATE TYPE public.tipo_operacao AS ENUM (
    'INSERT', 'UPDATE', 'DELETE'
);


CREATE TABLE public.tb_auditoria (
    "id"           bigserial     NOT NULL,
    "tabela"       varchar(60)   NOT NULL,
    "registroId"   int8          NOT NULL,
    "operacao"     tipo_operacao NOT NULL,
    "dadosAntes"   jsonb         NULL,
    "dadosDepois"  jsonb         NULL,
    "usuarioId"    int4          NULL,
    "ip"           varchar(45)   NULL,
    "dataOperacao" timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_auditoria_pkey PRIMARY KEY ("id")
);
