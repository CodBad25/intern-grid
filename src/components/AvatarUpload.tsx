
import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { LoadingSpinner } from './LoadingSpinner';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  displayName: string;
  color: string;
  onAvatarUpdate: (url: string) => void;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  displayName, 
  color, 
  onAvatarUpdate 
}: AvatarUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Aperçu de l'image
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!user || !fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    setIsUploading(true);

    try {
      // Supprimer l'ancien avatar s'il existe
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload du nouveau fichier
      const fileName = `avatar-${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl } as any)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onAvatarUpdate(data.publicUrl);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de la mise à jour de la photo');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAvatar = async () => {
    if (!user || !currentAvatarUrl) return;

    setIsUploading(true);
    try {
      // Supprimer le fichier du storage
      const oldPath = currentAvatarUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${oldPath}`]);
      }

      // Mettre à jour le profil
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null } as any)
        .eq('user_id', user.id);

      if (error) throw error;

      onAvatarUpdate('');
      toast.success('Photo de profil supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="w-20 h-20">
          <AvatarImage src={previewUrl || currentAvatarUrl} />
          <AvatarFallback 
            className="text-lg" 
            style={{ backgroundColor: color, color: 'white' }}
          >
            {displayName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        {!previewUrl && (
          <Button 
            size="sm" 
            variant="outline" 
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex gap-2">
            <Button onClick={uploadAvatar} disabled={isUploading} size="sm">
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Upload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Confirmer
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={cancelUpload} 
              disabled={isUploading}
              size="sm"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              size="sm"
            >
              <Camera className="w-4 h-4 mr-2" />
              Changer la photo
            </Button>
            
            {currentAvatarUrl && (
              <Button 
                variant="outline" 
                onClick={removeAvatar}
                disabled={isUploading}
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          JPG, PNG ou GIF. Taille max: 5MB
        </p>
      </div>
    </div>
  );
}
