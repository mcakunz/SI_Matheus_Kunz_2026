DROP SCHEMA public CASCADE;
CREATE SCHEMA public AUTHORIZATION postgres;

CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION postgres;

CREATE OR REPLACE FUNCTION public.fn_atualiza_data_alteracao()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW."dataAlteracao" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


CREATE TABLE public.tb_paises (
    "id"                 smallserial NOT NULL,
    "pais"               varchar(54) NOT NULL,
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
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_formas_pagamento_pkey PRIMARY KEY ("id")
);


CREATE TABLE public.tb_condicoes_pagamento (
    "id"                  smallserial  NOT NULL,
    "condicaoPagamento"   varchar(100) NOT NULL,
    "numeroParcelas"      int2         DEFAULT 1    NOT NULL,
    "diasPrimeiraParcela" int2         DEFAULT 0    NOT NULL,
    "percentualJuros"     numeric(5,2) DEFAULT 0.00 NOT NULL,
    "percentualMulta"     numeric(5,2) DEFAULT 0.00 NOT NULL,
    "percentualDesconto"  numeric(5,2) DEFAULT 0.00 NOT NULL,
    "ativo"               bool         DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
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
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id"),
    CONSTRAINT tb_parcelas_condicao_pagamento_unico 
    	UNIQUE ("condicaoPagamentoId", "numero")
);

CREATE TABLE public.tb_veiculos (
    "id"            serial        NOT NULL,
    "placa"         varchar(8)    NOT NULL,
    "modelo"        varchar(50)   NOT NULL,
    "marca"         varchar(50)   NOT NULL,
    "ano"           int2          NOT NULL,
    "capacidade"    numeric(10,2) NULL,
    "ativo"         bool          DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_veiculos_pkey      PRIMARY KEY ("id"),
    CONSTRAINT tb_veiculos_placa_key UNIQUE ("placa")
);



CREATE TABLE public.tb_transportadoras (
    "id"                  serial        NOT NULL,
    "razaoSocialNome"     varchar(100)  NOT NULL,
    "nomeFantasiaApelido" varchar(80)   NULL,
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
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
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
    "tipo"             varchar(20) DEFAULT 'COMERCIAL' NOT NULL,
    "principal"        bool        DEFAULT false NOT NULL,
    "ativo"            bool        DEFAULT true  NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_transportadora_email_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_transportadora_email_tipo_check
        CHECK ("tipo" IN ('COMERCIAL', 'FINANCEIRO', 'FISCAL')),
    CONSTRAINT tb_transportadora_email_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_transportadora_email_principal
    ON public.tb_transportadora_email ("transportadoraId")
    WHERE "principal" = true;
 
 
CREATE TABLE public.tb_transportadora_telefone (
    "id"               serial      NOT NULL,
    "transportadoraId" int4        NOT NULL,
    "telefone"         varchar(15) NOT NULL,
    "tipo"             varchar(20) DEFAULT 'COMERCIAL' NOT NULL,
    "principal"        bool        DEFAULT false NOT NULL,
    "ativo"            bool        DEFAULT true  NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_transportadora_telefone_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_transportadora_telefone_tipo_check
        CHECK ("tipo" IN ('COMERCIAL', 'FINANCEIRO')),
    CONSTRAINT tb_transportadora_telefone_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_transportadora_telefone_principal
    ON public.tb_transportadora_telefone ("transportadoraId")
    WHERE "principal" = true;


CREATE TABLE public.tb_transportadora_veiculo (
    "transportadoraId" int4 NOT NULL,
    "veiculoId"        int4 NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
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
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id"),
    CONSTRAINT tb_transp_itens_transportadoraId_codigo_key 
    	UNIQUE ("transportadoraId", "codigo")
);

CREATE TYPE public.situacao_usuario AS ENUM (
    'ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE'
);

CREATE TABLE public.tb_categorias (
    "id"            serial      NOT NULL,
    "categoria"     varchar(50) NOT NULL,
    "ativo"         bool        DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_categorias_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_categorias_categoria_key UNIQUE ("categoria")
);

CREATE TABLE public.tb_marcas (
    "id"            serial      NOT NULL,
    "marca"         varchar(50) NOT NULL,
    "ativo"         bool        DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_marcas_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_marcas_marca_key UNIQUE ("marca")
);

CREATE TABLE public.tb_unidades_medida (
    "id"            smallserial NOT NULL,
    "unidadeMedida" varchar(3) NOT NULL,
    "ativo"         bool        DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_unidades_medida_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_unidades_medida_unidadeMedida_key UNIQUE ("unidadeMedida")
);

CREATE TABLE public.tb_produtos (
    "id"               serial        NOT NULL,
    "produto"          varchar(50)  NOT NULL,
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
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    "custoMedio"         numeric(18,6) DEFAULT 0 NOT NULL,
    CONSTRAINT tb_produtos_pkey              PRIMARY KEY ("id"),
    CONSTRAINT tb_produtos_valorCompra_check CHECK ("valorCompra" >= 0),
    CONSTRAINT tb_produtos_valorVenda_check  CHECK ("valorVenda"  >= 0),
    CONSTRAINT tb_produtos_custoMedio_check  CHECK ("custoMedio"  >= 0),
    CONSTRAINT tb_produtos_categoriaId_fkey
        FOREIGN KEY ("categoriaId")    REFERENCES public.tb_categorias("id"),
    CONSTRAINT tb_produtos_marcaId_fkey
        FOREIGN KEY ("marcaId")        REFERENCES public.tb_marcas("id"),
    CONSTRAINT tb_produtos_unidadeMedidaId_fkey
        FOREIGN KEY ("unidadeMedidaId") REFERENCES public.tb_unidades_medida("id")
);
CREATE UNIQUE INDEX idx_produtos_codigoBarras 
	ON tb_produtos ("codigoBarras") 
		WHERE "codigoBarras" IS NOT NULL;


CREATE TABLE public.tb_clientes (
    "id"                  serial        NOT NULL,
    "cliente"             varchar(100)  NOT NULL,
    "apelido"             varchar(50)   NULL,
    "cpfCnpj"             varchar(14)   NOT NULL,
    "rgInscricaoEstadual" varchar(20)   NULL,
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
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_clientes_pkey         PRIMARY KEY ("id"),
    CONSTRAINT tb_clientes_cpfCnpj_key  UNIQUE ("cpfCnpj"),
    CONSTRAINT tb_clientes_tipo_check   CHECK ("tipo" IN ('F','J')),
    CONSTRAINT tb_clientes_sexo_check   CHECK ("sexo" IS NULL OR "sexo" IN ('M','F','O')),
    CONSTRAINT tb_clientes_cidadeId_fkey
        FOREIGN KEY ("cidadeId") REFERENCES public.tb_cidades("id"),
    CONSTRAINT tb_clientes_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id")
);

CREATE TABLE public.tb_cliente_email (
    "id"         serial      NOT NULL,
    "clienteId"  int4        NOT NULL,
    "email"      varchar(80) NOT NULL,
    "tipo"       varchar(20) DEFAULT 'COMERCIAL' NULL,
    "principal"  bool        DEFAULT false NOT NULL,
    "ativo"      bool        DEFAULT true  NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_cliente_email_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_cliente_email_tipo_check
        CHECK ("tipo" IN ('PESSOAL', 'COMERCIAL', 'FINANCEIRO', 'FISCAL')),
    CONSTRAINT tb_cliente_email_clienteId_fkey
        FOREIGN KEY ("clienteId") REFERENCES public.tb_clientes("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_cliente_email_principal
    ON public.tb_cliente_email ("clienteId")
    WHERE "principal" = true;

CREATE TABLE public.tb_cliente_telefone (
    "id"         serial      NOT NULL,
    "clienteId"  int4        NOT NULL,
    "telefone"   varchar(15) NOT NULL,
    "tipo"       varchar(20) DEFAULT 'COMERCIAL' NULL,
    "principal"  bool        DEFAULT false NOT NULL,
    "ativo"      bool        DEFAULT true  NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_cliente_telefone_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_cliente_telefone_tipo_check
        CHECK ("tipo" IN ('PESSOAL', 'COMERCIAL', 'FINANCEIRO')),
    CONSTRAINT tb_cliente_telefone_clienteId_fkey
        FOREIGN KEY ("clienteId") REFERENCES public.tb_clientes("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_cliente_telefone_principal
    ON public.tb_cliente_telefone ("clienteId")
    WHERE "principal" = true;


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
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
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
    "id"           serial      NOT NULL,
    "fornecedorId" int4        NOT NULL,
    "email"        varchar(80) NOT NULL,
    "tipo"         varchar(20) DEFAULT 'COMERCIAL' NULL,
    "principal"    bool        DEFAULT false NOT NULL,
    "ativo"        bool        DEFAULT true  NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_fornecedor_email_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_fornecedor_email_tipo_check
        CHECK ("tipo" IN ('COMERCIAL', 'FINANCEIRO', 'FISCAL')),
    CONSTRAINT tb_fornecedor_email_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_fornecedor_email_principal
    ON public.tb_fornecedor_email ("fornecedorId")
    WHERE "principal" = true;


CREATE TABLE public.tb_fornecedor_telefone (
    "id"           serial      NOT NULL,
    "fornecedorId" int4        NOT NULL,
    "telefone"     varchar(15) NOT NULL,
    "tipo"         varchar(20) DEFAULT 'COMERCIAL' NULL,
    "principal"    bool        DEFAULT false NOT NULL,
    "ativo"        bool        DEFAULT true  NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_fornecedor_telefone_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_fornecedor_telefone_tipo_check
        CHECK ("tipo" IN ('COMERCIAL', 'FINANCEIRO')),
    CONSTRAINT tb_fornecedor_telefone_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_fornecedor_telefone_principal
    ON public.tb_fornecedor_telefone ("fornecedorId")
    WHERE "principal" = true;

CREATE TABLE public.tb_funcoes_funcionario (
    "id"                 smallserial   NOT NULL,
    "funcaoFuncionario"  varchar(50)   NOT NULL,
    "descricao"          varchar(150)  NULL,
    "salarioBase"        numeric(10,2) DEFAULT 0.00 NOT NULL,
    "cargaHoraria"       numeric(5,2)  NOT NULL,
    "requerCnh"          bool          DEFAULT false NOT NULL,
    "observacao"         varchar(150)  NULL,
    "ativo"              bool          DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4          NULL,
    "usuarioAlteracaoId" int4          NULL,
    CONSTRAINT tb_funcoes_funcionario_pkey PRIMARY KEY ("id")
);
 
CREATE TABLE public.tb_funcionarios (
    "id"                  serial        NOT NULL,
    "funcionario"         varchar(100)  NOT NULL,
    "apelido"             varchar(50)   NULL,
    "cpfCnpj"             varchar(14)   NOT NULL,
    "rgInscricaoEstadual" varchar(20)   NULL,
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
    "salario"             numeric(10,2) NOT NULL,
    "tipo"                varchar(20)   DEFAULT 'INTERNO' NOT NULL,
    "observacao"          varchar(150)  NULL,
    "ativo"               bool          DEFAULT true NOT NULL,
    "dataCadastro"        timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"   int4          NULL,
    "usuarioAlteracaoId"  int4          NULL,
 
    CONSTRAINT tb_funcionarios_pkey        PRIMARY KEY ("id"),
    CONSTRAINT tb_funcionarios_cpfCnpj_key UNIQUE ("cpfCnpj"),
 
    CONSTRAINT tb_funcionarios_tipo_check
        CHECK ("tipo" IN ('INTERNO','EXTERNO','TERCEIRIZADO')),
 
    CONSTRAINT tb_funcionarios_sexo_check
        CHECK ("sexo" IN ('M','F','O')),
 
    CONSTRAINT tb_funcionarios_cidadeId_fkey
        FOREIGN KEY ("cidadeId") REFERENCES public.tb_cidades("id"),
 
    CONSTRAINT tb_funcionarios_funcaoFuncionarioId_fkey
        FOREIGN KEY ("funcaoFuncionarioId") REFERENCES public.tb_funcoes_funcionario("id")
);

CREATE TABLE public.tb_funcionario_email (
    "id"            serial      NOT NULL,
    "funcionarioId" int4        NOT NULL,
    "email"         varchar(80) NOT NULL,
    "tipo"          varchar(20) DEFAULT 'PESSOAL' NOT NULL,
    "principal"     bool        DEFAULT false NOT NULL,
    "ativo"         bool        DEFAULT true  NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_funcionario_email_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_funcionario_email_tipo_check
        CHECK ("tipo" IN ('PESSOAL', 'CORPORATIVO')),
    CONSTRAINT tb_funcionario_email_funcionarioId_fkey
        FOREIGN KEY ("funcionarioId") REFERENCES public.tb_funcionarios("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_funcionario_email_principal
    ON public.tb_funcionario_email ("funcionarioId")
    WHERE "principal" = true;
 
CREATE TABLE public.tb_funcionario_telefone (
    "id"            serial      NOT NULL,
    "funcionarioId" int4        NOT NULL,
    "telefone"      varchar(15) NOT NULL,
    "tipo"          varchar(20) DEFAULT 'PESSOAL' NOT NULL,
    "principal"     bool        DEFAULT false NOT NULL,
    "ativo"         bool        DEFAULT true  NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_funcionario_telefone_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_funcionario_telefone_tipo_check
        CHECK ("tipo" IN ('PESSOAL', 'CORPORATIVO')),
    CONSTRAINT tb_funcionario_telefone_funcionarioId_fkey
        FOREIGN KEY ("funcionarioId") REFERENCES public.tb_funcionarios("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_funcionario_telefone_principal
    ON public.tb_funcionario_telefone ("funcionarioId")
    WHERE "principal" = true;


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


CREATE TABLE public.tb_perfis (
    "id"                 smallserial NOT NULL,
    "perfil"             varchar(50) NOT NULL,
    "descricao"          varchar(150) NULL,
    "ativo"              bool        DEFAULT true NOT NULL,
    "dataCadastro"       timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4        NULL,
    "usuarioAlteracaoId" int4        NULL,
    CONSTRAINT tb_perfis_pkey       PRIMARY KEY ("id"),
    CONSTRAINT tb_perfis_perfil_key UNIQUE ("perfil")
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
    CONSTRAINT tb_usuarios_usuario_key      UNIQUE ("usuario"),
    CONSTRAINT tb_usuarios_perfilId_fkey    
        FOREIGN KEY ("perfilId") REFERENCES public.tb_perfis("id")
);

CREATE TABLE public.tb_modalidades_nfe (
    "id"            smallserial     NOT NULL,
    "codigo"        varchar(10)     NOT NULL,
    "descricao"     varchar(50)     NOT NULL,
    "ativo"         bool            DEFAULT true NOT NULL,
    "dataCadastro"  timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_modalidades_nfe_codigo_key UNIQUE ("codigo"),
    CONSTRAINT tb_modalidades_nfe_pkey PRIMARY KEY ("id")
);
CREATE TRIGGER trg_modalidades_nfe_alt BEFORE UPDATE ON public.tb_modalidades_nfe
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_notas_entrada (
    "numero"              varchar(20)     NOT NULL,
    "modelo"              varchar(2)      DEFAULT '55' NOT NULL,
    "serie"               varchar(3)      DEFAULT '1' NOT NULL,
    "fornecedorId"        int4            NOT NULL,
    "condicaoPagamentoId" int2            NOT NULL,
    "formaPagamentoId"    int2            NOT NULL,
    "transportadoraId"    int4            NULL,
    "dataEmissao"         date            DEFAULT CURRENT_DATE NOT NULL,
    "dataChegada"         date            NULL,
    "tipoFrete"           varchar(3)      DEFAULT 'CIF' NOT NULL,
    "valorProdutos"       numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "valorFrete"          numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "valorSeguro"         numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "outrasDespesas"      numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "valorDesconto"       numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "valorTotal"          numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "placaVeiculo"        varchar(8)      NULL,
    "observacoes"         text            NULL,
    "situacao"            varchar(20)     DEFAULT 'LANCADA' NOT NULL,
    "dataCadastro"        timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_notas_entrada_pkey PRIMARY KEY ("numero", "modelo", "serie", "fornecedorId"),
    CONSTRAINT tb_notas_entrada_situacao_check
        CHECK ("situacao" IN ('LANCADA','CANCELADA')),
    CONSTRAINT tb_notas_entrada_tipoFrete_check
        CHECK ("tipoFrete" IN ('CIF','FOB','SEM')),
    CONSTRAINT check_data_chegada
        CHECK ("dataChegada" IS NULL OR "dataChegada" >= "dataEmissao"),
    CONSTRAINT tb_notas_entrada_valorProdutos_check   CHECK ("valorProdutos"   >= 0),
    CONSTRAINT tb_notas_entrada_valorFrete_check      CHECK ("valorFrete"      >= 0),
    CONSTRAINT tb_notas_entrada_valorSeguro_check     CHECK ("valorSeguro"     >= 0),
    CONSTRAINT tb_notas_entrada_outrasDespesas_check  CHECK ("outrasDespesas"  >= 0),
    CONSTRAINT tb_notas_entrada_valorDesconto_check   CHECK ("valorDesconto"   >= 0),
    CONSTRAINT tb_notas_entrada_valorTotal_check      CHECK ("valorTotal"      >= 0),
    CONSTRAINT tb_notas_entrada_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id"),
    CONSTRAINT tb_notas_entrada_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id"),
    CONSTRAINT tb_notas_entrada_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id"),
    CONSTRAINT tb_notas_entrada_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id")
);
CREATE TRIGGER trg_notas_entrada_alt BEFORE UPDATE ON public.tb_notas_entrada
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_notas_saida (
    "numero"              varchar(20)     NOT NULL,
    "modelo"              varchar(2)      DEFAULT '55' NOT NULL,
    "serie"               varchar(3)      DEFAULT '1' NOT NULL,
    "clienteId"           int4            NOT NULL,
    "condicaoPagamentoId" int2            NOT NULL,
    "formaPagamentoId"    int2            NOT NULL,
    "transportadoraId"    int4            NULL,
    "dataEmissao"         date            DEFAULT CURRENT_DATE NOT NULL,
    "dataSaida"           date            NULL,
    "tipoFrete"           varchar(3)      DEFAULT 'CIF' NOT NULL,
    "valorProdutos"       numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "valorFrete"          numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "valorSeguro"         numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "outrasDespesas"      numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "valorDesconto"       numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "valorTotal"          numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "placaVeiculo"        varchar(8)      NULL,
    "observacoes"         text            NULL,
    "situacao"            varchar(20)     DEFAULT 'PENDENTE' NOT NULL,
    "dataCadastro"        timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_notas_saida_pkey PRIMARY KEY ("numero", "modelo", "serie", "clienteId"),
    CONSTRAINT tb_notas_saida_situacao_check
        CHECK ("situacao" IN ('PENDENTE','CONFIRMADA','CANCELADA')),
    CONSTRAINT tb_notas_saida_tipoFrete_check
        CHECK ("tipoFrete" IN ('CIF','FOB','SEM')),
    CONSTRAINT check_data_saida
        CHECK ("dataSaida" IS NULL OR "dataSaida" >= "dataEmissao"),
    CONSTRAINT tb_notas_saida_valorProdutos_check       CHECK ("valorProdutos"   >= 0),
    CONSTRAINT tb_notas_saida_valorFrete_check          CHECK ("valorFrete"      >= 0),
    CONSTRAINT tb_notas_saida_valorSeguro_check         CHECK ("valorSeguro"     >= 0),
    CONSTRAINT tb_notas_saida_outrasDespesas_check      CHECK ("outrasDespesas"  >= 0),
    CONSTRAINT tb_notas_saida_valorDesconto_check       CHECK ("valorDesconto"   >= 0),
    CONSTRAINT tb_notas_saida_valorTotal_check          CHECK ("valorTotal"      >= 0),
    CONSTRAINT tb_notas_saida_clienteId_fkey
        FOREIGN KEY ("clienteId") REFERENCES public.tb_clientes("id"),
    CONSTRAINT tb_notas_saida_condicaoPagamentoId_fkey
        FOREIGN KEY ("condicaoPagamentoId") REFERENCES public.tb_condicoes_pagamento("id"),
    CONSTRAINT tb_notas_saida_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id"),
    CONSTRAINT tb_notas_saida_transportadoraId_fkey
        FOREIGN KEY ("transportadoraId") REFERENCES public.tb_transportadoras("id")
);
CREATE TRIGGER trg_notas_saida_alt BEFORE UPDATE ON public.tb_notas_saida
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_produtos_nota_saida (
    "notaNumero"         varchar(20)     NOT NULL,
    "notaModelo"         varchar(2)      NOT NULL,
    "notaSerie"          varchar(3)      NOT NULL,
    "clienteId"          int4            NOT NULL,
    "produtoId"          int4            NOT NULL,
    "sequencia"          int2            NOT NULL,
    "quantidade"         numeric(15,4)   NOT NULL,
    "valorUnitario"      numeric(15,4)   NOT NULL,
    "valorDesconto"      numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "percentualDesconto" numeric(5,2)    DEFAULT 0.00 NOT NULL,
    "valorTotal"         numeric(15,4)   NOT NULL,
    "rateioFrete"        numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "rateioSeguro"       numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "rateioOutras"       numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "custoPrecoFinal"    numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "dataCadastro"       timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_produtos_nota_saida_pkey
        PRIMARY KEY ("notaNumero", "notaModelo", "notaSerie", "clienteId", "produtoId", "sequencia"),
    CONSTRAINT tb_produtos_nota_saida_quantidade_check      CHECK ("quantidade" > 0),
    CONSTRAINT tb_produtos_nota_saida_valorUnitario_check   CHECK ("valorUnitario" >= 0),
    CONSTRAINT tb_produtos_nota_saida_valorDesconto_check   CHECK ("valorDesconto" >= 0),
    CONSTRAINT tb_produtos_nota_saida_percentualDesconto_check
        CHECK ("percentualDesconto" >= 0 AND "percentualDesconto" <= 100),
    CONSTRAINT tb_produtos_nota_saida_nota_fkey
        FOREIGN KEY ("notaNumero", "notaModelo", "notaSerie", "clienteId")
        REFERENCES public.tb_notas_saida("numero", "modelo", "serie", "clienteId") ON DELETE CASCADE,
    CONSTRAINT tb_produtos_nota_saida_produtoId_fkey
        FOREIGN KEY ("produtoId") REFERENCES public.tb_produtos("id")
);
CREATE TRIGGER trg_produtos_nota_saida_alt BEFORE UPDATE ON public.tb_produtos_nota_saida
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_produtos_nota_entrada (
    "notaNumero"         varchar(20)     NOT NULL,
    "notaModelo"         varchar(2)      NOT NULL,
    "notaSerie"          varchar(3)      NOT NULL,
    "fornecedorId"       int4            NOT NULL,
    "produtoId"          int4            NOT NULL,
    "sequencia"          int2            DEFAULT 1 NOT NULL,
    "quantidade"         numeric(15,4)   NOT NULL,
    "valorUnitario"      numeric(18,6)   NOT NULL,
    "valorDesconto"      numeric(15,4)   DEFAULT 0.0000 NOT NULL,
    "percentualDesconto" numeric(18,6)   DEFAULT 0.00 NOT NULL,
    "valorTotal"         numeric(15,4)   NOT NULL,
    "rateioFrete"        numeric(18,6)   DEFAULT 0.0000 NOT NULL,
    "rateioSeguro"       numeric(18,6)   DEFAULT 0.0000 NOT NULL,
    "rateioOutras"       numeric(18,6)   DEFAULT 0.0000 NOT NULL,
    "custoPrecoFinal"    numeric(18,6)   NULL,
    "dataCadastro"       timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_produtos_nota_entrada_pkey
        PRIMARY KEY ("notaNumero", "notaModelo", "notaSerie", "fornecedorId", "produtoId", "sequencia"),
    CONSTRAINT tb_produtos_nota_entrada_quantidade_check      CHECK ("quantidade" > 0),
    CONSTRAINT tb_produtos_nota_entrada_sequencia_check       CHECK ("sequencia" > 0),
    CONSTRAINT tb_produtos_nota_entrada_valorTotal_check      CHECK ("valorTotal" >= 0),
    CONSTRAINT tb_produtos_nota_entrada_valorUnitario_check   CHECK ("valorUnitario" >= 0),
    CONSTRAINT tb_produtos_nota_entrada_valorDesconto_check   CHECK ("valorDesconto" >= 0),
    CONSTRAINT tb_produtos_nota_entrada_percentualDesconto_check
        CHECK ("percentualDesconto" >= 0 AND "percentualDesconto" <= 100),
    CONSTRAINT tb_produtos_nota_entrada_nota_fkey
        FOREIGN KEY ("notaNumero", "notaModelo", "notaSerie", "fornecedorId")
        REFERENCES public.tb_notas_entrada("numero", "modelo", "serie", "fornecedorId") ON DELETE CASCADE,
    CONSTRAINT tb_produtos_nota_entrada_produtoId_fkey
        FOREIGN KEY ("produtoId") REFERENCES public.tb_produtos("id")
);
CREATE TRIGGER trg_produtos_nota_entrada_alt BEFORE UPDATE ON public.tb_produtos_nota_entrada
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_nfe (
    "id"                  bigserial       NOT NULL,
    "numero"              varchar(50)     NOT NULL,
    "serie"               varchar(3)      NOT NULL,
    "chaveAcesso"         varchar(44)     NULL,
    "dataEmissao"         timestamptz     NOT NULL,
    "clienteId"           int4            NOT NULL,
    "formaPagamentoId"    int2            NOT NULL,
    "condicaoPagamentoId" int2            NOT NULL,
    "transportadoraId"    int4            NULL,
    "veiculoId"           int4            NULL,
    "modalidadeId"        int2            NOT NULL,
    "valorTotal"          numeric(10,2)   NOT NULL,
    "cancelada"           bool            DEFAULT false NOT NULL,
    "dataCadastro"        timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"       timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
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
CREATE TRIGGER trg_nfe_alt BEFORE UPDATE ON public.tb_nfe
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_itens_nfe (
    "id"            bigserial       NOT NULL,
    "nfeId"         int8            NOT NULL,
    "produtoId"     int4            NOT NULL,
    "quantidade"    numeric(10,3)   NOT NULL,
    "valorUnitario" numeric(10,2)   NOT NULL,
    "valorTotal"    numeric(10,2)   NOT NULL,
    "dataCadastro"  timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao" timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_itens_nfe_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_itens_nfe_nfeId_fkey
        FOREIGN KEY ("nfeId") REFERENCES public.tb_nfe("id") ON DELETE CASCADE,
    CONSTRAINT tb_itens_nfe_produtoId_fkey
        FOREIGN KEY ("produtoId") REFERENCES public.tb_produtos("id")
);
CREATE TRIGGER trg_itens_nfe_alt BEFORE UPDATE ON public.tb_itens_nfe
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_movimentacoes_nfe (
    "id"               bigserial       NOT NULL,
    "nfeId"            int8            NOT NULL,
    "dataMovimentacao" timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "status"           varchar(30)     NOT NULL,
    "descricao"        text            NULL,
    "dataCadastro"     timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_movimentacoes_nfe_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_movimentacoes_nfe_nfeId_fkey
        FOREIGN KEY ("nfeId") REFERENCES public.tb_nfe("id") ON DELETE CASCADE
);
CREATE TRIGGER trg_movimentacoes_nfe_alt BEFORE UPDATE ON public.tb_movimentacoes_nfe
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

-- =============================================================
-- FINANCEIRO
-- =============================================================

-- public.tb_contas_receber
CREATE TABLE public.tb_contas_receber (
    "id"               bigserial       NOT NULL,
    "notaNumero"       varchar(20)     NOT NULL,
    "notaModelo"       varchar(2)      NOT NULL,
    "notaSerie"        varchar(3)      NOT NULL,
    "clienteId"        int4            NOT NULL,
    "formaPagamentoId" int2            NOT NULL,
    "numeroParcela"    int2            NOT NULL,
    "totalParcelas"    int2            NOT NULL,
    "valorOriginal"    numeric(15,2)   NOT NULL,
    "valorRecebido"    numeric(15,2)   DEFAULT 0.00 NOT NULL,
    "valorDesconto"    numeric(15,2)   DEFAULT 0.00 NOT NULL,
    "valorJuros"       numeric(15,2)   DEFAULT 0.00 NOT NULL,
    "valorMulta"       numeric(15,2)   DEFAULT 0.00 NOT NULL,
    "valorTotal"       numeric(15,2)   NOT NULL,
    "dataEmissao"      date            NOT NULL,
    "dataVencimento"   date            NOT NULL,
    "dataRecebimento"  date            NULL,
    "situacao"         varchar(20)     DEFAULT 'PENDENTE' NOT NULL,
    "observacoes"      text            NULL,
    "dataCadastro"     timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"    timestamptz     DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT tb_contas_receber_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_contas_receber_situacao_check
        CHECK ("situacao" IN ('PENDENTE','RECEBIDO','PARCIAL','CANCELADO')),
    CONSTRAINT tb_contas_receber_clienteId_fkey
        FOREIGN KEY ("clienteId") REFERENCES public.tb_clientes("id"),
    CONSTRAINT tb_contas_receber_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id")
);
CREATE INDEX idx_contas_receber_venc ON public.tb_contas_receber USING btree ("dataVencimento");
CREATE TRIGGER trg_contas_receber_alt BEFORE UPDATE ON public.tb_contas_receber
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_contas_pagar (
    "id"                 bigserial     NOT NULL,
    "origem"             varchar(10)   DEFAULT 'NOTA' NOT NULL,
    "notaNumero"         varchar(20)   NULL,
    "notaModelo"         varchar(2)    NULL,
    "notaSerie"          varchar(3)    NULL,
    "fornecedorId"       int4          NOT NULL,
    "descricao"          varchar(150)  NULL,
    "formaPagamentoId"   int2          NOT NULL,
    "numeroParcela"      int2          DEFAULT 1 NOT NULL,
    "totalParcelas"      int2          DEFAULT 1 NOT NULL,
    "valorOriginal"      numeric(15,2) NOT NULL,
    "percentualJuros"    numeric(5,2)  DEFAULT 0.00 NOT NULL,
    "percentualMulta"    numeric(5,2)  DEFAULT 0.00 NOT NULL,
    "percentualDesconto" numeric(5,2)  DEFAULT 0.00 NOT NULL,
    "dataEmissao"        date          NOT NULL,
    "dataVencimento"     date          NOT NULL,
    "dataQuitacao"       date          NULL,
    "situacao"           varchar(20)   DEFAULT 'PENDENTE' NOT NULL,
    "dataCancelamento"   timestamptz   NULL,
    "motivoCancelamento" varchar(150)  NULL,
    "observacoes"        text          NULL,
    "dataCadastro"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4          NULL,
    "usuarioAlteracaoId" int4          NULL,
    CONSTRAINT tb_contas_pagar_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_contas_pagar_origem_check
        CHECK ("origem" IN ('NOTA','AVULSA')),
    -- título de nota precisa da chave completa da nota; avulso não tem nota e precisa de descrição
    CONSTRAINT tb_contas_pagar_origem_dados_check CHECK (
        ("origem" = 'NOTA'   AND "notaNumero" IS NOT NULL AND "notaModelo" IS NOT NULL AND "notaSerie" IS NOT NULL)
     OR ("origem" = 'AVULSA' AND "notaNumero" IS NULL AND "notaModelo" IS NULL AND "notaSerie" IS NULL
                             AND "descricao" IS NOT NULL)
    ),
    CONSTRAINT tb_contas_pagar_situacao_check
        CHECK ("situacao" IN ('PENDENTE','PARCIAL','PAGO','CANCELADO')),
    -- data de quitação só existe (e sempre existe) quando o título está PAGO
    CONSTRAINT tb_contas_pagar_quitacao_check
        CHECK (("situacao" = 'PAGO') = ("dataQuitacao" IS NOT NULL)),
    -- cancelamento sempre registra quando e por quê
    CONSTRAINT tb_contas_pagar_cancelamento_check
        CHECK (("situacao" = 'CANCELADO') = ("dataCancelamento" IS NOT NULL AND "motivoCancelamento" IS NOT NULL)),
    CONSTRAINT tb_contas_pagar_parcela_check
        CHECK ("numeroParcela" >= 1 AND "numeroParcela" <= "totalParcelas"),
    CONSTRAINT tb_contas_pagar_valorOriginal_check      CHECK ("valorOriginal" > 0),
    CONSTRAINT tb_contas_pagar_percentualJuros_check    CHECK ("percentualJuros"    >= 0 AND "percentualJuros"    <= 100),
    CONSTRAINT tb_contas_pagar_percentualMulta_check    CHECK ("percentualMulta"    >= 0 AND "percentualMulta"    <= 100),
    CONSTRAINT tb_contas_pagar_percentualDesconto_check CHECK ("percentualDesconto" >= 0 AND "percentualDesconto" <= 100),
    CONSTRAINT tb_contas_pagar_datas_check
        CHECK ("dataVencimento" >= "dataEmissao" AND ("dataQuitacao" IS NULL OR "dataQuitacao" >= "dataEmissao")),
    -- FK composta: só é verificada quando as colunas da nota estão preenchidas (títulos de NOTA)
    CONSTRAINT tb_contas_pagar_nota_fkey
        FOREIGN KEY ("notaNumero", "notaModelo", "notaSerie", "fornecedorId")
        REFERENCES public.tb_notas_entrada("numero", "modelo", "serie", "fornecedorId"),
    CONSTRAINT tb_contas_pagar_fornecedorId_fkey
        FOREIGN KEY ("fornecedorId") REFERENCES public.tb_fornecedores("id"),
    CONSTRAINT tb_contas_pagar_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id")
);
-- uma linha por parcela de cada nota (o índice parcial ignora os títulos avulsos)
CREATE UNIQUE INDEX idx_contas_pagar_nota_parcela
    ON public.tb_contas_pagar ("notaNumero", "notaModelo", "notaSerie", "fornecedorId", "numeroParcela")
    WHERE "origem" = 'NOTA';
CREATE INDEX idx_contas_pagar_venc ON public.tb_contas_pagar USING btree ("dataVencimento");
CREATE INDEX idx_contas_pagar_fornecedor ON public.tb_contas_pagar USING btree ("fornecedorId");
CREATE INDEX idx_contas_pagar_situacao ON public.tb_contas_pagar USING btree ("situacao");
CREATE TRIGGER trg_contas_pagar_alt BEFORE UPDATE ON public.tb_contas_pagar
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

CREATE TABLE public.tb_pagamentos_contas_pagar (
    "id"                 bigserial     NOT NULL,
    "contaPagarId"       int8          NOT NULL,
    "formaPagamentoId"   int2          NOT NULL,
    "dataPagamento"      date          NOT NULL,
    "valorPrincipal"     numeric(15,2) NOT NULL,
    "valorJuros"         numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorMulta"         numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorDesconto"      numeric(15,2) DEFAULT 0.00 NOT NULL,
    "valorPago"          numeric(15,2) NOT NULL,
    "situacao"           varchar(20)   DEFAULT 'ATIVO' NOT NULL,
    "dataEstorno"        timestamptz   NULL,
    "motivoEstorno"      varchar(150)  NULL,
    "observacoes"        text          NULL,
    "dataCadastro"       timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataAlteracao"      timestamptz   DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioCadastroId"  int4          NULL,
    "usuarioAlteracaoId" int4          NULL,
    CONSTRAINT tb_pagamentos_contas_pagar_pkey PRIMARY KEY ("id"),
    CONSTRAINT tb_pagamentos_contas_pagar_situacao_check
        CHECK ("situacao" IN ('ATIVO','ESTORNADO')),
    CONSTRAINT tb_pagamentos_contas_pagar_estorno_check
        CHECK (("situacao" = 'ESTORNADO') = ("dataEstorno" IS NOT NULL AND "motivoEstorno" IS NOT NULL)),
    CONSTRAINT tb_pagamentos_contas_pagar_valores_check
        CHECK ("valorPrincipal" >= 0 AND "valorJuros" >= 0 AND "valorMulta" >= 0
               AND "valorDesconto" >= 0 AND "valorDesconto" <= "valorPrincipal"),
    CONSTRAINT tb_pagamentos_contas_pagar_valorPago_check
        CHECK ("valorPago" > 0 AND "valorPago" = "valorPrincipal" + "valorJuros" + "valorMulta" - "valorDesconto"),
    CONSTRAINT tb_pagamentos_contas_pagar_contaPagarId_fkey
        FOREIGN KEY ("contaPagarId") REFERENCES public.tb_contas_pagar("id"),
    CONSTRAINT tb_pagamentos_contas_pagar_formaPagamentoId_fkey
        FOREIGN KEY ("formaPagamentoId") REFERENCES public.tb_formas_pagamento("id")
);
CREATE INDEX idx_pagamentos_contas_pagar_conta ON public.tb_pagamentos_contas_pagar USING btree ("contaPagarId");
CREATE TRIGGER trg_pagamentos_contas_pagar_alt BEFORE UPDATE ON public.tb_pagamentos_contas_pagar
    FOR EACH ROW EXECUTE FUNCTION fn_atualiza_data_alteracao();

-- public.vw_contas_pagar
-- Título + totais dos pagamentos ATIVOS (estornados não contam) + saldo. Fonte única dos totais:
-- a listagem e a tela de pagamento leem daqui, nada de total duplicado gravado no título.
CREATE VIEW public.vw_contas_pagar AS
SELECT
    cp.*,
    COALESCE(pg."valorPrincipalPago", 0)                    AS "valorPrincipalPago",
    COALESCE(pg."valorJurosPago", 0)                        AS "valorJurosPago",
    COALESCE(pg."valorMultaPaga", 0)                        AS "valorMultaPaga",
    COALESCE(pg."valorDescontoObtido", 0)                   AS "valorDescontoObtido",
    COALESCE(pg."valorTotalPago", 0)                        AS "valorTotalPago",
    cp."valorOriginal" - COALESCE(pg."valorPrincipalPago", 0) AS "saldo",
    pg."dataUltimoPagamento"
FROM public.tb_contas_pagar cp
LEFT JOIN (
    SELECT
        "contaPagarId",
        SUM("valorPrincipal") AS "valorPrincipalPago",
        SUM("valorJuros")     AS "valorJurosPago",
        SUM("valorMulta")     AS "valorMultaPaga",
        SUM("valorDesconto")  AS "valorDescontoObtido",
        SUM("valorPago")      AS "valorTotalPago",
        MAX("dataPagamento")  AS "dataUltimoPagamento"
    FROM public.tb_pagamentos_contas_pagar
    WHERE "situacao" = 'ATIVO'
    GROUP BY "contaPagarId"
) pg ON pg."contaPagarId" = cp.id;

















-- ============================================================
-- PERFIS DE USUÁRIO
-- ============================================================
INSERT INTO public.tb_perfis ("perfil", "descricao", "ativo", "usuarioCadastroId", "usuarioAlteracaoId") VALUES
('Administrador',      'Acesso total e irrestrito ao sistema ERP',          true, NULL, NULL),
('Gerente',            'Gestão de equipes, relatórios e aprovações',        true, NULL, NULL),
('Financeiro/Compras', 'Controle de contas a pagar/receber e suprimentos',  true, NULL, NULL),
('Vendedor',           'Acesso a clientes, orçamentos e emissão de vendas', true, NULL, NULL);




-- =============================================================
-- SEED — Dados mockup
-- Ordem respeita dependências de FK
-- =============================================================


-- ============================================================
-- PAÍSES
-- ============================================================
INSERT INTO public.tb_paises ("pais","codigo","sigla","moeda","nacionalidade","ativo") VALUES
('Brasil',       '55',  'BRA', 'BRL', 'Brasileiro',  true),
('Argentina',    '54',  'ARG', 'ARS', 'Argentino',   true),
('Estados Unidos','1',  'USA', 'USD', 'Americano',   true),
('Alemanha',     '49',  'DEU', 'EUR', 'Alemão',      true),
('China',        '86',  'CHN', 'CNY', 'Chinês',      true);


-- ============================================================
-- ESTADOS
-- ============================================================
INSERT INTO public.tb_estados ("estado","uf","paisId","ativo") VALUES
('Paraná',              'PR', 1, true),
('São Paulo',           'SP', 1, true),
('Santa Catarina',      'SC', 1, true),
('Rio Grande do Sul',   'RS', 1, true),
('Minas Gerais',        'MG', 1, true),
('Rio de Janeiro',      'RJ', 1, true),
('Mato Grosso do Sul',  'MS', 1, true),
('Goiás',               'GO', 1, true);


-- ============================================================
-- CIDADES
-- ============================================================
INSERT INTO public.tb_cidades ("cidade","codigoIbge","estadoId","ativo") VALUES
-- Paraná (estadoId=1)
('Marechal Cândido Rondon', '4114609', 1, true),
('Cascavel',                '4104808', 1, true),
('Toledo',                  '4127700', 1, true),
('Foz do Iguaçu',           '4108304', 1, true),
('Londrina',                '4113700', 1, true),
('Curitiba',                '4106902', 1, true),
('Maringá',                 '4115200', 1, true),
-- São Paulo (estadoId=2)
('São Paulo',               '3550308', 2, true),
('Campinas',                '3509502', 2, true),
('Ribeirão Preto',          '3543402', 2, true),
-- Santa Catarina (estadoId=3)
('Florianópolis',           '4205407', 3, true),
('Joinville',               '4209102', 3, true),
-- Rio Grande do Sul (estadoId=4)
('Porto Alegre',            '4314902', 4, true),
('Caxias do Sul',           '4305108', 4, true),
-- Minas Gerais (estadoId=5)
('Belo Horizonte',          '3106200', 5, true),
-- Rio de Janeiro (estadoId=6)
('Rio de Janeiro',          '3304557', 6, true);


-- ============================================================
-- FORMAS DE PAGAMENTO
-- ============================================================
INSERT INTO public.tb_formas_pagamento ("formaPagamento","descricao","ativo",
    "usuarioCadastroId","usuarioAlteracaoId") VALUES
('Dinheiro',        'Pagamento em espécie',                              true, NULL, NULL),
('Boleto Bancário', 'Boleto com vencimento conforme condição',           true, NULL, NULL),
('Cartão de Débito','Pagamento via cartão de débito no ato',             true, NULL, NULL),
('Cartão de Crédito','Pagamento via cartão de crédito',                  true, NULL, NULL),
('PIX',             'Pagamento instantâneo via PIX',                     true, NULL, NULL),
('Transferência',   'TED ou DOC bancário',                               true, NULL, NULL),
('Cheque',          'Pagamento por cheque pré-datado ou à vista',        true, NULL, NULL);


-- ============================================================
-- CONDIÇÕES DE PAGAMENTO
-- ============================================================
INSERT INTO public.tb_condicoes_pagamento (
    "condicaoPagamento","numeroParcelas","diasPrimeiraParcela",
    "percentualJuros","percentualMulta","percentualDesconto","ativo") VALUES
('À Vista',         1,  0,  0.00, 0.00, 5.00, true),
('30 Dias',         1, 30,  0.00, 2.00, 0.00, true),
('30/60',           2, 30,  0.00, 2.00, 0.00, true),
('30/60/90',        3, 30,  0.00, 2.00, 0.00, true),
('30/60/90/120',    4, 30,  1.00, 2.00, 0.00, true),
('60 Dias',         1, 60,  1.50, 2.00, 0.00, true),
('Entrada + 30',    2,  0,  0.00, 2.00, 0.00, true),
('5x Sem Juros',    5, 30,  0.00, 2.00, 0.00, true);


-- ============================================================
-- PARCELAS DAS CONDIÇÕES DE PAGAMENTO
-- ============================================================

-- À Vista (condicaoPagamentoId=1): 1 parcela, 100%
INSERT INTO public.tb_parcelas_condicao_pagamento
    ("condicaoPagamentoId","numero","dias","percentual","formaPagamentoId") VALUES
(1, 1,  0, 100.00, 5); -- PIX

-- 30 Dias (condicaoPagamentoId=2): 1 parcela
INSERT INTO public.tb_parcelas_condicao_pagamento
    ("condicaoPagamentoId","numero","dias","percentual","formaPagamentoId") VALUES
(2, 1, 30, 100.00, 2); -- Boleto

-- 30/60 (condicaoPagamentoId=3): 2 parcelas de 50%
INSERT INTO public.tb_parcelas_condicao_pagamento
    ("condicaoPagamentoId","numero","dias","percentual","formaPagamentoId") VALUES
(3, 1, 30, 50.00, 2),
(3, 2, 60, 50.00, 2);

-- 30/60/90 (condicaoPagamentoId=4): 3 parcelas de ~33.33%
INSERT INTO public.tb_parcelas_condicao_pagamento
    ("condicaoPagamentoId","numero","dias","percentual","formaPagamentoId") VALUES
(4, 1,  30, 33.34, 2),
(4, 2,  60, 33.33, 2),
(4, 3,  90, 33.33, 2);

-- 30/60/90/120 (condicaoPagamentoId=5): 4 parcelas de 25%
INSERT INTO public.tb_parcelas_condicao_pagamento
    ("condicaoPagamentoId","numero","dias","percentual","formaPagamentoId") VALUES
(5, 1,  30, 25.00, 2),
(5, 2,  60, 25.00, 2),
(5, 3,  90, 25.00, 2),
(5, 4, 120, 25.00, 2);

-- 60 Dias (condicaoPagamentoId=6)
INSERT INTO public.tb_parcelas_condicao_pagamento
    ("condicaoPagamentoId","numero","dias","percentual","formaPagamentoId") VALUES
(6, 1, 60, 100.00, 2);

-- Entrada + 30 (condicaoPagamentoId=7): entrada à vista + restante em 30 dias
INSERT INTO public.tb_parcelas_condicao_pagamento
    ("condicaoPagamentoId","numero","dias","percentual","formaPagamentoId") VALUES
(7, 1,  0, 50.00, 5), -- entrada PIX
(7, 2, 30, 50.00, 2); -- restante boleto

-- 5x Sem Juros (condicaoPagamentoId=8): 5 parcelas de 20%
INSERT INTO public.tb_parcelas_condicao_pagamento
    ("condicaoPagamentoId","numero","dias","percentual","formaPagamentoId") VALUES
(8, 1,  30, 20.00, 4),
(8, 2,  60, 20.00, 4),
(8, 3,  90, 20.00, 4),
(8, 4, 120, 20.00, 4),
(8, 5, 150, 20.00, 4);


-- ============================================================
-- VEÍCULOS
-- ============================================================
INSERT INTO public.tb_veiculos ("placa","modelo","marca","ano","capacidade","ativo",
    "usuarioCadastroId","usuarioAlteracaoId") VALUES
('ABC1D23', 'Sprinter 415',   'Mercedes-Benz', 2021, 1500.00, true, NULL, NULL),
('DEF2E34', 'Daily 70-170',   'Iveco',         2020, 7000.00, true, NULL, NULL),
('GHI3F45', 'Accelo 815',     'Mercedes-Benz', 2019, 8000.00, true, NULL, NULL),
('JKL4G56', 'Cargo 816',      'Ford',          2022, 8500.00, true, NULL, NULL),
('MNO5H67', 'NMR 71L',        'Isuzu',         2021, 7100.00, true, NULL, NULL),
('PQR6I78', 'VM 270',         'Volkswagen',    2023, 9000.00, true, NULL, NULL),
('STU7J89', 'Atego 1726',     'Mercedes-Benz', 2020, 16000.00,true, NULL, NULL);


-- ============================================================
-- TRANSPORTADORAS
-- ============================================================
-- INSERT INTO public.tb_transportadora_telefone
--     ("transportadoraId","telefone","tipo","principal","ativo",
--      "usuarioCadastroId","usuarioAlteracaoId") VALUES
-- (1, '(45) 3284-1100', 'COMERCIAL',  true,  true, NULL, NULL),
-- (1, '(45) 3284-1199', 'FINANCEIRO', false, true, NULL, NULL),
-- (2, '(45) 3321-4400', 'COMERCIAL',  true,  true, NULL, NULL),
-- (3, '(45) 3055-7700', 'COMERCIAL',  true,  true, NULL, NULL),
-- (4, '(45) 3523-8800', 'COMERCIAL',  true,  true, NULL, NULL),
-- (5, '(43) 3322-5500', 'COMERCIAL',  true,  true, NULL, NULL),
-- (5, '(43) 99988-5501','COMERCIAL',  false, true, NULL, NULL);


-- ============================================================
-- EMAILS DE TRANSPORTADORAS
-- ============================================================
-- INSERT INTO public.tb_transportadora_email
--     ("transportadoraId","email","tipo","principal","ativo",
--      "usuarioCadastroId","usuarioAlteracaoId") VALUES
-- (1, 'comercial@rapidooeste.com.br',  'COMERCIAL',  true,  true, NULL, NULL),
-- (1, 'financeiro@rapidooeste.com.br', 'FINANCEIRO', false, true, NULL, NULL),
-- (2, 'contato@transsul.com.br',       'COMERCIAL',  true,  true, NULL, NULL),
-- (2, 'fiscal@transsul.com.br',        'FISCAL',     false, true, NULL, NULL),
-- (3, 'velozlog@gmail.com',            'COMERCIAL',  true,  true, NULL, NULL),
-- (4, 'fronteira@transportes.com.br',  'COMERCIAL',  true,  true, NULL, NULL),
-- (5, 'contato@nortesul.com.br',       'COMERCIAL',  true,  true, NULL, NULL),
-- (5, 'financeiro@nortesul.com.br',    'FINANCEIRO', false, true, NULL, NULL);


-- ============================================================
-- TELEFONES DE TRANSPORTADORAS
-- ============================================================
-- INSERT INTO public.tb_transportadora_telefone
--     ("transportadoraId","telefone","tipo","principal","ativo",
--      "usuarioCadastroId","usuarioAlteracaoId") VALUES
-- (1, '(45) 3284-1100', 'COMERCIAL',  true,  true, NULL, NULL),
-- (1, '(45) 3284-1199', 'FINANCEIRO', false, true, NULL, NULL),
-- (2, '(45) 3321-4400', 'COMERCIAL',  true,  true, NULL, NULL),
-- (3, '(45) 3055-7700', 'COMERCIAL',  true,  true, NULL, NULL),
-- (4, '(45) 3523-8800', 'COMERCIAL',  true,  true, NULL, NULL),
-- (5, '(43) 3322-5500', 'COMERCIAL',  true,  true, NULL, NULL),
-- (5, '(43) 99988-5501','CELULAR',    false, true, NULL, NULL);


-- ============================================================
-- TRANSPORTADORA × VEÍCULO
-- ============================================================
-- INSERT INTO public.tb_transportadora_veiculo ("transportadoraId","veiculoId") VALUES
-- (1, 1), (1, 2),
-- (2, 3), (2, 4),
-- (3, 5),
-- (4, 6),
-- (5, 7);


-- ============================================================
-- ITENS DE TRANSPORTADORAS
-- ============================================================
-- INSERT INTO public.tb_transportadora_itens
--     ("codigo","descricao","transportadoraId","codigoTransp","ativo") VALUES
-- ('FRETE-001', 'Frete fracionado',     1, 'RO-FF01', true),
-- ('FRETE-002', 'Frete dedicado',       1, 'RO-FD02', true),
-- ('FRETE-001', 'Frete fracionado',     2, 'TS-FR01', true),
-- ('SEGURO-001','Seguro de carga',      2, 'TS-SG01', true),
-- ('FRETE-001', 'Frete normal',         3, 'VL-FN01', true),
-- ('FRETE-001', 'Frete padrão',         4, 'FR-FP01', true),
-- ('FRETE-001', 'Frete nacional',       5, 'NS-FN01', true),
-- ('FRETE-002', 'Frete expresso',       5, 'NS-FE02', true);


-- ============================================================
-- CATEGORIAS
-- ============================================================
INSERT INTO public.tb_categorias ("categoria","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
('Eletrônicos',       true, NULL, NULL),
('Ferramentas',       true, NULL, NULL),
('Materiais Elétricos',true,NULL, NULL),
('Hidráulica',        true, NULL, NULL),
('Informática',       true, NULL, NULL),
('Automação',         true, NULL, NULL),
('Iluminação',        true, NULL, NULL),
('Segurança',         true, NULL, NULL);


-- ============================================================
-- MARCAS
-- ============================================================
INSERT INTO public.tb_marcas ("marca","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
('Bosch',       true, NULL, NULL),
('Siemens',     true, NULL, NULL),
('WEG',         true, NULL, NULL),
('Schneider',   true, NULL, NULL),
('Intelbras',   true, NULL, NULL),
('Samsung',     true, NULL, NULL),
('Dell',        true, NULL, NULL),
('Philips',     true, NULL, NULL),
('3M',          true, NULL, NULL),
('Tramontina',  true, NULL, NULL);


-- ============================================================
-- UNIDADES DE MEDIDA
-- ============================================================
INSERT INTO public.tb_unidades_medida ("unidadeMedida","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
('UN',    true, NULL, NULL),
('CX',    true, NULL, NULL),
('KG',    true, NULL, NULL),
('MT',    true, NULL, NULL),
('LT',    true, NULL, NULL),
('PC',    true, NULL, NULL),
('RL',    true, NULL, NULL),
('PR',    true, NULL, NULL);


-- ============================================================
-- PRODUTOS
-- ============================================================
INSERT INTO public.tb_produtos (
    "produto","codigoBarras","referencia","marcaId","unidadeMedidaId","categoriaId",
    "valorCompra","valorVenda","quantidade","quantidadeMinima","percentualLucro",
    "descricao","observacoes","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
('Disjuntor 16A Bipolar',    '7891234560001', 'SCH-DJ16B',   4, 1, 3,  18.50,  32.90,  150,  20, 77.84, 'Disjuntor bipolar 16A curva C',     NULL, true, NULL, NULL),
('Disjuntor 32A Tripolar',   '7891234560002', 'SCH-DJ32T',   4, 1, 3,  35.00,  62.00,   80,  10, 77.14, 'Disjuntor tripolar 32A curva C',    NULL, true, NULL, NULL),
('Cabo Flexível 2,5mm 100mt','7891234560003', 'WEG-CF25',    3, 7, 3,  89.00, 149.90,   40,   5, 68.43, 'Cabo flexível 2,5mm rolo 100 metros',NULL,true, NULL, NULL),
('Cabo Flexível 4mm 100mt',  '7891234560004', 'WEG-CF40',    3, 7, 3, 145.00, 239.90,   25,   5, 65.45, 'Cabo flexível 4mm rolo 100 metros', NULL, true, NULL, NULL),
('Tomada 2P+T Branca',       '7891234560005', 'SCH-TOM3',    4, 1, 3,   4.20,   8.90,  300,  50, 111.90,'Tomada 20A 2P+T branca',            NULL, true, NULL, NULL),
('Interruptor Simples',      '7891234560006', 'SCH-INT1',    4, 1, 3,   3.10,   6.50,  250,  50, 109.68,'Interruptor simples 10A',           NULL, true, NULL, NULL),
('Motor Elétrico 1CV',       '7891234560007', 'WEG-MOT1CV',  3, 1, 6, 480.00, 820.00,   15,   3, 70.83, 'Motor elétrico trifásico 1CV 4 polos',NULL,true,NULL, NULL),
('Motor Elétrico 2CV',       '7891234560008', 'WEG-MOT2CV',  3, 1, 6, 720.00,1190.00,   10,   2, 65.28, 'Motor elétrico trifásico 2CV 4 polos',NULL,true,NULL, NULL),
('Furadeira 3/8 600W',       '7891234560009', 'BSH-FUR38',   1, 1, 2, 210.00, 359.90,   30,   5, 71.38, 'Furadeira de impacto 600W 3/8"',   NULL, true, NULL, NULL),
('Parafusadeira Bivolt',     '7891234560010', 'BSH-PAR12',   1, 1, 2, 280.00, 469.90,   20,   3, 67.82, 'Parafusadeira/furadeira 12V bivolt',NULL, true, NULL, NULL),
('Câmera IP 4MP Full Color', '7891234560011', 'ITB-CAM4MP',  5, 1, 8, 185.00, 319.90,   40,  10, 72.92, 'Câmera IP 4MP visão colorida noturna',NULL,true,NULL, NULL),
('DVR 8 Canais 1080p',       '7891234560012', 'ITB-DVR8CH',  5, 1, 8, 420.00, 699.90,   12,   3, 66.64, 'DVR stand-alone 8 canais 1080p',   NULL, true, NULL, NULL),
('Luminária LED 40W',        '7891234560013', 'PHL-LED40',   8, 1, 7,  55.00,  98.90,   60,  10, 79.82, 'Luminária LED tubular 40W 6500K',  NULL, true, NULL, NULL),
('Lâmpada LED Bulbo 9W',     '7891234560014', 'PHL-LED9',    8, 1, 7,   5.80,  12.90,  500, 100, 122.41,'Lâmpada LED bulbo 9W E27 bivolt',  NULL, true, NULL, NULL),
('Notebook Core i5 15"',      NULL,            'DEL-NBI515',  7, 1, 5,2800.00,4299.90,    8,   2, 53.57, 'Notebook Dell Core i5 8GB 256GB SSD',NULL,true,NULL,NULL),
('Monitor 24" Full HD',       NULL,            'SAM-MON24',   6, 1, 5, 780.00,1249.90,   10,   2, 60.24, 'Monitor Samsung 24" Full HD IPS',  NULL, true, NULL, NULL),
('Joelho PVC 50mm',          '7891234560017', 'HID-JLH50',  10, 1, 4,   1.20,   2.90,  400,  50, 141.67,'Joelho PVC 50mm soldável',         NULL, true, NULL, NULL),
('Tubo PVC 50mm 6mt',        '7891234560018', 'HID-TUB50',  10, 4, 4,  18.00,  32.90,  100,  20, 82.78, 'Tubo PVC esgoto 50mm 6 metros',    NULL, true, NULL, NULL);

-- Custo médio inicial = valor de compra (depois disso só muda pelas notas de entrada)
UPDATE public.tb_produtos SET "custoMedio" = "valorCompra";


-- ============================================================
-- FUNÇÕES DE FUNCIONÁRIO
-- ============================================================
INSERT INTO public.tb_funcoes_funcionario (
    "funcaoFuncionario","descricao","salarioBase","cargaHoraria","requerCnh","observacao","ativo",
    "usuarioCadastroId","usuarioAlteracaoId") VALUES
('Vendedor',            'Atendimento e vendas ao cliente',         2200.00, 44.00, false, NULL, true, NULL, NULL),
('Gerente de Vendas',   'Gestão da equipe de vendas',              5500.00, 44.00, false, NULL, true, NULL, NULL),
('Auxiliar Financeiro', 'Suporte ao setor financeiro',             2000.00, 44.00, false, NULL, true, NULL, NULL),
('Analista Financeiro', 'Gestão de contas e fluxo de caixa',       4000.00, 44.00, false, NULL, true, NULL, NULL),
('Motorista',           'Entrega e coleta de mercadorias',         2500.00, 44.00, true,  'CNH categoria D exigida', true, NULL, NULL),
('Auxiliar de Estoque', 'Controle e movimentação de estoque',      1900.00, 44.00, false, NULL, true, NULL, NULL),
('Comprador',           'Negociação e compra de produtos',         3500.00, 44.00, false, NULL, true, NULL, NULL),
('Diretor Geral',       'Gestão geral da empresa',                12000.00, 44.00, false, NULL, true, NULL, NULL);


-- ============================================================
-- FUNCIONÁRIOS
-- ============================================================
-- DADOS PRINCIPAIS DO FUNCIONÁRIO
INSERT INTO public.tb_funcionarios (
    "funcionario","apelido","cpfCnpj","rgInscricaoEstadual",
    "cep","endereco","numero","complemento","bairro","cidadeId",
    "funcaoFuncionarioId","dataNascimento","dataAdmissao","dataDemissao",
    "cnh","dataValidadeCnh","sexo","salario","tipo","observacao","ativo",
    "usuarioCadastroId","usuarioAlteracaoId") VALUES
('Carlos Eduardo Mendes',    'Carlos',   '01234567891','1234567', '85960000','Rua das Acácias',       '123',NULL,       'Centro',       1,1,'1985-03-15','2018-01-10',NULL,   NULL,  NULL,      'M',2200.00,'INTERNO',NULL,true,NULL,NULL),
('Fernanda Lima Souza',      'Fernanda', '12345678902','2345678', '85960000','Rua Tiradentes',        '450',NULL,       'Vila Alta',    1,1,'1992-07-22','2019-03-15',NULL,   NULL,  NULL,      'F',2200.00,'INTERNO',NULL,true,NULL,NULL),
('Roberto Alves Pinto',      'Roberto',  '23456789013','3456789', '85815010','Av. das Flores',        '800','Ap. 12',  'Jardim Europa',2,2,'1978-11-30','2015-06-01',NULL,   NULL,  NULL,      'M',5500.00,'INTERNO',NULL,true,NULL,NULL),
('Juliana Costa Ramos',      'Juju',     '34567890124','4567890', '85902020','Rua Independência',     '220',NULL,       'Centro',       3,3,'1990-05-18','2020-08-01',NULL,   NULL,  NULL,      'F',2000.00,'INTERNO',NULL,true,NULL,NULL),
('Marcos Henrique Dias',     'Marcos',   '45678901235','5678901', '85960000','Rua Santos Dumont',     '310',NULL,       'Novo Horizonte',1,5,'1983-09-12','2017-02-20',NULL,'12345678901','2027-02-28','M',2500.00,'INTERNO',NULL,true,NULL,NULL),
('Patrícia Oliveira Santos', 'Pati',     '56789012346','6789012', '85960000','Rua Maringá',           '90', NULL,       'Centro',       1,6,'1995-12-03','2021-04-10',NULL,   NULL,  NULL,      'F',1900.00,'INTERNO',NULL,true,NULL,NULL),
('Anderson Luís Ferreira',   'Anderson', '67890123457','7890123', '85960000','Rua 7 de Setembro',     '640',NULL,       'Vila Industrial',1,7,'1980-04-25','2016-09-05',NULL,  NULL,  NULL,      'M',3500.00,'INTERNO',NULL,true,NULL,NULL),
('Simone Aparecida Gomes',   'Simone',   '78901234568','8901234', '85960000','Rua Paraná',            '1200',NULL,      'São Francisco', 1,8,'1972-01-08','2010-05-15',NULL,  NULL,  NULL,      'F',12000.00,'INTERNO',NULL,true,NULL,NULL);

-- EMAILS DOS FUNCIONÁRIOS
INSERT INTO public.tb_funcionario_email (
    "funcionarioId","email","tipo","principal","ativo") VALUES
(1, 'carlos@empresa.com.br',   'CORPORATIVO', true, true),
(2, 'fernanda@empresa.com.br', 'CORPORATIVO', true, true),
(3, 'roberto@empresa.com.br',  'CORPORATIVO', true, true),
(4, 'juliana@empresa.com.br',  'CORPORATIVO', true, true),
(5, 'marcos@empresa.com.br',   'CORPORATIVO', true, true),
(6, 'patricia@empresa.com.br', 'CORPORATIVO', true, true),
(7, 'anderson@empresa.com.br', 'CORPORATIVO', true, true),
(8, 'simone@empresa.com.br',   'CORPORATIVO', true, true);

-- TELEFONES DOS FUNCIONÁRIOS
INSERT INTO public.tb_funcionario_telefone (
    "funcionarioId","telefone","tipo","principal","ativo") VALUES
(1, '(45) 99901-1111', 'PESSOAL', true, true),
(2, '(45) 99902-2222', 'PESSOAL', true, true),
(3, '(45) 99903-3333', 'PESSOAL', true, true),
(4, '(45) 99904-4444', 'PESSOAL', true, true),
(5, '(45) 99905-5555', 'PESSOAL', true, true),
(6, '(45) 99906-6666', 'PESSOAL', true, true),
(7, '(45) 99907-7777', 'PESSOAL', true, true),
(8, '(45) 99908-8888', 'PESSOAL', true, true);

-- ============================================================
-- CLIENTES
-- ============================================================
INSERT INTO public.tb_clientes (
    "cliente","apelido","cpfCnpj","rgInscricaoEstadual","cep","endereco","numero",
    "complemento","bairro","cidadeId","condicaoPagamentoId","limiteCredito",
    "dataNascimento","tipo","sexo","observacao","ativo",
    "usuarioCadastroId","usuarioAlteracaoId") VALUES
-- Pessoas Jurídicas
('Elétrica Rondon Ltda',          'Elétrica Rondon', '11222333000181','PR-111222333', '85960000','Rua Maringá',         '200', NULL,      'Centro',        1, 3, 30000.00, NULL,       'J', NULL, NULL, true, NULL, NULL),
('Construtora Iguaçu S/A',        'Construtora Igu', '22333444000182','PR-222333444', '85851010','Av. Brasil',          '1500','Sala 1',  'Vila Industrial',4, 4, 80000.00, NULL,       'J', NULL, NULL, true, NULL, NULL),
('Hidro Materiais Cascavel Ltda', 'Hidro Cascavel',  '33444555000183','PR-333444555', '85815010','Rua XV de Novembro',  '320', NULL,      'Centro',        2, 5, 50000.00, NULL,       'J', NULL, NULL, true, NULL, NULL),
('AutoPeças Toledo ME',           'AutoPeças Toledo','44555666000184','PR-444555666', '85900100','Rua Sete de Setembro','180', NULL,      'São João',      3, 2, 15000.00, NULL,       'J', NULL, NULL, true, NULL, NULL),
('TechPrimus Sistemas Ltda',      'TechPrimus',      '55666777000185','SP-555666777', '01310100','Av. Paulista',        '1000','Cj. 52',  'Bela Vista',    8, 7, 100000.00,NULL,       'J', NULL, NULL, true, NULL, NULL),
-- Pessoas Físicas
('João Pedro Almeida',            'João',            '98765432100',   '9876543',      '85960000','Rua das Flores',      '44',  NULL,      'Jardim Alvorada',1,1, 5000.00, '1988-06-14','F', 'M', NULL, true, NULL, NULL),
('Maria Eduarda Ferreira',        'Duda',            '87654321099',   '8765432',      '85960000','Rua Tiradentes',      '321', 'Ap. 5',  'Centro',        1, 2, 8000.00, '1995-02-28','F', 'F', NULL, true, NULL, NULL),
('Lucas Barbosa Nunes',           'Lucas',           '76543210988',   '7654321',      '85815010','Rua Paraná',          '87',  NULL,      'Nova Cascavel',  2,3, 3000.00, '2001-10-05','F', 'M', NULL, true, NULL, NULL),
('Ana Clara Rodrigues',           'Ana',             '65432109877',   '6543210',      '85902020','Av. Independência',   '560', NULL,      'Centro',        3, 1, 4000.00, '1993-08-19','F', 'F', NULL, true, NULL, NULL),
('Pedro Henrique Gomes',          'Pedro',           '54321098766',   '5432109',      '85851010','Rua XV de Novembro',  '230', NULL,      'Centro',        4, 2, 2500.00, '1979-12-30','F', 'M', NULL, true, NULL, NULL);


-- ============================================================
-- EMAILS DE CLIENTES
-- ============================================================
INSERT INTO public.tb_cliente_email
    ("clienteId","email","tipo","principal","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
(1, 'contato@eletricarondon.com.br',  'COMERCIAL',  true,  true, NULL, NULL),
(1, 'financeiro@eletricarondon.com.br','FINANCEIRO', false, true, NULL, NULL),
(2, 'contato@construtoraiguacu.com.br','COMERCIAL',  true,  true, NULL, NULL),
(2, 'fiscal@construtoraiguacu.com.br', 'FISCAL',     false, true, NULL, NULL),
(3, 'hidro@cascavel.com.br',           'COMERCIAL',  true,  true, NULL, NULL),
(4, 'autopecas@toledo.com.br',         'COMERCIAL',  true,  true, NULL, NULL),
(5, 'contato@techprimus.com.br',       'COMERCIAL',  true,  true, NULL, NULL),
(5, 'financeiro@techprimus.com.br',    'FINANCEIRO', false, true, NULL, NULL),
(6, 'joao.almeida@gmail.com',          'COMERCIAL',  true,  true, NULL, NULL),
(7, 'maria.eduarda@gmail.com',         'COMERCIAL',  true,  true, NULL, NULL),
(8, 'lucas.nunes@gmail.com',           'COMERCIAL',  true,  true, NULL, NULL),
(9, 'ana.rodrigues@gmail.com',         'COMERCIAL',  true,  true, NULL, NULL),
(10,'pedro.gomes@hotmail.com',         'COMERCIAL',  true,  true, NULL, NULL);


-- ============================================================
-- TELEFONES DE CLIENTES
-- ============================================================
INSERT INTO public.tb_cliente_telefone
    ("clienteId","telefone","tipo","principal","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
(1,  '(45) 3284-2000', 'COMERCIAL',  true,  true, NULL, NULL),
(1,  '(45) 3284-2001', 'FINANCEIRO', false, true, NULL, NULL),
(2,  '(45) 3523-3000', 'COMERCIAL',  true,  true, NULL, NULL),
(3,  '(45) 3321-4000', 'COMERCIAL',  true,  true, NULL, NULL),
(4,  '(45) 3055-5000', 'COMERCIAL',  true,  true, NULL, NULL),
(5,  '(11) 3030-6000', 'COMERCIAL',  true,  true, NULL, NULL),
(6,  '(45) 99911-1111','PESSOAL',    true,  true, NULL, NULL),
(7,  '(45) 99922-2222','PESSOAL',    true,  true, NULL, NULL),
(8,  '(45) 99933-3333','PESSOAL',    true,  true, NULL, NULL),
(9,  '(45) 99944-4444','PESSOAL',    true,  true, NULL, NULL),
(10, '(45) 99955-5555','PESSOAL',    true,  true, NULL, NULL);

-- ============================================================
-- FORNECEDORES
-- ============================================================
-- INSERT INTO public.tb_fornecedores (
--     "fornecedor","apelido","cpfCnpj","rgInscricaoEstadual","cep","endereco","numero",
--     "complemento","bairro","cidadeId","condicaoPagamentoId","transportadoraId","tipo",
--     "limiteCredito","observacoes","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
-- ('Schneider Electric Brasil Ltda',  'Schneider',    '60501445000160','SP-605014450', '04795000','Av. das Nações Unidas','17891',NULL,      'Vargem Grande', 8, 4, 2, 'J', 500000.00, NULL, true, NULL, NULL),
-- ('WEG S/A',                         'WEG',          '84429695000111','SC-844296950', '89256900','Av. Prefeito Waldemar', '299', NULL,     'Bom Retiro',   12, 5, 3, 'J', 800000.00, NULL, true, NULL, NULL),
-- ('Bosch Ferramentas Ltda',          'Bosch',        '59104862000150','SP-591048620', '04795000','Rod. Régis Bittencourt','3800',NULL,     'Jardim Santa', 8,  4, 1, 'J', 300000.00, NULL, true, NULL, NULL),
-- ('Intelbras S/A',                   'Intelbras',    '82901000000145','SC-829010000', '88050000','Rodovia SC 281',        '4600',NULL,     'Distrito Ind.',11, 3, 3, 'J', 250000.00, NULL, true, NULL, NULL),
-- ('Samsung Eletrônica da Amazônia',  'Samsung',      '24269238000128','AM-242692380', '69075351','Av. Torquato Tapajós',  '7200',NULL,     'Colônia Terra',8,  5, 2, 'J', 600000.00, NULL, true, NULL, NULL),
-- ('Distribuidora Elétrica Sul Ltda', 'Dist. Elet.',  '91234567000199','RS-912345670', '90030080','Av. Borges de Medeiros','222', 'Sala 3', 'Centro',      13, 3, 4, 'J', 150000.00, NULL, true, NULL, NULL),
-- ('Dell Computadores do Brasil Ltda','Dell',         '72381189000110','SP-723811890', '06460040','Al. Xingu',            '350', NULL,     'Alphaville',   8,  6, 1, 'J', 400000.00, NULL, true, NULL, NULL);


-- ============================================================
-- EMAILS DE FORNECEDORES
-- ============================================================
-- INSERT INTO public.tb_fornecedor_email
--     ("fornecedorId","email","tipo","principal","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
-- (1, 'comercial@schneider.com.br',  'COMERCIAL',  true,  true, NULL, NULL),
-- (1, 'financeiro@schneider.com.br', 'FINANCEIRO', false, true, NULL, NULL),
-- (2, 'vendas@weg.net',              'COMERCIAL',  true,  true, NULL, NULL),
-- (2, 'fiscal@weg.net',              'FISCAL',     false, true, NULL, NULL),
-- (3, 'vendas@bosch.com.br',         'COMERCIAL',  true,  true, NULL, NULL),
-- (4, 'comercial@intelbras.com.br',  'COMERCIAL',  true,  true, NULL, NULL),
-- (4, 'financeiro@intelbras.com.br', 'FINANCEIRO', false, true, NULL, NULL),
-- (5, 'vendas@samsung.com.br',       'COMERCIAL',  true,  true, NULL, NULL),
-- (6, 'contato@disteletsul.com.br',  'COMERCIAL',  true,  true, NULL, NULL),
-- (7, 'vendas@dell.com.br',          'COMERCIAL',  true,  true, NULL, NULL),
-- (7, 'financeiro@dell.com.br',      'FINANCEIRO', false, true, NULL, NULL);


-- ============================================================
-- TELEFONES DE FORNECEDORES
-- ============================================================
-- INSERT INTO public.tb_fornecedor_telefone
--     ("fornecedorId","telefone","tipo","principal","ativo","usuarioCadastroId","usuarioAlteracaoId") VALUES
-- (1, '(11) 3030-1000', 'COMERCIAL',  true,  true, NULL, NULL),
-- (1, '(11) 3030-1001', 'FINANCEIRO', false, true, NULL, NULL),
-- (2, '(47) 3276-4000', 'COMERCIAL',  true,  true, NULL, NULL),
-- (3, '(11) 4591-1800', 'COMERCIAL',  true,  true, NULL, NULL),
-- (4, '(48) 2106-0006', 'COMERCIAL',  true,  true, NULL, NULL),
-- (5, '(11) 5853-5000', 'COMERCIAL',  true,  true, NULL, NULL),
-- (6, '(51) 3322-4100', 'COMERCIAL',  true,  true, NULL, NULL),
-- (7, '(11) 2112-4000', 'COMERCIAL',  true,  true, NULL, NULL),
-- (7, '(11) 2112-4001', 'FINANCEIRO', false, true, NULL, NULL);


-- ============================================================
-- USUÁRIOS
-- ============================================================
INSERT INTO public.tb_usuarios (
    "usuario","nome","email","senhaHash","perfilId","funcionarioId",
    "situacao","tentativasLogin","ativo") VALUES
('simone.gomes',   'Simone Aparecida Gomes',    'simone@empresa.com.br',   '$2b$12$placeholderHashSimone',   1, 8, 'ATIVO', 0, true),
('roberto.alves',  'Roberto Alves Pinto',        'roberto@empresa.com.br',  '$2b$12$placeholderHashRoberto',  2, 3, 'ATIVO', 0, true),
('anderson.luis',  'Anderson Luís Ferreira',     'anderson@empresa.com.br', '$2b$12$placeholderHashAnderson', 3, 7, 'ATIVO', 0, true),
('carlos.mendes',  'Carlos Eduardo Mendes',      'carlos@empresa.com.br',   '$2b$12$placeholderHashCarlos',   4, 1, 'ATIVO', 0, true),
('fernanda.lima',  'Fernanda Lima Souza',         'fernanda@empresa.com.br', '$2b$12$placeholderHashFernanda', 4, 2, 'ATIVO', 0, true),
('admin',          'Administrador do Sistema',    'admin@empresa.com.br',    '$2b$12$placeholderHashAdmin',    1, NULL,'ATIVO', 0, true);












BEGIN;
 
TRUNCATE TABLE public.tb_notas_entrada CASCADE;
 
ALTER TABLE public.tb_notas_entrada
    DROP CONSTRAINT IF EXISTS tb_notas_entrada_situacao_check;
 
ALTER TABLE public.tb_notas_entrada
    ADD CONSTRAINT tb_notas_entrada_situacao_check
    CHECK ("situacao" IN ('LANCADA', 'CANCELADA'));
 
ALTER TABLE public.tb_notas_entrada
    ALTER COLUMN "situacao" SET DEFAULT 'LANCADA';
 
COMMIT;
 



 

