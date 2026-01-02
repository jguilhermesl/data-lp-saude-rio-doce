import { DoctorsList } from "./doctors-list";
import { DoctorsTableFilters } from "./doctors-table-filter";
import { PrivateLayout } from "@/components/private-layout";

export const DoctorsTemplate = () => {
  return (
    <PrivateLayout
      title="Médicos"
      description="Crie, edite e delete seus médicos">
      <div className="flex flex-col gap-4">
        <DoctorsTableFilters />
        <DoctorsList />
      </div>
    </PrivateLayout>
  );
};
