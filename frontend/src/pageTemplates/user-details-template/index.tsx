'use client';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserDetailsTemplateProps {
  userId: string;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  accessType: 'Admin' | 'Membro';
  createdAt?: string;
  lastLogin?: string;
}

export const UserDetailsTemplate = ({ userId }: UserDetailsTemplateProps) => {
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(userId === 'new');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    accessType: 'Membro' as 'Admin' | 'Membro',
  });

  useEffect(() => {
    if (userId === 'new') {
      setLoading(false);
      return;
    }

    // TODO: Replace with real API call
    // Example: fetch(`/api/users/${userId}`).then(res => res.json())

    // Mock data for demonstration
    setTimeout(() => {
      const mockUser: UserDetails = {
        id: userId,
        name: 'Maria Silva',
        email: 'maria.silva@example.com',
        phone: '(21) 98765-4321',
        accessType: 'Admin',
        createdAt: '15/12/2025',
        lastLogin: '05/01/2026',
      };
      setUser(mockUser);
      setFormData({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        accessType: mockUser.accessType,
      });
      setLoading(false);
    }, 500);
  }, [userId]);

  const handleSave = () => {
    // TODO: Implement save logic with API call
    console.log('Saving user:', formData);

    if (userId === 'new') {
      // Create new user
      alert('Usuário criado com sucesso!');
      router.push('/company/users');
    } else {
      // Update existing user
      alert('Usuário atualizado com sucesso!');
      setIsEditing(false);
      if (user) {
        setUser({
          ...user,
          ...formData,
        });
      }
    }
  };

  const handleDelete = () => {
    // TODO: Implement delete logic with confirmation dialog
    if (confirm(`Tem certeza que deseja deletar o usuário ${user?.name}?`)) {
      console.log('Deleting user:', userId);
      // API call to delete user would go here
      alert('Usuário deletado com sucesso!');
      router.push('/company/users');
    }
  };

  const handleCancel = () => {
    if (userId === 'new') {
      router.push('/company/users');
    } else {
      setIsEditing(false);
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone,
          accessType: user.accessType,
        });
      }
    }
  };

  if (loading) {
    return (
      <PrivateLayout title="Detalhes do Usuário" description="Carregando...">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </PrivateLayout>
    );
  }

  const isNewUser = userId === 'new';
  const title = isNewUser ? 'Novo Usuário' : user?.name || 'Usuário';
  const description = isNewUser
    ? 'Preencha os dados para criar um novo usuário'
    : isEditing
    ? 'Edite os dados do usuário'
    : user?.email || '';

  return (
    <PrivateLayout title={title} description={description}>
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/company/users')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* User Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {isNewUser ? 'Dados do Novo Usuário' : 'Informações do Usuário'}
            </h3>
            {!isNewUser && !isEditing && (
              <Button onClick={() => setIsEditing(true)} size="sm">
                Editar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nome Completo *
              </label>
              {isEditing || isNewUser ? (
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Digite o nome completo"
                />
              ) : (
                <p className="text-base text-gray-900 py-2">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                E-mail *
              </label>
              {isEditing || isNewUser ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Digite o e-mail"
                />
              ) : (
                <p className="text-base text-gray-900 py-2">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Telefone *
              </label>
              {isEditing || isNewUser ? (
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <p className="text-base text-gray-900 py-2">{user?.phone}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo de Acesso *
              </label>
              {isEditing || isNewUser ? (
                <Select
                  value={formData.accessType}
                  onValueChange={(value: 'Admin' | 'Membro') =>
                    setFormData({ ...formData, accessType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Membro">Membro</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user?.accessType === 'Admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {user?.accessType}
                  </span>
                </div>
              )}
            </div>

            {!isNewUser && user?.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Data de Criação
                </label>
                <p className="text-base text-gray-900 py-2">{user.createdAt}</p>
              </div>
            )}

            {!isNewUser && user?.lastLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Último Acesso
                </label>
                <p className="text-base text-gray-900 py-2">{user.lastLogin}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {(isEditing || isNewUser) && (
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {isNewUser ? 'Criar Usuário' : 'Salvar Alterações'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              {!isNewUser && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="ml-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar Usuário
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};
