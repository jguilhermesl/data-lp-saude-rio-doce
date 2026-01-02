# 📊 Clínica Analytics – Mapeamento de Telas & Estrutura de Dados

Este README documenta:

1. O **mapeamento das telas** principais do sistema.
2. A **visão do domínio** (médicos, pacientes, atendimentos, procedimentos, caixa).
3. Uma **primeira proposta de estrutura de dados** para banco e API, baseada nos modelos brutos existentes.

O foco do sistema é **gerar relatórios eficientes** para:
- Gestão da clínica;
- Acompanhamento de faturamento e produtividade;
- Manutenção do relacionamento com pacientes.

---

## 1. Visão Geral do Sistema

O sistema será uma plataforma de **gestão e análise** para clínicas, com foco em:

- Acompanhar **faturamento e volume de atendimentos** por:
  - Médico
  - Paciente
  - Procedimento
  - Convênio
  - Período

- Permitir filtros avançados para tomada de decisão.
- Gerar relatórios e dashboards para **gestores, médicos e equipe administrativa**.

---

## 2. Mapeamento de Telas

### 2.1. Médicos

#### 2.1.1. Listagem de Médicos

**Objetivo:** visualizar todos os médicos e o quanto cada um trouxe de faturamento para a clínica.

**Elementos principais:**
- Tabela com:
  - Nome do médico
  - Especialidades
  - Total de faturamento no período
  - Número de atendimentos no período (opcional, mas recomendado)
  - Ticket médio por atendimento (opcional)

**Filtros:**
- Período (data inicial / data final)
- Especialidade
- Convênio (opcional, se quiser ver faturamento por médico por convênio)

**Ações:**
- Ver detalhes do médico
- Exportar lista (CSV/PDF) com faturamento por médico no período

---

#### 2.1.2. Detalhes do Médico

**Objetivo:** visão detalhada da produtividade e faturamento de um médico específico.

**Informações:**
- Dados do médico:
  - Nome completo
  - CRM
  - Especialidades
  - Contatos
- Indicadores no topo (cards):
  - Faturamento total no período selecionado
  - Número de atendimentos
  - Ticket médio
  - Principais procedimentos realizados

**Seções:**
1. **Atendimentos realizados**
   - Listagem de atendimentos com:
     - Data/hora
     - Paciente
     - Convênio
     - Procedimento(s)
     - Valor cobrado (`vlr_exames`)
     - Valor pago (`vlr_pago`)
     - Status

2. **Filtros específicos:**
   - Período
   - Convênio
   - Tipo de procedimento

---

### 2.2. Pacientes

#### 2.2.1. Listagem de Pacientes

**Objetivo:** ver o quanto cada paciente já gastou na clínica e fazer segmentações.

**Elementos principais:**
- Tabela:
  - Nome do paciente
  - Convênio principal (se fizer sentido)
  - Total gasto no período
  - Número de atendimentos
  - Data do último atendimento

**Filtros:**
- Período (data dos atendimentos)
- Valor gasto (intervalo: mínimo/máximo)
- Convênio
- Especialidade (ex.: pacientes que fizeram cardiologia)

---

#### 2.2.2. Detalhes do Paciente

**Objetivo:** visão 360° de um paciente na clínica.

**Informações:**
- Dados do paciente (nome, contatos, convênio, etc. – a estruturar depois).
- Indicadores:
  - Total que já gastou na clínica (toda a vida)
  - Total gasto no período filtrado
  - Número de atendimentos
  - Principais médicos/procedimentos usados

**Seções:**
1. **Atendimentos do paciente**
   - Data/hora
   - Médico
   - Procedimento(s)
   - Convênio
   - Valor total da consulta/exame
   - Valor pago e forma de pagamento

---

### 2.3. Procedimentos

#### 2.3.1. Listagem de Procedimentos

**Objetivo:** entender quais procedimentos trazem mais faturamento e volume.

**Elementos principais:**
- Tabela:
  - Nome do procedimento
  - Especialidade (se aplicável)
  - Faturamento total no período
  - Número de atendimentos
  - Ticket médio

**Filtros:**
- Período
- Especialidade
- Convênio (se quiser ver desempenho por convênio)

---

#### 2.3.2. Detalhes do Procedimento

**Objetivo:** detalhar o uso e faturamento de um procedimento específico.

**Informações:**
- Nome do procedimento
- Especialidade
- Indicadores:
  - Faturamento no período
  - Número de vezes realizado
  - Ticket médio
  - Distribuição por convênio
  - Distribuição por médico

**Seções:**
- Lista de atendimentos em que o procedimento foi realizado.

---

### 2.4. Atendimentos

#### 2.4.1. Listagem de Atendimentos

**Objetivo:** visão operacional e analítica de todos os atendimentos.

**Elementos principais:**
- **Cards no topo com métricas:**
  - Faturamento total no período
  - Número de atendimentos
  - Ticket médio
  - Atendimentos por status (F, A, etc.) – se fizer sentido

- **Tabela:**
  - Data/hora
  - Paciente
  - Médico
  - Especialidade
  - Convênio
  - Procedimento(s)
  - Valor exames (`vlr_exames`)
  - Valor pago (`vlr_pago`)
  - Forma(s) de pagamento
  - Status

**Filtros:**
- Especialidade
- Data (intervalo)
- Paciente
- Médico
- Funcionário responsável (`txt_usuario_responsavel`)
- Convênio
- Status do atendimento

---

### 2.5. Caixa / Faturamento

#### 2.5.1. Dashboard de Caixa

**Objetivo:** visão macro de faturamento da clínica.

**Elementos principais:**
- **Gráfico de faturamento por mês** (linhas ou barras):
  - Eixo X: meses
  - Eixo Y: valor faturado (`sum(vlr_pago)`)

- Possíveis quebras:
  - Por convênio
  - Por tipo de procedimento
  - Por especialidade

- Atalhos para relatórios:
  - “Ver detalhes do mês”
  - “Exportar relatório de faturamento”

---

## 3. Modelos de Dados Brutos (Origem)

Abaixo, exemplos dos modelos que vêm do sistema atual/legado (provavelmente via JSON de API externa ou exportação).

### 3.1. Atendimento (modelo bruto)

```json
{
  "hii_cod_atendimento": "8077",
  "cod_atendimento": "8077",
  "hid_status": "F",
  "status": "F",
  "status_obs": "NAO DESTACAR",
  "txt_usuario_responsavel": "PATRICIA OLIVEIRA",
  "paciente": "LINDACI RAMOS DE BRITO",
  "medico": "ANDRE FELIPE DA SILVA MACEDO",
  "dat_atendimento": "03/12/2025",
  "hora_atendimento": "13:48:51",
  "dat_criacao": "03/12/2025",
  "convenio": "PARTICULAR",
  "botoes_acoes": "<a class=\"btn btn-warning btn-sm\"><i class=\"fa fa-money fa-lg\"></i></a><a class=\"btn btn-danger btn-sm\"><i class=\"fa fa-remove fa-lg\"></i></a>",
  "cod_pag_medico_reg": null,
  "vlr_exames": "140.00",
  "fnd_vlr_exames": "140,00",
  "vlr_pago": "140.00",
  "fnd_vlr_pago": "140,00",
  "exames": "CONSULTA CARDIOLOGISTA",
  "pagamentos_realizados": "CARTAO DEBITO (140.00)",
  "obs_pagto": "",
  "statusAtend": "<span class=\"btn btn-success btn-sm\"><strong>FECHADO</strong></span>"
}
