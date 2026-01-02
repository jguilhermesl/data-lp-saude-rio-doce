# LP Saúde Rio Doce — Mapeamento do Banco (V1)

> Stack: PostgreSQL + Node.js + TypeScript + Next.js (Prisma recomendado)  
> Objetivo: armazenar dados do sistema atual da clínica (via ETL) e gerar relatórios.

---

## Convenções (ETL / Integração)

### Chaves do sistema atual
Para toda entidade importada do sistema da clínica:
- `externalId` = **código no sistema atual**
- `sourceSystem` = identificador do sistema de origem (ex.: `lp_saude_sistema_clinica`)
- Regra: `@@unique([externalId, sourceSystem])` para garantir **upsert idempotente**.

### Campos técnicos recomendados
- `id` (UUID, PK)
- `createdAt`, `updatedAt`
- `syncedAt` (última sincronização do registro)
- `rawPayload` (JSON opcional para debug/auditoria do ETL)

---

# Entidades

## 1) Patient (Paciente)

### Campos (origem)
- `externalId` (código do sistema do paciente)
- `fullName` (nome completo)
- `identityNumber` (identidade/RG)
- `cpf`
- `homePhone`
- `mobilePhone`

### Campos (técnicos)
- `id` (uuid)
- `sourceSystem`
- `syncedAt`
- `createdAt`, `updatedAt`
- `rawPayload` (opcional)

### Relações
- **Patient 1:N Appointment** (um paciente pode ter vários atendimentos)

---

## 2) Doctor (Médico)

### Campos (origem)
- `externalId` (código médico)
- `name`
- `crm`

### Campos (técnicos)
- `id` (uuid)
- `sourceSystem`
- `syncedAt`
- `createdAt`, `updatedAt`
- `rawPayload` (opcional)

### Relações
- **Doctor 1:N Appointment** (um médico pode ter vários atendimentos)
- **Doctor N:N Specialty** (um médico pode ter várias especialidades)

---

## 3) Specialty (Especialidade)

> Observação: no seu input, "ESPECIALIDADE" veio com `cod medico`.  
> Para modelagem correta e flexível, a relação de médico x especialidade deve ser N:N via tabela pivô.

### Campos (origem)
- `name`
- `acronym` (sigla)
- `description`
- `commissionValue` (valor comissão)
- `commissionType` (tipo comissão)

### Campos (técnicos)
- `id` (uuid)
- `externalId` (se existir no sistema da clínica; se não existir, gerar internamente)
- `sourceSystem`
- `syncedAt`
- `createdAt`, `updatedAt`
- `rawPayload` (opcional)

### Relações
- **Specialty N:N Doctor** (via `DoctorSpecialty`)
- (Opcional) **Specialty 1:N Appointment**  
  - Se o atendimento tiver uma especialidade “principal”, podemos ligar direto no Appointment.

---

## 4) DoctorSpecialty (Pivô Médico x Especialidade)

### Campos
- `id` (uuid) *(ou PK composta)*
- `doctorId` (FK -> Doctor.id)
- `specialtyId` (FK -> Specialty.id)

### Regras
- `@@unique([doctorId, specialtyId])`

### Relações
- **Doctor N:N Specialty**

---

## 5) Appointment (Atendimento)

### Campos (origem)
- `externalId` (código atendimento)
- `appointmentDate` (data atendimento)
- `appointmentTime` (hora atendimento)
- `createdDate` (data criação)
- `insuranceName` (convênio) *(texto por enquanto; pode virar tabela depois)*
- `examValue` (vlr exame)
- `paidValue` (vlr pago)
- `paymentDone` (pagamento realizado: boolean)
- `examsRaw` (exames) *(texto/JSON bruto do sistema atual, se vier assim)*

### Chaves / Relacionamentos (origem -> nosso banco)
- `patientId` (FK -> Patient.id)
- `doctorId` (FK -> Doctor.id)
- `responsibleUserId` (FK -> User.id) *(usuário responsável)*

### Campos (técnicos)
- `id` (uuid)
- `sourceSystem`
- `syncedAt`
- `createdAt`, `updatedAt`
- `rawPayload` (opcional)

### Relações
- **Appointment N:1 Patient**
- **Appointment N:1 Doctor**
- **Appointment N:1 User** (responsável)
- **Appointment N:N Procedure** (via `AppointmentProcedure`)
- (Opcional) **Appointment N:1 Specialty** *(se existir especialidade do atendimento)*

---

## 6) Procedure (Procedimento / Exame)

> Você citou "PROCEDIMENTO" anteriormente e em Atendimento aparece "exames".
> Para relatórios, o ideal é ter uma tabela própria para procedimentos/exames.

### Campos (origem)
- `name`
- (opcional) `code` (se existir no sistema atual)
- (opcional) `defaultPrice`

### Campos (técnicos)
- `id` (uuid)
- `externalId` (se existir)
- `sourceSystem`
- `syncedAt`
- `createdAt`, `updatedAt`
- `rawPayload` (opcional)

### Relações
- **Procedure N:N Appointment** (via `AppointmentProcedure`)

---

## 7) AppointmentProcedure (Pivô Atendimento x Procedimento)

### Campos
- `id` (uuid) *(ou PK composta)*
- `appointmentId` (FK -> Appointment.id)
- `procedureId` (FK -> Procedure.id)
- (opcional) `quantity`
- (opcional) `unitPrice`
- (opcional) `totalPrice`

### Regras
- `@@unique([appointmentId, procedureId])` *(ou incluir quantidade se precisar)*

---

## 8) User (Usuário do sistema novo)

> Essa entidade é do **nosso sistema**, não necessariamente vem do sistema da clínica.

### Campos
- `id` (uuid)
- `email` (unique)
- `passwordHash`
- `role` (ex.: `ADMIN`, `MANAGER`, `VIEWER`)
- `createdAt`
- `updatedAt`

### Relações
- **User 1:N Appointment** (um usuário pode ser responsável por vários atendimentos)

---

# Diagrama mental das relações (resumo)

- Patient **1:N** Appointment  
- Doctor **1:N** Appointment  
- User **1:N** Appointment  
- Doctor **N:N** Specialty (DoctorSpecialty)  
- Appointment **N:N** Procedure (AppointmentProcedure)  
- (Opcional) Specialty **1:N** Appointment (se o atendimento tiver uma especialidade principal)

---

# Observações importantes (para fechar o V1)

1) **Convênio**  
   - No V1 pode ser `insuranceName` (string).  
   - Se depois precisar de relatório por convênio com padronização, vira tabela `Insurance`.

2) **Exames no Atendimento**  
   - Se o sistema atual retorna lista estruturada, já populamos `Procedure` + `AppointmentProcedure`.  
   - Se retorna texto solto, guardamos em `examsRaw` e fazemos parsing depois.

3) **Data/Hora**
   - Recomendado salvar `appointmentAt` (timestamp) além de `appointmentDate` + `appointmentTime` para facilitar queries.

4) **Pagamentos**
   - `paymentDone` boolean + `paidValue`.
   - Se futuramente precisar histórico de parcelas, criar tabela `Payment`.

---

# Próximo passo (pra você continuar)
Se você mandar os campos que existem em **PROCEDIMENTOS** no sistema atual (além do nome), eu fecho a entidade Procedure com tudo certinho.
