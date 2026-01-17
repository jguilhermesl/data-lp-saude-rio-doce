# Scripts de Importação e Sincronização

Este diretório contém scripts para importar dados do sistema S2Web para o banco de dados local.

## 📋 Scripts Disponíveis

### Scripts Individuais

Você pode executar cada script individualmente conforme necessário:

```bash
# Importar especialidades
npm run import:specialties

# Importar procedimentos/exames
npm run import:procedures

# Importar médicos
npm run import:doctors

# Importar pacientes
npm run import:patients

# Importar relacionamento médico-especialidades
npm run import:doctor-specialties

# Importar atendimentos
npm run import:appointments

# Importar relacionamento atendimento-procedimentos
npm run import:appointment-procedures
```

### Script de Sincronização Completa 🚀

O script `sync:all` executa todos os imports na ordem correta de forma **sequencial e automatizada**.

```bash
npm run sync:all
```

## 🔄 Ordem de Execução

O script de sincronização completa (`sync:all`) executa os imports em 3 fases:

### **FASE 1: Importações Base (Sequencial)** 📦

Scripts que não possuem dependências entre si são executados sequencialmente para evitar limite de conexões do banco:

- ✅ `import-specialties` - Importa especialidades
- ✅ `import-doctors` - Importa médicos
- ✅ `import-patients` - Importa pacientes  
- ✅ `import-procedures` - Importa procedimentos/exames

**Nota**: Executado sequencialmente para evitar o erro "too many clients" no banco de dados PostgreSQL. Cada script gerencia suas próprias conexões Prisma de forma eficiente.

### **FASE 2: Relacionamentos Médico-Especialidade** 🔗

Executa sequencialmente após a Fase 1:

- ✅ `import-doctor-specialties` - Cria relacionamentos entre médicos e suas especialidades

**Dependência**: Requer que médicos e especialidades já estejam importados.

### **FASE 3: Atendimentos** 📅

Executa sequencialmente após a Fase 2:

- ✅ `import-appointments` - Importa atendimentos

**Dependência**: Requer que médicos e pacientes já estejam importados para criar os relacionamentos corretamente.

### **FASE 4 (Opcional): Relacionamentos Atendimento-Procedimento** 🔗

Executa manualmente após os atendimentos e procedimentos estarem importados:

- ✅ `import-appointment-procedures` - Cria relacionamentos entre atendimentos e procedimentos

**Dependência**: Requer que atendimentos e procedimentos já estejam importados.

**Nota**: Este script analisa o campo `examsRaw` de cada atendimento (que pode conter um ou mais procedimentos separados por vírgula) e cria os relacionamentos correspondentes na tabela `appointment_procedures`. Procedimentos não encontrados no banco de dados serão listados ao final para verificação manual.

## 📊 Output do Script

O script de sincronização fornece:

- ✅ **Logs coloridos** em tempo real de cada script
- ✅ **Prefixos** identificando qual script está gerando cada log
- ✅ **Duração** de cada script individual
- ✅ **Resumo final** com estatísticas completas:
  - Total de scripts executados
  - Quantidade de sucessos e falhas
  - Tempo total de execução
  - Status detalhado de cada script

### Exemplo de Output:

```
╔═══════════════════════════════════════════════════════╗
║  🚀 SINCRONIZAÇÃO COMPLETA DE DADOS               ║
╚═══════════════════════════════════════════════════════╝

📦 FASE 1: Importações Base (Paralelo)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Executando 4 script(s) em paralelo...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Iniciando: import-doctors
▶ Iniciando: import-patients
▶ Iniciando: import-procedures
▶ Iniciando: import-specialties
  [import-doctors] 🚀 Iniciando importação de médicos...
  [import-patients] 🚀 Iniciando importação de pacientes...
  ...

✓ import-doctors concluído em 45.23s
✓ import-patients concluído em 52.11s
✓ import-procedures concluído em 38.90s
✓ import-specialties concluído em 12.45s

📦 FASE 2: Relacionamentos Médico-Especialidade
...

╔═══════════════════════════════════════════════════════╗
║  📊 RESUMO DA SINCRONIZAÇÃO                       ║
╚═══════════════════════════════════════════════════════╝

Scripts executados:

  ✓ SUCESSO  import-doctors                (45s)
  ✓ SUCESSO  import-patients               (52s)
  ✓ SUCESSO  import-procedures             (38s)
  ✓ SUCESSO  import-specialties            (12s)
  ✓ SUCESSO  import-doctor-specialties     (15s)
  ✓ SUCESSO  import-appointments           (120s)

Estatísticas:
  • Total de scripts: 6
  • Sucesso: 6
  • Falhas: 0
  • Tempo total: 4m 42s

✅ Sincronização concluída com sucesso!
```

## ⚠️ Tratamento de Erros

- Se houver **erros na Fase 1**, as fases 2 e 3 **não serão executadas** (pois dependem dos dados da Fase 1)
- Se houver **erro na Fase 2**, a Fase 3 **continuará sendo executada** (atendimentos podem ser importados mesmo sem relacionamento médico-especialidade completo)
- O script sempre mostra um **resumo parcial** dos scripts executados até o momento do erro

## 🎯 Quando Usar

### Use `sync:all` quando:
- ✅ Primeira sincronização completa do sistema
- ✅ Atualizações periódicas de todos os dados
- ✅ Recuperação após problemas
- ✅ Necessidade de dados atualizados rapidamente

### Use scripts individuais quando:
- ✅ Atualização específica de uma entidade
- ✅ Debugging de um import específico
- ✅ Reimportação após correção de erros
- ✅ Importação incremental de dados

## 🛠️ Configuração

Cada script utiliza:
- **API do S2Web** como fonte de dados
- **Tokens e credenciais** configurados diretamente nos scripts
- **Cookies de sessão** para autenticação
- **Prisma ORM** para manipulação do banco de dados
- **Upsert strategy** para evitar duplicatas

## 📝 Notas Técnicas

- Os scripts utilizam `Promise.allSettled()` para execução paralela, garantindo que erros em um script não afetem outros
- Cada script possui retry logic e tratamento de erros específico
- Logs detalhados são exibidos em tempo real para acompanhamento
- Delays entre requisições são aplicados para não sobrecarregar a API externa
- Cache de dados é utilizado quando possível para otimizar performance

## 🔐 Segurança

⚠️ **IMPORTANTE**: Os tokens e cookies de autenticação estão hardcoded nos scripts. Em produção, considere:
- Armazenar credenciais em variáveis de ambiente
- Implementar rotação de tokens
- Utilizar vault de secrets
- Adicionar rate limiting
