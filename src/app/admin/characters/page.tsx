"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
  role?: string;
  faction?: string;
  level?: number;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCharacters = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/characters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
      } else {
        console.error('Failed to fetch characters');
        setCharacters([]);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCharacters();
    }
  }, [user]);

  const saveCharacters = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/characters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ characters })
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Personagens salvos com sucesso!",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro!",
          description: error.error || "Erro ao salvar personagens",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving characters:', error);
      toast({
        title: "Erro!",
        description: "Erro ao salvar personagens",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCharacter = (index: number, field: keyof Character, value: any) => {
    const updatedCharacters = [...characters];
    updatedCharacters[index] = {
      ...updatedCharacters[index],
      [field]: value
    };
    setCharacters(updatedCharacters);
  };

  const addCharacter = () => {
    if (characters.length >= 10) {
      toast({
        title: "Limite atingido",
        description: "Máximo de 10 personagens permitido",
        variant: "destructive"
      });
      return;
    }

    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: '',
      description: '',
      image: '',
      role: '',
      faction: '',
      level: 1
    };

    setCharacters([...characters, newCharacter]);
  };

  const removeCharacter = (index: number) => {
    const updatedCharacters = characters.filter((_, i) => i !== index);
    setCharacters(updatedCharacters);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando personagens...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Personagens</h1>
        <div className="flex gap-2">
          <Button onClick={addCharacter} disabled={characters.length >= 10}>
            Adicionar Personagem
          </Button>
          <Button onClick={saveCharacters} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Todos'}
          </Button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Instruções:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Upload de imagens:</strong> Vá para <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="underline">Cloudinary.com</a></li>
          <li>• Faça upload da sua imagem</li>
          <li>• Copie a URL da imagem (deve conter "res.cloudinary.com")</li>
          <li>• Cole a URL no campo "URL da Imagem" abaixo</li>
          <li>• Máximo de 10 personagens permitido</li>
        </ul>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Nenhum personagem configurado</p>
            <Button onClick={addCharacter}>Adicionar Primeiro Personagem</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {characters.map((character, index) => (
            <Card key={character.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personagem {index + 1}</CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeCharacter(index)}
                  >
                    Remover
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${index}`}>Nome *</Label>
                    <Input
                      id={`name-${index}`}
                      value={character.name}
                      onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                      placeholder="Nome do personagem"
                      maxLength={50}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`role-${index}`}>Função</Label>
                    <Input
                      id={`role-${index}`}
                      value={character.role || ''}
                      onChange={(e) => updateCharacter(index, 'role', e.target.value)}
                      placeholder="Ex: Guerreiro, Mago, etc."
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`faction-${index}`}>Facção</Label>
                    <Input
                      id={`faction-${index}`}
                      value={character.faction || ''}
                      onChange={(e) => updateCharacter(index, 'faction', e.target.value)}
                      placeholder="Ex: Guardiões, Rebeldes, etc."
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`level-${index}`}>Nível</Label>
                    <Input
                      id={`level-${index}`}
                      type="number"
                      min="1"
                      max="100"
                      value={character.level || ''}
                      onChange={(e) => updateCharacter(index, 'level', parseInt(e.target.value) || undefined)}
                      placeholder="1-100"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`image-${index}`}>URL da Imagem (Cloudinary) *</Label>
                  <Input
                    id={`image-${index}`}
                    value={character.image}
                    onChange={(e) => updateCharacter(index, 'image', e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                    className="font-mono text-sm"
                  />
                  {character.image && !character.image.includes('res.cloudinary.com') && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ URL deve ser do Cloudinary (contendo "res.cloudinary.com")
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`description-${index}`}>Descrição *</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={character.description}
                    onChange={(e) => updateCharacter(index, 'description', e.target.value)}
                    placeholder="Descrição do personagem..."
                    maxLength={500}
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {character.description.length}/500 caracteres
                  </p>
                </div>

                {character.image && character.image.includes('res.cloudinary.com') && (
                  <div className="mt-4">
                    <Label>Preview da Imagem:</Label>
                    <div className="mt-2 w-32 h-40 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={character.image}
                        alt={character.name || 'Preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
