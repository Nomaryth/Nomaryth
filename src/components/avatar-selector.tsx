'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/context/i18n-context";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateAvatar } from "@/ai/flows/generate-avatar-flow";
import { Loader, Dices } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface AvatarSelectorProps {
  children: React.ReactNode;
  onAvatarSelect: (url: string) => void;
}

const AvatarGridSkeleton = () => (
    <div className="grid grid-cols-3 gap-4 py-4 justify-items-center">
        {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-24 rounded-full" />
        ))}
    </div>
)

export function AvatarSelector({ children, onAvatarSelect }: AvatarSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAvatars = async () => {
    setLoading(true);
    try {
        
        const avatarPromises = Array.from({ length: 6 }, () => generateAvatar());
        const results = await Promise.all(avatarPromises);
        const urls = results.map(res => res.url);
        setAvatars(Array.from(new Set(urls)));
    } catch (error) {
        console.error("Failed to fetch avatars", error);
        setAvatars([]); 
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
        fetchAvatars();
    }
  }, [isOpen]);
  
  const handleSelect = (url: string) => {
    setSelectedAvatar(url);
  };
  
  const handleConfirm = () => {
    if (selectedAvatar) {
        onAvatarSelect(selectedAvatar);
        setIsOpen(false);
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t('profile.avatar_selector.title')}</DialogTitle>
          <DialogDescription>{t('profile.avatar_selector.description')}</DialogDescription>
        </DialogHeader>
        
        {loading ? (
            <AvatarGridSkeleton />
        ) : (
            <div className="grid grid-cols-3 gap-4 py-4 justify-items-center">
                {avatars.map((url) => (
                    <button 
                        key={url} 
                        onClick={() => handleSelect(url)}
                        className={cn(
                            "h-24 w-24 rounded-full ring-2 ring-transparent hover:ring-accent focus:outline-none focus:ring-accent transition-all flex items-center justify-center",
                            selectedAvatar === url && "ring-accent ring-offset-2 ring-offset-background"
                        )}
                    >
                        <Avatar className="h-full w-full">
                            <AvatarImage src={url} alt="Avatar option" />
                            <AvatarFallback>
                                <Loader className="animate-spin" />
                            </AvatarFallback>
                        </Avatar>
                    </button>
                ))}
            </div>
        )}

        <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={fetchAvatars} disabled={loading}>
                <Dices className={cn("mr-2", loading && "animate-spin")} />
                {loading ? 'Gerando...' : 'Gerar Novos'}
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedAvatar || loading}>
                {t('profile.avatar_selector.confirm_button')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
