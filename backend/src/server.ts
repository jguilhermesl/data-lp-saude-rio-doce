import "dotenv/config";
import express from "express"
import cors from "cors";
import { env } from "./env";
import { corsMiddleware } from "./middlewares/cors-middleware";

// Importar todas as rotas
import { routerAuth } from "./functions/auth/routes";
import { routerAppointments } from "./functions/appointments/routes";
// import { routerDoctors } from "./functions/doctors/routes";
import { routerPatients } from "./functions/patients/routes";
// import { routerProcedures } from "./functions/procedures/routes";
import { routerSpecialties } from "./functions/specialties/routes";
import { routerDashboard } from "./functions/dashboard/routes";
import { routerUsers } from "./functions/users/routes";
import { routerExpenses } from "./functions/expenses/routes";
import { routerFinancial } from "./functions/financial/routes";
import { routerDoctors } from "./functions/doctors/routes";
import { routerProcedures } from "./functions/procedures/routes";
import { routerSync } from "./functions/sync/routes";

const PORT = env.PORT;
const app = express();

app.use(cors());
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registrar todas as rotas
app.use(routerSync);
app.use(routerAuth);
app.use(routerUsers);
app.use(routerAppointments);
app.use(routerDoctors);
app.use(routerPatients);
app.use(routerProcedures);
app.use(routerSpecialties);
app.use(routerDashboard);
app.use(routerExpenses);
app.use(routerFinancial);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}!!!`));
