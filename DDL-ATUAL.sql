-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION postgres;

-- DROP SEQUENCE public.tb_categorias_id_seq;

CREATE SEQUENCE public.tb_categorias_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_cidades_id_seq;

CREATE SEQUENCE public.tb_cidades_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_clientes_id_seq;

CREATE SEQUENCE public.tb_clientes_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_condicoes_pagamento_id_seq;

CREATE SEQUENCE public.tb_condicoes_pagamento_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_contas_pagar_avulsa_id_seq;

CREATE SEQUENCE public.tb_contas_pagar_avulsa_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_contas_pagar_id_seq;

CREATE SEQUENCE public.tb_contas_pagar_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_contas_receber_id_seq;

CREATE SEQUENCE public.tb_contas_receber_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_estados_id_seq;

CREATE SEQUENCE public.tb_estados_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_formas_pagamento_id_seq;

CREATE SEQUENCE public.tb_formas_pagamento_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_fornecedor_email_id_seq;

CREATE SEQUENCE public.tb_fornecedor_email_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_fornecedor_telefone_id_seq;

CREATE SEQUENCE public.tb_fornecedor_telefone_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_fornecedores_id_seq;

CREATE SEQUENCE public.tb_fornecedores_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_funcionarios_id_seq;

CREATE SEQUENCE public.tb_funcionarios_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_funcoes_funcionario_id_seq;

CREATE SEQUENCE public.tb_funcoes_funcionario_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_itens_nfe_id_seq;

CREATE SEQUENCE public.tb_itens_nfe_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_log_acesso_id_seq;

CREATE SEQUENCE public.tb_log_acesso_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_marcas_id_seq;

CREATE SEQUENCE public.tb_marcas_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_modalidades_nfe_id_seq;

CREATE SEQUENCE public.tb_modalidades_nfe_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_movimentacoes_nfe_id_seq;

CREATE SEQUENCE public.tb_movimentacoes_nfe_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_nfe_id_seq;

CREATE SEQUENCE public.tb_nfe_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_paises_id_seq;

CREATE SEQUENCE public.tb_paises_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_parcelas_condicao_pagamento_id_seq;

CREATE SEQUENCE public.tb_parcelas_condicao_pagamento_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_perfis_usuario_id_seq;

CREATE SEQUENCE public.tb_perfis_usuario_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_permissoes_id_seq;

CREATE SEQUENCE public.tb_permissoes_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_produto_fornecedor_id_seq;

CREATE SEQUENCE public.tb_produto_fornecedor_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_produtos_id_seq;

CREATE SEQUENCE public.tb_produtos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_refresh_tokens_id_seq;

CREATE SEQUENCE public.tb_refresh_tokens_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_transp_itens_id_seq;

CREATE SEQUENCE public.tb_transp_itens_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_transportadora_emails_id_email_seq;

CREATE SEQUENCE public.tb_transportadora_emails_id_email_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_transportadora_telefones_id_telefone_seq;

CREATE SEQUENCE public.tb_transportadora_telefones_id_telefone_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_transportadoras_id_seq;

CREATE SEQUENCE public.tb_transportadoras_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_unidades_medida_id_seq;

CREATE SEQUENCE public.tb_unidades_medida_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_usuarios_id_seq;

CREATE SEQUENCE public.tb_usuarios_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.tb_veiculos_id_seq;

CREATE SEQUENCE public.tb_veiculos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;-- public.tb_categorias definition

-- Drop table

-- DROP TABLE public.tb_categorias;

CREATE TABLE public.tb_categorias (
	id bigserial NOT NULL,
	categoria varchar(60) NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_categorias_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_tb_categorias_nome ON public.tb_categorias USING btree (categoria);

-- Table Triggers

create trigger trg_categorias_alt before
update
    on
    public.tb_categorias for each row execute function fn_atualiza_data_alteracao();


-- public.tb_condicoes_pagamento definition

-- Drop table

-- DROP TABLE public.tb_condicoes_pagamento;

CREATE TABLE public.tb_condicoes_pagamento (
	id bigserial NOT NULL,
	condicao_pagamento varchar(255) NOT NULL,
	numero_parcelas int4 DEFAULT 1 NOT NULL,
	dias_primeira_parcela int4 DEFAULT 0 NOT NULL,
	dias_entre_parcelas int4 DEFAULT 0 NOT NULL,
	percentual_juros numeric(10, 2) DEFAULT 0.00 NOT NULL,
	percentual_multa numeric(10, 2) DEFAULT 0.00 NOT NULL,
	percentual_desconto numeric(10, 2) DEFAULT 0.00 NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_condicoes_pagamento_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_tb_condicoes_pagamento ON public.tb_condicoes_pagamento USING btree (condicao_pagamento);

-- Table Triggers

create trigger trg_condicoes_pagamento_alt before
update
    on
    public.tb_condicoes_pagamento for each row execute function fn_atualiza_data_alteracao();


-- public.tb_formas_pagamento definition

-- Drop table

-- DROP TABLE public.tb_formas_pagamento;

CREATE TABLE public.tb_formas_pagamento (
	id bigserial NOT NULL,
	forma_pagamento varchar(100) NOT NULL,
	descricao varchar(100) NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_formas_pagamento_pkey PRIMARY KEY (id)
);

-- Table Triggers

create trigger trg_formas_pagamento_alt before
update
    on
    public.tb_formas_pagamento for each row execute function fn_atualiza_data_alteracao();


-- public.tb_funcoes_funcionario definition

-- Drop table

-- DROP TABLE public.tb_funcoes_funcionario;

CREATE TABLE public.tb_funcoes_funcionario (
	id bigserial NOT NULL,
	funcao_funcionario varchar(255) NOT NULL,
	descricao varchar(255) NULL,
	salario_base numeric(10, 2) DEFAULT 0.00 NOT NULL,
	carga_horaria numeric(10, 2) NOT NULL,
	requer_cnh bool DEFAULT false NOT NULL,
	observacao varchar(255) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_funcoes_funcionario_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_tb_funcoes_ativo ON public.tb_funcoes_funcionario USING btree (ativo);

-- Table Triggers

create trigger trg_funcoes_funcionario_alt before
update
    on
    public.tb_funcoes_funcionario for each row execute function fn_atualiza_data_alteracao();


-- public.tb_marcas definition

-- Drop table

-- DROP TABLE public.tb_marcas;

CREATE TABLE public.tb_marcas (
	id bigserial NOT NULL,
	marca varchar(60) NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_marcas_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_tb_marcas_nome ON public.tb_marcas USING btree (marca);

-- Table Triggers

create trigger trg_marcas_alt before
update
    on
    public.tb_marcas for each row execute function fn_atualiza_data_alteracao();


-- public.tb_modalidades_nfe definition

-- Drop table

-- DROP TABLE public.tb_modalidades_nfe;

CREATE TABLE public.tb_modalidades_nfe (
	id bigserial NOT NULL,
	codigo varchar(10) NOT NULL,
	descricao varchar(100) NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_modalidades_nfe_codigo_key UNIQUE (codigo),
	CONSTRAINT tb_modalidades_nfe_pkey PRIMARY KEY (id)
);

-- Table Triggers

create trigger trg_modalidades_nfe_alt before
update
    on
    public.tb_modalidades_nfe for each row execute function fn_atualiza_data_alteracao();


-- public.tb_paises definition

-- Drop table

-- DROP TABLE public.tb_paises;

CREATE TABLE public.tb_paises (
	id bigserial NOT NULL,
	pais varchar(100) NOT NULL,
	codigo varchar(5) NOT NULL,
	sigla bpchar(3) NOT NULL,
	moeda bpchar(3) NOT NULL,
	nacionalidade varchar(100) NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_paises_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_tb_paises_nacionalidade ON public.tb_paises USING btree (nacionalidade);

-- Table Triggers

create trigger trg_paises_alt before
update
    on
    public.tb_paises for each row execute function fn_atualiza_data_alteracao();


-- public.tb_perfis_usuario definition

-- Drop table

-- DROP TABLE public.tb_perfis_usuario;

CREATE TABLE public.tb_perfis_usuario (
	id bigserial NOT NULL,
	perfil varchar(50) NOT NULL,
	descricao varchar(255) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_perfis_usuario_perfil_key UNIQUE (perfil),
	CONSTRAINT tb_perfis_usuario_pkey PRIMARY KEY (id)
);

-- Table Triggers

create trigger trg_perfis_usuario_alt before
update
    on
    public.tb_perfis_usuario for each row execute function fn_atualiza_data_alteracao();


-- public.tb_permissoes definition

-- Drop table

-- DROP TABLE public.tb_permissoes;

CREATE TABLE public.tb_permissoes (
	id bigserial NOT NULL,
	recurso varchar(100) NOT NULL,
	acao varchar(50) NOT NULL,
	descricao varchar(255) NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_permissoes_pkey PRIMARY KEY (id),
	CONSTRAINT tb_permissoes_recurso_acao_key UNIQUE (recurso, acao)
);

-- Table Triggers

create trigger trg_permissoes_alt before
update
    on
    public.tb_permissoes for each row execute function fn_atualiza_data_alteracao();


-- public.tb_unidades_medida definition

-- Drop table

-- DROP TABLE public.tb_unidades_medida;

CREATE TABLE public.tb_unidades_medida (
	id bigserial NOT NULL,
	unidade_medida varchar(255) NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_unidades_medida_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_tb_unidades_medida_nome ON public.tb_unidades_medida USING btree (unidade_medida);

-- Table Triggers

create trigger trg_unidades_medida_alt before
update
    on
    public.tb_unidades_medida for each row execute function fn_atualiza_data_alteracao();


-- public.tb_veiculos definition

-- Drop table

-- DROP TABLE public.tb_veiculos;

CREATE TABLE public.tb_veiculos (
	id bigserial NOT NULL,
	placa varchar(10) NOT NULL,
	modelo varchar(50) NOT NULL,
	marca varchar(50) NOT NULL,
	ano int4 NOT NULL,
	capacidade numeric(10, 2) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_veiculos_pkey PRIMARY KEY (id),
	CONSTRAINT tb_veiculos_placa_key UNIQUE (placa)
);

-- Table Triggers

create trigger trg_veiculos_alt before
update
    on
    public.tb_veiculos for each row execute function fn_atualiza_data_alteracao();


-- public.tb_estados definition

-- Drop table

-- DROP TABLE public.tb_estados;

CREATE TABLE public.tb_estados (
	id bigserial NOT NULL,
	estado varchar(100) NOT NULL,
	uf varchar(2) NOT NULL,
	pais_id int8 NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_estados_pkey PRIMARY KEY (id),
	CONSTRAINT tb_estados_pais_id_fkey FOREIGN KEY (pais_id) REFERENCES public.tb_paises(id)
);

-- Table Triggers

create trigger trg_estados_alt before
update
    on
    public.tb_estados for each row execute function fn_atualiza_data_alteracao();


-- public.tb_parcelas_condicao_pagamento definition

-- Drop table

-- DROP TABLE public.tb_parcelas_condicao_pagamento;

CREATE TABLE public.tb_parcelas_condicao_pagamento (
	id bigserial NOT NULL,
	condicao_pagamento_id int8 NOT NULL,
	numero int4 NOT NULL,
	dias int4 NOT NULL,
	percentual numeric(10, 2) NOT NULL,
	forma_pagamento_id int8 NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_parcelas_condicao_pagamento_pkey PRIMARY KEY (id),
	CONSTRAINT tb_parcelas_condicao_pagamento_condicao_pagamento_id_fkey FOREIGN KEY (condicao_pagamento_id) REFERENCES public.tb_condicoes_pagamento(id) ON DELETE CASCADE,
	CONSTRAINT tb_parcelas_condicao_pagamento_forma_pagamento_id_fkey FOREIGN KEY (forma_pagamento_id) REFERENCES public.tb_formas_pagamento(id)
);

-- Table Triggers

create trigger trg_parcelas_condicao_alt before
update
    on
    public.tb_parcelas_condicao_pagamento for each row execute function fn_atualiza_data_alteracao();


-- public.tb_perfil_permissoes definition

-- Drop table

-- DROP TABLE public.tb_perfil_permissoes;

CREATE TABLE public.tb_perfil_permissoes (
	perfil_id int8 NOT NULL,
	permissao_id int8 NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_perfil_permissoes_pkey PRIMARY KEY (perfil_id, permissao_id),
	CONSTRAINT tb_perfil_permissoes_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.tb_perfis_usuario(id) ON DELETE CASCADE,
	CONSTRAINT tb_perfil_permissoes_permissao_id_fkey FOREIGN KEY (permissao_id) REFERENCES public.tb_permissoes(id) ON DELETE CASCADE
);


-- public.tb_produtos definition

-- Drop table

-- DROP TABLE public.tb_produtos;

CREATE TABLE public.tb_produtos (
	id bigserial NOT NULL,
	produto varchar(255) NOT NULL,
	codigo_barras varchar(255) NULL,
	referencia varchar(50) NULL,
	marca_id int8 NOT NULL,
	unidade_medida_id int8 NOT NULL,
	categoria_id int8 NOT NULL,
	valor_compra numeric(10, 2) NOT NULL,
	valor_venda numeric(10, 2) NOT NULL,
	quantidade int4 DEFAULT 0 NOT NULL,
	quantidade_minima int4 DEFAULT 1 NOT NULL,
	percentual_lucro numeric(10, 2) DEFAULT 0.00 NOT NULL,
	descricao text NULL,
	observacoes varchar(255) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_produtos_pkey PRIMARY KEY (id),
	CONSTRAINT tb_produtos_valor_compra_check CHECK ((valor_compra >= (0)::numeric)),
	CONSTRAINT tb_produtos_valor_venda_check CHECK ((valor_venda >= (0)::numeric)),
	CONSTRAINT tb_produtos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.tb_categorias(id),
	CONSTRAINT tb_produtos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.tb_marcas(id),
	CONSTRAINT tb_produtos_unidade_medida_id_fkey FOREIGN KEY (unidade_medida_id) REFERENCES public.tb_unidades_medida(id)
);
CREATE INDEX idx_tb_produtos_ativo_categoria ON public.tb_produtos USING btree (ativo, categoria_id);

-- Table Triggers

create trigger trg_produtos_alt before
update
    on
    public.tb_produtos for each row execute function fn_atualiza_data_alteracao();


-- public.tb_cidades definition

-- Drop table

-- DROP TABLE public.tb_cidades;

CREATE TABLE public.tb_cidades (
	id bigserial NOT NULL,
	cidade varchar(100) NOT NULL,
	codigo_ibge varchar(10) NOT NULL,
	estado_id int8 NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_cidades_codigo_ibge_key UNIQUE (codigo_ibge),
	CONSTRAINT tb_cidades_pkey PRIMARY KEY (id),
	CONSTRAINT tb_cidades_estado_id_fkey FOREIGN KEY (estado_id) REFERENCES public.tb_estados(id)
);

-- Table Triggers

create trigger trg_cidades_alt before
update
    on
    public.tb_cidades for each row execute function fn_atualiza_data_alteracao();


-- public.tb_clientes definition

-- Drop table

-- DROP TABLE public.tb_clientes;

CREATE TABLE public.tb_clientes (
	id bigserial NOT NULL,
	cliente varchar(150) NOT NULL,
	apelido varchar(60) NULL,
	cpf_cnpj varchar(14) NOT NULL,
	rg_inscricao_estadual varchar(20) NULL,
	email varchar(100) NULL,
	telefone varchar(20) NULL,
	cep varchar(9) NULL,
	endereco varchar(200) NULL,
	numero varchar(10) NULL,
	complemento varchar(100) NULL,
	bairro varchar(50) NULL,
	cidade_id int8 NOT NULL,
	pais_id int8 NOT NULL,
	condicao_pagamento_id int8 NOT NULL,
	limite_credito numeric(10, 2) DEFAULT 0.00 NOT NULL,
	data_nascimento date NULL,
	estado_civil varchar(20) NULL,
	tipo varchar(1) NOT NULL,
	sexo varchar(1) NULL,
	observacao varchar(255) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_clientes_cpf_cnpj_key UNIQUE (cpf_cnpj),
	CONSTRAINT tb_clientes_estado_civil_check CHECK (((estado_civil IS NULL) OR ((estado_civil)::text = ANY ((ARRAY['SOLTEIRO'::character varying, 'CASADO'::character varying, 'DIVORCIADO'::character varying, 'VIUVO'::character varying, 'UNIAO_ESTAVEL'::character varying, 'OUTRO'::character varying])::text[])))),
	CONSTRAINT tb_clientes_pkey PRIMARY KEY (id),
	CONSTRAINT tb_clientes_sexo_check CHECK (((sexo IS NULL) OR ((sexo)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying, 'O'::character varying])::text[])))),
	CONSTRAINT tb_clientes_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['F'::character varying, 'J'::character varying])::text[]))),
	CONSTRAINT tb_clientes_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.tb_cidades(id),
	CONSTRAINT tb_clientes_condicao_pagamento_id_fkey FOREIGN KEY (condicao_pagamento_id) REFERENCES public.tb_condicoes_pagamento(id),
	CONSTRAINT tb_clientes_pais_id_fkey FOREIGN KEY (pais_id) REFERENCES public.tb_paises(id)
);
CREATE INDEX idx_tb_clientes_ativo ON public.tb_clientes USING btree (ativo);
CREATE INDEX idx_tb_clientes_cpf_cnpj ON public.tb_clientes USING btree (cpf_cnpj);

-- Table Triggers

create trigger trg_clientes_alt before
update
    on
    public.tb_clientes for each row execute function fn_atualiza_data_alteracao();


-- public.tb_contas_receber definition

-- Drop table

-- DROP TABLE public.tb_contas_receber;

CREATE TABLE public.tb_contas_receber (
	id bigserial NOT NULL,
	nota_numero varchar(20) NOT NULL,
	nota_modelo varchar(2) NOT NULL,
	nota_serie varchar(3) NOT NULL,
	cliente_id int8 NOT NULL,
	forma_pagamento_id int8 NOT NULL,
	numero_parcela int4 NOT NULL,
	total_parcelas int4 NOT NULL,
	valor_original numeric(15, 2) NOT NULL,
	valor_recebido numeric(15, 2) DEFAULT 0.00 NOT NULL,
	valor_desconto numeric(15, 2) DEFAULT 0.00 NOT NULL,
	valor_juros numeric(15, 2) DEFAULT 0.00 NOT NULL,
	valor_multa numeric(15, 2) DEFAULT 0.00 NOT NULL,
	valor_total numeric(15, 2) NOT NULL,
	data_emissao date NOT NULL,
	data_vencimento date NOT NULL,
	data_recebimento date NULL,
	situacao varchar(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
	observacoes text NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_contas_receber_pkey PRIMARY KEY (id),
	CONSTRAINT tb_contas_receber_situacao_check CHECK (((situacao)::text = ANY ((ARRAY['PENDENTE'::character varying, 'RECEBIDO'::character varying, 'PARCIAL'::character varying, 'CANCELADO'::character varying])::text[]))),
	CONSTRAINT tb_contas_receber_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.tb_clientes(id),
	CONSTRAINT tb_contas_receber_forma_pagamento_id_fkey FOREIGN KEY (forma_pagamento_id) REFERENCES public.tb_formas_pagamento(id)
);
CREATE INDEX idx_contas_receber_venc ON public.tb_contas_receber USING btree (data_vencimento);

-- Table Triggers

create trigger trg_contas_receber_alt before
update
    on
    public.tb_contas_receber for each row execute function fn_atualiza_data_alteracao();


-- public.tb_funcionarios definition

-- Drop table

-- DROP TABLE public.tb_funcionarios;

CREATE TABLE public.tb_funcionarios (
	id bigserial NOT NULL,
	funcionario varchar(255) NOT NULL,
	apelido varchar(60) NULL,
	cpf_cnpj varchar(14) NOT NULL,
	rg_inscricao_estadual varchar(20) NULL,
	telefone varchar(20) NOT NULL,
	email varchar(100) NOT NULL,
	cep varchar(9) NOT NULL,
	endereco varchar(200) NOT NULL,
	numero varchar(10) NOT NULL,
	complemento varchar(100) NULL,
	bairro varchar(50) NOT NULL,
	cidade_id int8 NOT NULL,
	pais_id int8 NOT NULL,
	funcao_funcionario_id int8 NOT NULL,
	data_nascimento date NOT NULL,
	data_admissao date NOT NULL,
	data_demissao date NULL,
	cnh varchar(25) NULL,
	data_validade_cnh date NULL,
	sexo varchar(1) NOT NULL,
	estado_civil varchar(20) NOT NULL,
	salario numeric(10, 2) NOT NULL,
	tipo varchar(20) DEFAULT 'INTERNO'::character varying NOT NULL,
	observacao varchar(255) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_funcionarios_cpf_cnpj_key UNIQUE (cpf_cnpj),
	CONSTRAINT tb_funcionarios_estado_civil_check CHECK (((estado_civil)::text = ANY ((ARRAY['SOLTEIRO'::character varying, 'CASADO'::character varying, 'DIVORCIADO'::character varying, 'VIUVO'::character varying, 'UNIAO_ESTAVEL'::character varying, 'OUTRO'::character varying])::text[]))),
	CONSTRAINT tb_funcionarios_pkey PRIMARY KEY (id),
	CONSTRAINT tb_funcionarios_sexo_check CHECK (((sexo)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying, 'O'::character varying])::text[]))),
	CONSTRAINT tb_funcionarios_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['INTERNO'::character varying, 'EXTERNO'::character varying, 'TERCEIRIZADO'::character varying])::text[]))),
	CONSTRAINT tb_funcionarios_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.tb_cidades(id),
	CONSTRAINT tb_funcionarios_funcao_funcionario_id_fkey FOREIGN KEY (funcao_funcionario_id) REFERENCES public.tb_funcoes_funcionario(id),
	CONSTRAINT tb_funcionarios_pais_id_fkey FOREIGN KEY (pais_id) REFERENCES public.tb_paises(id)
);
CREATE INDEX idx_tb_funcionarios_ativo ON public.tb_funcionarios USING btree (ativo);

-- Table Triggers

create trigger trg_funcionarios_alt before
update
    on
    public.tb_funcionarios for each row execute function fn_atualiza_data_alteracao();


-- public.tb_transportadoras definition

-- Drop table

-- DROP TABLE public.tb_transportadoras;

CREATE TABLE public.tb_transportadoras (
	id bigserial NOT NULL,
	razao_social varchar(150) NOT NULL,
	nome_fantasia varchar(100) NULL,
	cnpj varchar(14) NOT NULL,
	rg_ie varchar(20) NULL,
	email varchar(100) NULL,
	telefone varchar(20) NULL,
	cep varchar(9) NULL,
	endereco varchar(200) NULL,
	numero varchar(10) NULL,
	complemento varchar(100) NULL,
	bairro varchar(100) NULL,
	cidade_id int8 NOT NULL,
	condicao_pagamento_id int8 NOT NULL,
	tipo varchar(1) DEFAULT 'J'::character varying NOT NULL,
	observacao varchar(255) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_transportadoras_cnpj_key UNIQUE (cnpj),
	CONSTRAINT tb_transportadoras_pkey PRIMARY KEY (id),
	CONSTRAINT tb_transportadoras_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['F'::character varying, 'J'::character varying])::text[]))),
	CONSTRAINT tb_transportadoras_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.tb_cidades(id),
	CONSTRAINT tb_transportadoras_condicao_pagamento_id_fkey FOREIGN KEY (condicao_pagamento_id) REFERENCES public.tb_condicoes_pagamento(id)
);

-- Table Triggers

create trigger trg_transportadoras_alt before
update
    on
    public.tb_transportadoras for each row execute function fn_atualiza_data_alteracao();


-- public.tb_usuarios definition

-- Drop table

-- DROP TABLE public.tb_usuarios;

CREATE TABLE public.tb_usuarios (
	id bigserial NOT NULL,
	usuario varchar(100) NOT NULL,
	nome varchar(150) NOT NULL,
	email varchar(150) NOT NULL,
	senha_hash varchar(255) NOT NULL,
	perfil_id int8 NOT NULL,
	funcionario_id int8 NULL,
	situacao varchar(20) DEFAULT 'ATIVO'::character varying NOT NULL,
	tentativas_login int4 DEFAULT 0 NOT NULL,
	ultimo_login timestamptz NULL,
	token_reset_senha varchar(255) NULL,
	expiracao_token timestamptz NULL,
	foto_perfil varchar(500) NULL,
	observacao varchar(255) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_usuarios_email_key UNIQUE (email),
	CONSTRAINT tb_usuarios_pkey PRIMARY KEY (id),
	CONSTRAINT tb_usuarios_situacao_check CHECK (((situacao)::text = ANY ((ARRAY['ATIVO'::character varying, 'INATIVO'::character varying, 'BLOQUEADO'::character varying, 'PENDENTE'::character varying])::text[]))),
	CONSTRAINT tb_usuarios_tentativas_check CHECK ((tentativas_login >= 0)),
	CONSTRAINT tb_usuarios_usuario_key UNIQUE (usuario),
	CONSTRAINT tb_usuarios_funcionario_id_fkey FOREIGN KEY (funcionario_id) REFERENCES public.tb_funcionarios(id) ON DELETE SET NULL,
	CONSTRAINT tb_usuarios_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.tb_perfis_usuario(id)
);
CREATE INDEX idx_tb_usuarios_ativo ON public.tb_usuarios USING btree (ativo);
CREATE INDEX idx_tb_usuarios_email ON public.tb_usuarios USING btree (email);
CREATE INDEX idx_tb_usuarios_situacao ON public.tb_usuarios USING btree (situacao);

-- Table Triggers

create trigger trg_usuarios_alt before
update
    on
    public.tb_usuarios for each row execute function fn_atualiza_data_alteracao();


-- public.tb_usuarios_permissoes definition

-- Drop table

-- DROP TABLE public.tb_usuarios_permissoes;

CREATE TABLE public.tb_usuarios_permissoes (
	usuario_id int8 NOT NULL,
	permissao_id int8 NOT NULL,
	tipo varchar(10) DEFAULT 'CONCEDER'::character varying NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_usuarios_permissoes_pkey PRIMARY KEY (usuario_id, permissao_id),
	CONSTRAINT tb_usuarios_permissoes_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['CONCEDER'::character varying, 'NEGAR'::character varying])::text[]))),
	CONSTRAINT tb_usuarios_permissoes_permissao_id_fkey FOREIGN KEY (permissao_id) REFERENCES public.tb_permissoes(id) ON DELETE CASCADE,
	CONSTRAINT tb_usuarios_permissoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tb_usuarios(id) ON DELETE CASCADE
);


-- public.tb_fornecedores definition

-- Drop table

-- DROP TABLE public.tb_fornecedores;

CREATE TABLE public.tb_fornecedores (
	id bigserial NOT NULL,
	fornecedor varchar(255) NOT NULL,
	apelido varchar(255) NOT NULL,
	cpf_cnpj varchar(14) NOT NULL,
	rg_inscricao_estadual varchar(20) NULL,
	email varchar(255) NULL,
	telefone varchar(255) NULL,
	cep varchar(9) NULL,
	endereco varchar(255) NULL,
	numero varchar(10) NULL,
	complemento varchar(255) NULL,
	bairro varchar(255) NULL,
	cidade_id int8 NOT NULL,
	pais_id int8 NOT NULL,
	condicao_pagamento_id int8 NOT NULL,
	transportadora_id int8 NULL,
	tipo varchar(1) NOT NULL,
	limite_credito numeric(15, 2) DEFAULT 0.00 NOT NULL,
	observacoes varchar(255) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_fornecedores_cpf_cnpj_key UNIQUE (cpf_cnpj),
	CONSTRAINT tb_fornecedores_pkey PRIMARY KEY (id),
	CONSTRAINT tb_fornecedores_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['F'::character varying, 'J'::character varying])::text[]))),
	CONSTRAINT tb_fornecedores_cidade_id_fkey FOREIGN KEY (cidade_id) REFERENCES public.tb_cidades(id),
	CONSTRAINT tb_fornecedores_condicao_pagamento_id_fkey FOREIGN KEY (condicao_pagamento_id) REFERENCES public.tb_condicoes_pagamento(id),
	CONSTRAINT tb_fornecedores_pais_id_fkey FOREIGN KEY (pais_id) REFERENCES public.tb_paises(id),
	CONSTRAINT tb_fornecedores_transportadora_id_fkey FOREIGN KEY (transportadora_id) REFERENCES public.tb_transportadoras(id)
);
CREATE INDEX idx_tb_fornecedores_ativo ON public.tb_fornecedores USING btree (ativo);

-- Table Triggers

create trigger trg_fornecedores_alt before
update
    on
    public.tb_fornecedores for each row execute function fn_atualiza_data_alteracao();


-- public.tb_log_acesso definition

-- Drop table

-- DROP TABLE public.tb_log_acesso;

CREATE TABLE public.tb_log_acesso (
	id bigserial NOT NULL,
	usuario_id int8 NULL,
	login_tentado varchar(100) NULL,
	sucesso bool NOT NULL,
	ip_origem varchar(45) NULL,
	user_agent varchar(500) NULL,
	observacao varchar(255) NULL,
	data_acesso timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_log_acesso_pkey PRIMARY KEY (id),
	CONSTRAINT tb_log_acesso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tb_usuarios(id) ON DELETE SET NULL
);
CREATE INDEX idx_tb_log_acesso_data ON public.tb_log_acesso USING btree (data_acesso);
CREATE INDEX idx_tb_log_acesso_usuario ON public.tb_log_acesso USING btree (usuario_id);


-- public.tb_nfe definition

-- Drop table

-- DROP TABLE public.tb_nfe;

CREATE TABLE public.tb_nfe (
	id bigserial NOT NULL,
	numero varchar(50) NOT NULL,
	serie varchar(3) NOT NULL,
	chave_acesso varchar(44) NULL,
	data_emissao timestamp NOT NULL,
	cliente_id int8 NOT NULL,
	forma_pagamento_id int8 NOT NULL,
	condicao_pagamento_id int8 NOT NULL,
	transportadora_id int8 NULL,
	veiculo_id int8 NULL,
	modalidade_id int8 NOT NULL,
	valor_total numeric(10, 2) NOT NULL,
	cancelada bool DEFAULT false NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_nfe_pkey PRIMARY KEY (id),
	CONSTRAINT tb_nfe_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.tb_clientes(id),
	CONSTRAINT tb_nfe_condicao_pagamento_id_fkey FOREIGN KEY (condicao_pagamento_id) REFERENCES public.tb_condicoes_pagamento(id),
	CONSTRAINT tb_nfe_forma_pagamento_id_fkey FOREIGN KEY (forma_pagamento_id) REFERENCES public.tb_formas_pagamento(id),
	CONSTRAINT tb_nfe_modalidade_id_fkey FOREIGN KEY (modalidade_id) REFERENCES public.tb_modalidades_nfe(id),
	CONSTRAINT tb_nfe_transportadora_id_fkey FOREIGN KEY (transportadora_id) REFERENCES public.tb_transportadoras(id),
	CONSTRAINT tb_nfe_veiculo_id_fkey FOREIGN KEY (veiculo_id) REFERENCES public.tb_veiculos(id)
);

-- Table Triggers

create trigger trg_nfe_alt before
update
    on
    public.tb_nfe for each row execute function fn_atualiza_data_alteracao();


-- public.tb_notas_entrada definition

-- Drop table

-- DROP TABLE public.tb_notas_entrada;

CREATE TABLE public.tb_notas_entrada (
	numero varchar(20) NOT NULL,
	modelo varchar(10) DEFAULT '55'::character varying NOT NULL,
	serie varchar(10) DEFAULT '1'::character varying NOT NULL,
	fornecedor_id int8 NOT NULL,
	condicao_pagamento_id int8 NOT NULL,
	forma_pagamento_id int8 NOT NULL,
	transportadora_id int8 NULL,
	data_emissao date DEFAULT CURRENT_DATE NOT NULL,
	data_chegada date NULL,
	tipo_frete varchar(3) DEFAULT 'CIF'::character varying NOT NULL,
	valor_produtos numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	valor_frete numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	valor_seguro numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	outras_despesas numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	valor_desconto numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	valor_total numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	placa_veiculo varchar(10) NULL,
	observacoes text NULL,
	situacao varchar(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT check_data_chegada CHECK (((data_chegada IS NULL) OR (data_chegada >= data_emissao))),
	CONSTRAINT tb_notas_entrada_outras_despesas_check CHECK ((outras_despesas >= (0)::numeric)),
	CONSTRAINT tb_notas_entrada_pkey PRIMARY KEY (numero, modelo, serie, fornecedor_id),
	CONSTRAINT tb_notas_entrada_situacao_check CHECK (((situacao)::text = ANY ((ARRAY['PENDENTE'::character varying, 'CONFIRMADA'::character varying, 'CANCELADA'::character varying])::text[]))),
	CONSTRAINT tb_notas_entrada_tipo_frete_check CHECK (((tipo_frete)::text = ANY ((ARRAY['CIF'::character varying, 'FOB'::character varying, 'SEM'::character varying])::text[]))),
	CONSTRAINT tb_notas_entrada_valor_desconto_check CHECK ((valor_desconto >= (0)::numeric)),
	CONSTRAINT tb_notas_entrada_valor_frete_check CHECK ((valor_frete >= (0)::numeric)),
	CONSTRAINT tb_notas_entrada_valor_produtos_check CHECK ((valor_produtos >= (0)::numeric)),
	CONSTRAINT tb_notas_entrada_valor_seguro_check CHECK ((valor_seguro >= (0)::numeric)),
	CONSTRAINT tb_notas_entrada_valor_total_check CHECK ((valor_total >= (0)::numeric)),
	CONSTRAINT tb_notas_entrada_condicao_pagamento_id_fkey FOREIGN KEY (condicao_pagamento_id) REFERENCES public.tb_condicoes_pagamento(id),
	CONSTRAINT tb_notas_entrada_forma_pagamento_id_fkey FOREIGN KEY (forma_pagamento_id) REFERENCES public.tb_formas_pagamento(id),
	CONSTRAINT tb_notas_entrada_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedores(id),
	CONSTRAINT tb_notas_entrada_transportadora_id_fkey FOREIGN KEY (transportadora_id) REFERENCES public.tb_transportadoras(id)
);

-- Table Triggers

create trigger trg_notas_entrada_alt before
update
    on
    public.tb_notas_entrada for each row execute function fn_atualiza_data_alteracao();


-- public.tb_notas_saida definition

-- Drop table

-- DROP TABLE public.tb_notas_saida;

CREATE TABLE public.tb_notas_saida (
	numero varchar(20) NOT NULL,
	modelo varchar(10) DEFAULT '55'::character varying NOT NULL,
	serie varchar(10) DEFAULT '1'::character varying NOT NULL,
	cliente_id int8 NOT NULL,
	condicao_pagamento_id int8 NOT NULL,
	forma_pagamento_id int8 NOT NULL,
	transportadora_id int8 NULL,
	data_emissao date DEFAULT CURRENT_DATE NOT NULL,
	data_saida date NULL,
	tipo_frete varchar(3) DEFAULT 'CIF'::character varying NOT NULL,
	valor_produtos numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	valor_frete numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	valor_seguro numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	outras_despesas numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	valor_desconto numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	valor_total numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	placa_veiculo varchar(10) NULL,
	observacoes text NULL,
	situacao varchar(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT check_data_saida CHECK (((data_saida IS NULL) OR (data_saida >= data_emissao))),
	CONSTRAINT tb_notas_saida_outras_despesas_check CHECK ((outras_despesas >= (0)::numeric)),
	CONSTRAINT tb_notas_saida_pkey PRIMARY KEY (numero, modelo, serie, cliente_id),
	CONSTRAINT tb_notas_saida_situacao_check CHECK (((situacao)::text = ANY ((ARRAY['PENDENTE'::character varying, 'CONFIRMADA'::character varying, 'CANCELADA'::character varying])::text[]))),
	CONSTRAINT tb_notas_saida_tipo_frete_check CHECK (((tipo_frete)::text = ANY ((ARRAY['CIF'::character varying, 'FOB'::character varying, 'SEM'::character varying])::text[]))),
	CONSTRAINT tb_notas_saida_valor_desconto_check CHECK ((valor_desconto >= (0)::numeric)),
	CONSTRAINT tb_notas_saida_valor_frete_check CHECK ((valor_frete >= (0)::numeric)),
	CONSTRAINT tb_notas_saida_valor_produtos_check CHECK ((valor_produtos >= (0)::numeric)),
	CONSTRAINT tb_notas_saida_valor_seguro_check CHECK ((valor_seguro >= (0)::numeric)),
	CONSTRAINT tb_notas_saida_valor_total_check CHECK ((valor_total >= (0)::numeric)),
	CONSTRAINT tb_notas_saida_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.tb_clientes(id),
	CONSTRAINT tb_notas_saida_condicao_pagamento_id_fkey FOREIGN KEY (condicao_pagamento_id) REFERENCES public.tb_condicoes_pagamento(id),
	CONSTRAINT tb_notas_saida_forma_pagamento_id_fkey FOREIGN KEY (forma_pagamento_id) REFERENCES public.tb_formas_pagamento(id),
	CONSTRAINT tb_notas_saida_transportadora_id_fkey FOREIGN KEY (transportadora_id) REFERENCES public.tb_transportadoras(id)
);

-- Table Triggers

create trigger trg_notas_saida_alt before
update
    on
    public.tb_notas_saida for each row execute function fn_atualiza_data_alteracao();


-- public.tb_produto_fornecedor definition

-- Drop table

-- DROP TABLE public.tb_produto_fornecedor;

CREATE TABLE public.tb_produto_fornecedor (
	id bigserial NOT NULL,
	produto_id int8 NOT NULL,
	fornecedor_id int8 NOT NULL,
	codigo_prod varchar(50) NULL,
	custo numeric(10, 2) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_produto_fornecedor_pkey PRIMARY KEY (id),
	CONSTRAINT tb_produto_fornecedor_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedores(id) ON DELETE CASCADE,
	CONSTRAINT tb_produto_fornecedor_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.tb_produtos(id) ON DELETE CASCADE
);

-- Table Triggers

create trigger trg_produto_fornecedor_alt before
update
    on
    public.tb_produto_fornecedor for each row execute function fn_atualiza_data_alteracao();


-- public.tb_produtos_nota_entrada definition

-- Drop table

-- DROP TABLE public.tb_produtos_nota_entrada;

CREATE TABLE public.tb_produtos_nota_entrada (
	nota_numero varchar(20) NOT NULL,
	nota_modelo varchar(10) NOT NULL,
	nota_serie varchar(10) NOT NULL,
	fornecedor_id int8 NOT NULL,
	produto_id int8 NOT NULL,
	sequencia int4 DEFAULT 1 NOT NULL,
	quantidade numeric(15, 4) NOT NULL,
	valor_unitario numeric(15, 4) NOT NULL,
	valor_desconto numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	percentual_desconto numeric(5, 2) DEFAULT 0.00 NOT NULL,
	valor_total numeric(15, 4) NOT NULL,
	rateio_frete numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	rateio_seguro numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	rateio_outras numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	custo_preco_final numeric(15, 4) NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_produtos_nota_entrada_percentual_desconto_check CHECK (((percentual_desconto >= (0)::numeric) AND (percentual_desconto <= (100)::numeric))),
	CONSTRAINT tb_produtos_nota_entrada_pkey PRIMARY KEY (nota_numero, nota_modelo, nota_serie, fornecedor_id, produto_id, sequencia),
	CONSTRAINT tb_produtos_nota_entrada_quantidade_check CHECK ((quantidade > (0)::numeric)),
	CONSTRAINT tb_produtos_nota_entrada_sequencia_check CHECK ((sequencia > 0)),
	CONSTRAINT tb_produtos_nota_entrada_valor_desconto_check CHECK ((valor_desconto >= (0)::numeric)),
	CONSTRAINT tb_produtos_nota_entrada_valor_total_check CHECK ((valor_total >= (0)::numeric)),
	CONSTRAINT tb_produtos_nota_entrada_valor_unitario_check CHECK ((valor_unitario >= (0)::numeric)),
	CONSTRAINT tb_produtos_nota_entrada_nota_fkey FOREIGN KEY (nota_numero,nota_modelo,nota_serie,fornecedor_id) REFERENCES public.tb_notas_entrada(numero,modelo,serie,fornecedor_id) ON DELETE CASCADE,
	CONSTRAINT tb_produtos_nota_entrada_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.tb_produtos(id)
);

-- Table Triggers

create trigger trg_produtos_nota_entrada_alt before
update
    on
    public.tb_produtos_nota_entrada for each row execute function fn_atualiza_data_alteracao();


-- public.tb_produtos_nota_saida definition

-- Drop table

-- DROP TABLE public.tb_produtos_nota_saida;

CREATE TABLE public.tb_produtos_nota_saida (
	nota_numero varchar(20) NOT NULL,
	nota_modelo varchar(10) NOT NULL,
	nota_serie varchar(10) NOT NULL,
	cliente_id int8 NOT NULL,
	produto_id int8 NOT NULL,
	sequencia int4 NOT NULL,
	quantidade numeric(15, 4) NOT NULL,
	valor_unitario numeric(15, 4) NOT NULL,
	valor_desconto numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	percentual_desconto numeric(5, 2) DEFAULT 0.00 NOT NULL,
	valor_total numeric(15, 4) NOT NULL,
	rateio_frete numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	rateio_seguro numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	rateio_outras numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	custo_preco_final numeric(15, 4) DEFAULT 0.0000 NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_produtos_nota_saida_percentual_desconto_check CHECK (((percentual_desconto >= (0)::numeric) AND (percentual_desconto <= (100)::numeric))),
	CONSTRAINT tb_produtos_nota_saida_pkey PRIMARY KEY (nota_numero, nota_modelo, nota_serie, cliente_id, produto_id, sequencia),
	CONSTRAINT tb_produtos_nota_saida_quantidade_check CHECK ((quantidade > (0)::numeric)),
	CONSTRAINT tb_produtos_nota_saida_valor_desconto_check CHECK ((valor_desconto >= (0)::numeric)),
	CONSTRAINT tb_produtos_nota_saida_valor_unitario_check CHECK ((valor_unitario >= (0)::numeric)),
	CONSTRAINT tb_produtos_nota_saida_nota_fkey FOREIGN KEY (nota_numero,nota_modelo,nota_serie,cliente_id) REFERENCES public.tb_notas_saida(numero,modelo,serie,cliente_id) ON DELETE CASCADE,
	CONSTRAINT tb_produtos_nota_saida_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.tb_produtos(id)
);

-- Table Triggers

create trigger trg_produtos_nota_saida_alt before
update
    on
    public.tb_produtos_nota_saida for each row execute function fn_atualiza_data_alteracao();


-- public.tb_refresh_tokens definition

-- Drop table

-- DROP TABLE public.tb_refresh_tokens;

CREATE TABLE public.tb_refresh_tokens (
	id bigserial NOT NULL,
	usuario_id int8 NOT NULL,
	"token" varchar(500) NOT NULL,
	expiracao timestamptz NOT NULL,
	revogado bool DEFAULT false NOT NULL,
	ip_origem varchar(45) NULL,
	user_agent varchar(500) NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_refresh_tokens_pkey PRIMARY KEY (id),
	CONSTRAINT tb_refresh_tokens_token_key UNIQUE (token),
	CONSTRAINT tb_refresh_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tb_usuarios(id) ON DELETE CASCADE
);
CREATE INDEX idx_tb_refresh_tokens_expiracao ON public.tb_refresh_tokens USING btree (expiracao);
CREATE INDEX idx_tb_refresh_tokens_usuario ON public.tb_refresh_tokens USING btree (usuario_id);


-- public.tb_transp_itens definition

-- Drop table

-- DROP TABLE public.tb_transp_itens;

CREATE TABLE public.tb_transp_itens (
	id bigserial NOT NULL,
	codigo varchar(20) NOT NULL,
	descricao varchar(100) NULL,
	transportadora_id int8 NOT NULL,
	codigo_transp varchar(20) NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_transp_itens_pkey PRIMARY KEY (id),
	CONSTRAINT tb_transp_itens_transportadora_id_fkey FOREIGN KEY (transportadora_id) REFERENCES public.tb_transportadoras(id)
);

-- Table Triggers

create trigger trg_transp_itens_alt before
update
    on
    public.tb_transp_itens for each row execute function fn_atualiza_data_alteracao();


-- public.tb_transportadora_emails definition

-- Drop table

-- DROP TABLE public.tb_transportadora_emails;

CREATE TABLE public.tb_transportadora_emails (
	id_email bigserial NOT NULL,
	cod_trans int8 NOT NULL,
	email varchar(100) NOT NULL,
	CONSTRAINT tb_transportadora_emails_pkey PRIMARY KEY (id_email),
	CONSTRAINT tb_transportadora_emails_cod_trans_fkey FOREIGN KEY (cod_trans) REFERENCES public.tb_transportadoras(id) ON DELETE CASCADE
);


-- public.tb_transportadora_telefones definition

-- Drop table

-- DROP TABLE public.tb_transportadora_telefones;

CREATE TABLE public.tb_transportadora_telefones (
	id_telefone bigserial NOT NULL,
	cod_trans int8 NOT NULL,
	telefone varchar(20) NOT NULL,
	CONSTRAINT tb_transportadora_telefones_pkey PRIMARY KEY (id_telefone),
	CONSTRAINT tb_transportadora_telefones_cod_trans_fkey FOREIGN KEY (cod_trans) REFERENCES public.tb_transportadoras(id) ON DELETE CASCADE
);


-- public.tb_transportadora_veiculo definition

-- Drop table

-- DROP TABLE public.tb_transportadora_veiculo;

CREATE TABLE public.tb_transportadora_veiculo (
	transportadora_id int8 NOT NULL,
	veiculo_id int8 NOT NULL,
	CONSTRAINT tb_transportadora_veiculo_pkey PRIMARY KEY (transportadora_id, veiculo_id),
	CONSTRAINT tb_transportadora_veiculo_transportadora_id_fkey FOREIGN KEY (transportadora_id) REFERENCES public.tb_transportadoras(id) ON DELETE CASCADE,
	CONSTRAINT tb_transportadora_veiculo_veiculo_id_fkey FOREIGN KEY (veiculo_id) REFERENCES public.tb_veiculos(id) ON DELETE CASCADE
);


-- public.tb_contas_pagar definition

-- Drop table

-- DROP TABLE public.tb_contas_pagar;

CREATE TABLE public.tb_contas_pagar (
	id bigserial NOT NULL,
	nota_numero varchar(20) NOT NULL,
	nota_modelo varchar(2) NOT NULL,
	nota_serie varchar(3) NOT NULL,
	fornecedor_id int8 NOT NULL,
	forma_pagamento_id int8 NOT NULL,
	numero_parcela int4 NOT NULL,
	total_parcelas int4 NOT NULL,
	valor_original numeric(15, 2) NOT NULL,
	valor_pago numeric(15, 2) DEFAULT 0.00 NOT NULL,
	valor_desconto numeric(15, 2) DEFAULT 0.00 NOT NULL,
	valor_juros numeric(15, 2) DEFAULT 0.00 NOT NULL,
	valor_multa numeric(15, 2) DEFAULT 0.00 NOT NULL,
	valor_total numeric(15, 2) NOT NULL,
	data_emissao date NOT NULL,
	data_vencimento date NOT NULL,
	data_pagamento date NULL,
	situacao varchar(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
	observacoes text NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_contas_pagar_pkey PRIMARY KEY (id),
	CONSTRAINT tb_contas_pagar_situacao_check CHECK (((situacao)::text = ANY ((ARRAY['PENDENTE'::character varying, 'PAGO'::character varying, 'PARCIAL'::character varying, 'CANCELADO'::character varying])::text[]))),
	CONSTRAINT tb_contas_pagar_forma_pagamento_id_fkey FOREIGN KEY (forma_pagamento_id) REFERENCES public.tb_formas_pagamento(id),
	CONSTRAINT tb_contas_pagar_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedores(id)
);
CREATE INDEX idx_contas_pagar_venc ON public.tb_contas_pagar USING btree (data_vencimento);

-- Table Triggers

create trigger trg_contas_pagar_alt before
update
    on
    public.tb_contas_pagar for each row execute function fn_atualiza_data_alteracao();


-- public.tb_contas_pagar_avulsa definition

-- Drop table

-- DROP TABLE public.tb_contas_pagar_avulsa;

CREATE TABLE public.tb_contas_pagar_avulsa (
	id bigserial NOT NULL,
	numero_nota varchar(50) NULL,
	modelo varchar(10) NULL,
	serie varchar(10) NULL,
	fornecedor_id int8 NOT NULL,
	forma_pagamento_id int8 NOT NULL,
	num_parcela int4 DEFAULT 1 NOT NULL,
	valor_parcela numeric(15, 2) NOT NULL,
	data_emissao date NOT NULL,
	data_vencimento date NOT NULL,
	data_pagamento date NULL,
	valor_pago numeric(15, 2) DEFAULT 0.00 NOT NULL,
	juros numeric(15, 2) DEFAULT 0.00 NOT NULL,
	multa numeric(15, 2) DEFAULT 0.00 NOT NULL,
	desconto numeric(15, 2) DEFAULT 0.00 NOT NULL,
	situacao varchar(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
	observacao text NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_contas_pagar_avulsa_pkey PRIMARY KEY (id),
	CONSTRAINT tb_contas_pagar_avulsa_situacao_check CHECK (((situacao)::text = ANY ((ARRAY['PENDENTE'::character varying, 'PAGO'::character varying, 'PARCIAL'::character varying, 'CANCELADO'::character varying])::text[]))),
	CONSTRAINT tb_contas_pagar_avulsa_forma_pagamento_id_fkey FOREIGN KEY (forma_pagamento_id) REFERENCES public.tb_formas_pagamento(id),
	CONSTRAINT tb_contas_pagar_avulsa_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedores(id)
);
CREATE INDEX idx_contas_pagar_avulsa_venc ON public.tb_contas_pagar_avulsa USING btree (data_vencimento);

-- Table Triggers

create trigger trg_contas_pagar_avulsa_alt before
update
    on
    public.tb_contas_pagar_avulsa for each row execute function fn_atualiza_data_alteracao();


-- public.tb_fornecedor_email definition

-- Drop table

-- DROP TABLE public.tb_fornecedor_email;

CREATE TABLE public.tb_fornecedor_email (
	id bigserial NOT NULL,
	fornecedor_id int8 NOT NULL,
	email varchar(255) NOT NULL,
	tipo varchar(20) DEFAULT 'COMERCIAL'::character varying NULL,
	principal bool DEFAULT false NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_fornecedor_email_pkey PRIMARY KEY (id),
	CONSTRAINT tb_fornecedor_email_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['COMERCIAL'::character varying, 'FINANCEIRO'::character varying, 'FISCAL'::character varying, 'OUTRO'::character varying])::text[]))),
	CONSTRAINT tb_fornecedor_email_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedores(id) ON DELETE CASCADE
);

-- Table Triggers

create trigger trg_fornecedor_email_alt before
update
    on
    public.tb_fornecedor_email for each row execute function fn_atualiza_data_alteracao();


-- public.tb_fornecedor_telefone definition

-- Drop table

-- DROP TABLE public.tb_fornecedor_telefone;

CREATE TABLE public.tb_fornecedor_telefone (
	id bigserial NOT NULL,
	fornecedor_id int8 NOT NULL,
	telefone varchar(20) NOT NULL,
	tipo varchar(20) DEFAULT 'COMERCIAL'::character varying NULL,
	principal bool DEFAULT false NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_fornecedor_telefone_pkey PRIMARY KEY (id),
	CONSTRAINT tb_fornecedor_telefone_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['COMERCIAL'::character varying, 'FINANCEIRO'::character varying, 'CELULAR'::character varying, 'OUTRO'::character varying])::text[]))),
	CONSTRAINT tb_fornecedor_telefone_fornecedor_id_fkey FOREIGN KEY (fornecedor_id) REFERENCES public.tb_fornecedores(id) ON DELETE CASCADE
);

-- Table Triggers

create trigger trg_fornecedor_telefone_alt before
update
    on
    public.tb_fornecedor_telefone for each row execute function fn_atualiza_data_alteracao();


-- public.tb_itens_nfe definition

-- Drop table

-- DROP TABLE public.tb_itens_nfe;

CREATE TABLE public.tb_itens_nfe (
	id bigserial NOT NULL,
	nfe_id int8 NOT NULL,
	produto_id int8 NOT NULL,
	quantidade numeric(10, 3) NOT NULL,
	valor_unitario numeric(10, 2) NOT NULL,
	valor_total numeric(10, 2) NOT NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_itens_nfe_pkey PRIMARY KEY (id),
	CONSTRAINT tb_itens_nfe_nfe_id_fkey FOREIGN KEY (nfe_id) REFERENCES public.tb_nfe(id) ON DELETE CASCADE,
	CONSTRAINT tb_itens_nfe_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES public.tb_produtos(id)
);

-- Table Triggers

create trigger trg_itens_nfe_alt before
update
    on
    public.tb_itens_nfe for each row execute function fn_atualiza_data_alteracao();


-- public.tb_movimentacoes_nfe definition

-- Drop table

-- DROP TABLE public.tb_movimentacoes_nfe;

CREATE TABLE public.tb_movimentacoes_nfe (
	id bigserial NOT NULL,
	nfe_id int8 NOT NULL,
	data_movimentacao timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	status varchar(50) NOT NULL,
	descricao text NULL,
	data_cadastro timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	data_alteracao timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT tb_movimentacoes_nfe_pkey PRIMARY KEY (id),
	CONSTRAINT tb_movimentacoes_nfe_nfe_id_fkey FOREIGN KEY (nfe_id) REFERENCES public.tb_nfe(id) ON DELETE CASCADE
);

-- Table Triggers

create trigger trg_movimentacoes_nfe_alt before
update
    on
    public.tb_movimentacoes_nfe for each row execute function fn_atualiza_data_alteracao();



-- DROP FUNCTION public.fn_atualiza_data_alteracao();

CREATE OR REPLACE FUNCTION public.fn_atualiza_data_alteracao()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.data_alteracao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;
