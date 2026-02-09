# Endpoint de Sincronização

## Visão Geral

O endpoint `/sync/all` permite executar a sincronização completa de dados do sistema através de uma requisição HTTP, seguindo exatamente a mesma lógica e ordem do comando `npm run sync:all`.

## Endpoint

```
POST /sync/all
```

## Autenticação e Autorização

- ✅ Requer autenticação (Bearer Token)
- ✅ Requer permissão de ADMIN

## Funcionamento

### Ordem de Execução

O endpoint executa os scripts na seguinte ordem:

#### **FASE 1: Importações Base** (Sequencial)
1. `import-specialties` - Importa especialidades
2. `import-doctors` - Importa médicos
3. `import-patients` - Importa pacientes
4. `import-procedures` - Importa procedimentos

⚠️ **Importante**: Se qualquer script da Fase 1 falhar, a execução é interrompida e as fases seguintes NÃO são executadas.

#### **FASE 2: Relacionamentos Médico-Especialidade**
5. `import-doctor-specialties` - Relaciona médicos com especialidades

✅ Se falhar, continua para Fase 3

#### **FASE 3: Atendimentos**
6. `import-appointments` - Importa atendimentos

✅ Se falhar, continua para Fase 4

#### **FASE 4: Relacionamentos Appointment-Procedimentos**
7. `import-appointment-procedures` - Relaciona atendimentos com procedimentos

✅ Se falhar, finaliza com erro mas retorna estatísticas completas

### Diferença entre Desenvolvimento e Produção

O endpoint adapta automaticamente o comando de execução baseado na variável `NODE_ENV`:

- **Desenvolvimento** (`NODE_ENV=dev`): Usa `tsx` para executar arquivos TypeScript em `src/`
- **Produção** (`NODE_ENV=production`): Usa `node` para executar arquivos JavaScript compilados em `dist/`

## Exemplo de Requisição

```bash
curl -X POST http://localhost:3333/sync/all \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

## Exemplo de Resposta

### Sucesso (Status 200)

```json
{
  "success": true,
  "message": "Sincronização concluída com sucesso",
  "statistics": {
    "totalScripts": 7,
    "successCount": 7,
    "failureCount": 0,
    "totalDuration": "2m 45s",
    "totalDurationMs": 165000
  },
  "scripts": [
    {
      "name": "import-specialties",
      "success": true,
      "duration": "15s",
      "durationMs": 15000
    },
    // ... outros scripts
  ]
}
```

### Erro (Status 500)

```json
{
  "success": false,
  "message": "Sincronização concluída com erros",
  "statistics": {
    "totalScripts": 3,
    "successCount": 2,
    "failureCount": 1,
    "totalDuration": "45s",
    "totalDurationMs": 45000
  },
  "scripts": [
    {
      "name": "import-specialties",
      "success": true,
      "duration": "15s",
      "durationMs": 15000
    },
    {
      "name": "import-doctors",
      "success": false,
      "duration": "30s",
      "durationMs": 30000,
      "error": "Erro detalhado aqui..."
    }
  ]
}
```

## Comparação com npm run sync:all

| Aspecto | `npm run sync:all` | `POST /sync/all` |
|---------|-------------------|------------------|
| Ordem de execução | ✅ Mesma ordem | ✅ Mesma ordem |
| Tratamento de erros | ✅ Aborta Fase 1, continua demais | ✅ Aborta Fase 1, continua demais |
| Logs | Console colorido | Retorno JSON |
| Acesso | Terminal local | HTTP com autenticação |
| Uso | Desenvolvimento | Produção/Automação |

## Deploy em Produção

### Pré-requisitos

1. **Compilar o código**:
   ```bash
   npm run build
   ```
   
   Isso criará os arquivos JavaScript compilados em `dist/` usando o tsup.

2. **Configurar variável de ambiente**:
   ```bash
   NODE_ENV=production
   ```

3. **Iniciar o servidor**:
   ```bash
   npm start
   ```

### Verificação

Após o deploy, o endpoint automaticamente:
- Detectará que está em produção via `NODE_ENV`
- Usará `node` ao invés de `tsx`
- Executará os scripts compilados em `dist/` ao invés de `src/`

## Troubleshooting

### Erro: "Unauthorized"
- Verifique se o token JWT está sendo enviado no header `Authorization`
- Formato: `Bearer SEU_TOKEN`

### Erro: "Forbidden"
- Apenas usuários com role `ADMIN` podem executar este endpoint
- Verifique as permissões do usuário autenticado

### Erro: "Cannot find module"
- **Em desenvolvimento**: Certifique-se que `tsx` está instalado (`npm install`)
- **Em produção**: Execute `npm run build` antes de iniciar o servidor

### Timeout
- A sincronização completa pode levar vários minutos
- Configure o timeout do seu cliente HTTP adequadamente
- Considere aumentar o timeout do servidor se necessário

## Logs

Os logs de execução são capturados e retornados na resposta, mas não são exibidos no console do servidor. Se precisar de logs detalhados durante a execução, use `npm run sync:all` no terminal.
