"use client"
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

export const DoctorsTableRow = () => {
  const router = useRouter()
  
  return (
    <TableRow>
      <TableCell className="font-mono">0321cjlas39210</TableCell>
      <TableCell className="font-medium">Rafael</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          <span className="font-medium text-muted-foreground">Ativo</span>
        </div>
      </TableCell>
      <TableCell className="font-medium">R$ 49,90</TableCell>
      <TableCell>
        <Button variant="outline" size="sm" onClick={()=> router.push("/company/edit-product")} >
          <Edit className="mr-2 h-3 w-3"  />
          Editar
        </Button>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">
          <Trash className="mr-2 h-3 w-3" />
          Deletar
        </Button>
      </TableCell>
    </TableRow>
  );
};
