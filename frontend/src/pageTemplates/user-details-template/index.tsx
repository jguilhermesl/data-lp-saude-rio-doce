/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { usersApi, User } from '@/services/api/users';
import { toast } from 'sonner';

interface UserDetailsTemplateProps {
  userId: string;
}

export const UserDetailsTemplate = ({ userId }: UserDetailsTemplateProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(userId === 'new');

  // TODO: Get user role from auth context
  const isAdmin = true; // This should come from authentication context

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER' as 'ADMIN' | 'MANAGER' | 'VIEWER',
    phone: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      if (userId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch user from API
        const response = await usersApi.getAll();
        const foundUser = response.users.find((u) => u.id === userId);

        if (foundUser) {
          setUser(foundUser);
          setFormData({
            name: foundUser.name || '',
            email: foundUser.email,
            password: '', // Never pre-fill password
            role: foundUser.role,
            phone: foundUser.phone || '',
          });
        } else {
          alert('Usuário não encontrado!');
          router.push('/users');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        alert('Erro ao carregar usuário. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, router]);

  const handleSave = async () => {
    // Validate form
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório!');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('E-mail é obrigatório!');
      return;
    }
    if (userId === 'new' && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários!');
      return;
    }

    try {
      setSaving(true);

      if (userId === 'new') {
        // Create new user
        await usersApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone || undefined,
        });
        toast.success('Usuário criado com sucesso!');
        router.push('/users');
      } else {
        // Update existing user
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || undefined,
        };

        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        const updatedUser = await usersApi.update(userId, updateData);
        setUser(updatedUser);
        toast.success('Usuário atualizado com sucesso!');
        setIsEditing(false);
        // Clear password field after update
        setFormData((prev) => ({ ...prev, password: '' }));
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(
        error?.response?.data?.message ||
          'Erro ao salvar usuário. Tente novamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    toast(`Tem certeza que deseja deletar o usuário ${user?.name}?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Confirmar',
        onClick: async () => {
          try {
            setDeleting(true);
            await usersApi.delete(userId);
            toast.success('Usuário deletado com sucesso!');
            router.push('/users');
          } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error(
              error?.response?.data?.message ||
                'Erro ao deletar usuário. Tente novamente.',
            );
            setDeleting(false);
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  const handleCancel = () => {
    if (userId === 'new') {
      router.push('/users');
    } else {
      setIsEditing(false);
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email,
          password: '',
          role: user.role,
          phone: user.phone || '',
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

  // Redirect if not admin
  if (!isAdmin) {
    router.push('/users');
    return null;
  }

  const isNewUser = userId === 'new';
  const title = isNewUser ? 'Novo Usuário' : user?.name || 'Usuário';
  const description = isNewUser
    ? 'Preencha os dados para criar um novo usuário'
    : isEditing
      ? 'Edite os dados do usuário'
      : user?.email || '';

  const getRoleName = (role: string) => {
    const roleNames = {
      ADMIN: 'Administrador',
      VIEWER: 'Visualizador',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      ADMIN: 'bg-purple-100 text-purple-700',
      MANAGER: 'bg-blue-100 text-blue-700',
      VIEWER: 'bg-gray-100 text-gray-700',
    };
    return (
      roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-700'
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Aplica a máscara ## #####-####
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  return (
    <PrivateLayout title={title} description={description}>
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/users')}
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
                  disabled={saving || deleting}
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
                  disabled={saving || deleting}
                />
              ) : (
                <p className="text-base text-gray-900 py-2">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {isNewUser
                  ? 'Senha *'
                  : 'Nova Senha (deixe em branco para manter)'}
              </label>
              {isEditing || isNewUser ? (
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    isNewUser ? 'Digite a senha' : 'Digite a nova senha'
                  }
                  disabled={saving || deleting}
                />
              ) : (
                <p className="text-base text-gray-400 py-2">••••••••</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Função *
              </label>
              {isEditing || isNewUser ? (
                <Select
                  value={formData.role}
                  onValueChange={(value: 'ADMIN' | 'MANAGER' | 'VIEWER') =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={saving || deleting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="VIEWER">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role || '')}`}
                  >
                    {getRoleName(user?.role || '')}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Telefone
              </label>
              {isEditing || isNewUser ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="11 98765-4321"
                  maxLength={14}
                  disabled={saving || deleting}
                />
              ) : (
                <p className="text-base text-gray-900 py-2">
                  {user?.phone || '-'}
                </p>
              )}
            </div>

            {!isNewUser && user?.createdAt && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Data de Criação
                </label>
                <p className="text-base text-gray-900 py-2">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            )}

            {!isNewUser && user?.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Última Atualização
                </label>
                <p className="text-base text-gray-900 py-2">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            )}

            {!isNewUser && user?.active !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <div className="py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {(isEditing || isNewUser) && (
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button onClick={handleSave} disabled={saving || deleting}>
                <Save className="mr-2 h-4 w-4" />
                {saving
                  ? 'Salvando...'
                  : isNewUser
                    ? 'Criar Usuário'
                    : 'Salvar Alterações'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving || deleting}
              >
                Cancelar
              </Button>
              {!isNewUser && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="ml-auto"
                  disabled={saving || deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Deletando...' : 'Deletar Usuário'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};
