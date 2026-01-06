'use client';

import { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export function UsersTableFilters() {
  const router = useRouter();
  const [accessType, setAccessType] = useState<string>('');

  const handleRemoveFilters = () => {
    setAccessType('');
  };

  const handleCreateUser = () => {
    router.push('/company/users/new');
  };

  return (
    <form className="flex items-center gap-2">
      <span className="text-sm font-semibold">Filtros:</span>
      <Input placeholder="Nome do usuário" className="h-8 w-[280px]" />
      <Input placeholder="E-mail" className="h-8 w-[280px]" />

      <Select value={accessType} onValueChange={setAccessType}>
        <SelectTrigger className="h-8 w-[200px]">
          <SelectValue placeholder="Tipo de acesso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="membro">Membro</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="secondary" size="sm" type="submit">
        <Search className="mr-2 h-4 w-4" />
        Filtrar resultados
      </Button>
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={handleRemoveFilters}
      >
        <X className="mr-2 h-4 w-4" />
        Remover filtros
      </Button>
      <div className="flex-1" />
      <Button
        variant="default"
        size="sm"
        type="button"
        onClick={handleCreateUser}
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo usuário
      </Button>
    </form>
  );
}
