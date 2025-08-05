'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, TriangleAlert } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { UserProfile } from '@/lib/types';
import { badgeRegistry } from '@/lib/badges';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/context/i18n-context';

function EditUserDialog({ user, isOpen, onOpenChange, onUserUpdate }: { user: UserProfile | null, isOpen: boolean, onOpenChange: (open: boolean) => void, onUserUpdate: (updatedUser: UserProfile) => void }) {
    const [formData, setFormData] = useState<Partial<UserProfile>>({});
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                bio: user.bio || '',
                location: user.location || '',
                role: user.role || 'user',
                badges: user.badges || [],
            });
        }
    }, [user]);

    const handleChange = (field: keyof Pick<UserProfile, 'displayName' | 'bio' | 'location' | 'role'>, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBadgeChange = (badgeId: string, checked: boolean) => {
        const currentBadges = new Set(formData.badges || []);
        if (checked) {
            currentBadges.add(badgeId);
        } else {
            currentBadges.delete(badgeId);
        }
        setFormData(prev => ({ ...prev, badges: Array.from(currentBadges) }));
    };

    const handleSave = async () => {
        if (!user || !auth.currentUser) return;
        setIsSaving(true);
        try {
            const idToken = await auth.currentUser.getIdToken();
            
            const roleChanged = user.role !== formData.role;
            if (roleChanged) {
                const roleRes = await fetch('/api/set-admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
                    body: JSON.stringify({ targetUid: user.uid, isAdmin: formData.role === 'admin' })
                });
                if (!roleRes.ok) throw new Error(t('admin.users.errors.role_update_failed'));
            }
            
            const profileUpdateData = {
                displayName: formData.displayName,
                bio: formData.bio,
                location: formData.location,
                badges: formData.badges,
            };

            const profileRes = await fetch('/api/set-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
                body: JSON.stringify({ targetUid: user.uid, updateData: profileUpdateData })
            });
            
             if (!profileRes.ok) throw new Error(t('admin.users.errors.profile_update_failed'));

            const updatedUserForUI: UserProfile = { ...user, ...formData };
            onUserUpdate(updatedUserForUI);
            toast({ title: t('admin.users.update_success_title'), description: t('admin.users.update_success_desc') });
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating user:", error);
            const errorMessage = error instanceof Error ? error.message : t('admin.users.errors.generic_update_failed');
            toast({ variant: "destructive", title: t('common.error'), description: errorMessage });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('admin.users.edit_dialog.title', { userName: user.displayName })}</DialogTitle>
                    <DialogDescription>{t('admin.users.edit_dialog.description')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 overflow-y-auto pr-4 -mr-2">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="displayName" className="text-right">{t('admin.users.edit_dialog.name_label')}</Label>
                        <Input id="displayName" value={formData.displayName || ''} onChange={(e) => handleChange('displayName', e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">{t('admin.users.edit_dialog.role_label')}</Label>
                        <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={t('admin.users.edit_dialog.role_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">{t('admin.users.roles.user')}</SelectItem>
                                <SelectItem value="admin">{t('admin.users.roles.admin')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right">{t('admin.users.edit_dialog.bio_label')}</Label>
                        <Textarea id="bio" value={formData.bio || ''} onChange={(e) => handleChange('bio', e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">{t('admin.users.edit_dialog.location_label')}</Label>
                        <Input id="location" value={formData.location || ''} onChange={(e) => handleChange('location', e.target.value)} className="col-span-3" />
                    </div>

                    <Separator className="my-2" />

                    <div>
                        <Label>{t('admin.users.edit_dialog.badge_title')}</Label>
                        <p className="text-sm text-muted-foreground">{t('admin.users.edit_dialog.badge_desc')}</p>
                        <div className="space-y-2 mt-2">
                            {Object.values(badgeRegistry).map(badge => (
                                <div key={badge.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`badge-${badge.id}`}
                                        checked={(formData.badges || []).includes(badge.id)}
                                        onCheckedChange={(checked) => handleBadgeChange(badge.id, !!checked)}
                                    />
                                    <label htmlFor={`badge-${badge.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {badge.title}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-auto pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
                    <Button onClick={handleSave} disabled={isSaving}>{isSaving ? t('common.saving') : t('common.save')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissionError, setPermissionError] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast();
    const { user: currentAdmin } = useAuth();
    const { t } = useTranslation();


    useEffect(() => {
        async function fetchUsers() {
            if (!db) {
                console.error("Firestore not initialized for UsersPage");
                setLoading(false);
                return;
            };
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef);
                const usersSnapshot = await getDocs(q);
                const usersList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
                setPermissionError(true);
                toast({ variant: "destructive", title: t('common.error'), description: t('admin.users.errors.fetch_failed') });
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [toast, t]);

    const handleEdit = (user: UserProfile) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (user: UserProfile) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        toast({ variant: "destructive", title: t('admin.users.delete_disabled_title'), description: t('admin.users.delete_disabled_desc') });
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
    };
    
    const handleUserUpdate = (updatedUser: UserProfile) => {
        setUsers(prev => prev.map(u => u.uid === updatedUser.uid ? updatedUser : u));
    };


    const LoadingSkeleton = () => (
        <TableBody>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </TableCell>
                    <TableCell className="font-medium">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-40" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-8 w-8" />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{t('admin.users.title')}</CardTitle>
                    <CardDescription>{t('admin.users.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    {permissionError && (
                         <Alert variant="destructive" className="mb-4">
                            <TriangleAlert className="h-4 w-4" />
                            <AlertTitle>{t('admin.users.permission_denied_title')}</AlertTitle>
                            <AlertDescription>
                                {t('admin.users.permission_denied_desc')}
                            </AlertDescription>
                         </Alert>
                    )}
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">{t('admin.users.table.image')}</span>
                                </TableHead>
                                <TableHead>{t('admin.users.table.name')}</TableHead>
                                <TableHead>{t('admin.users.table.role')}</TableHead>
                                <TableHead className="hidden md:table-cell">{t('admin.users.table.badges')}</TableHead>
                                <TableHead>
                                    <span className="sr-only">{t('admin.users.table.actions')}</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        {loading ? <LoadingSkeleton /> : (
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                                                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="font-medium">{user.displayName || t('admin.users.unnamed_user')}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role === 'admin' ? t('admin.users.roles.admin') : t('admin.users.roles.user')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="outline">{user.badges?.length || 0}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button
                                                    aria-haspopup="true"
                                                    size="icon"
                                                    variant="ghost"
                                                    disabled={user.uid === currentAdmin?.uid}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">{t('admin.users.table.toggle_menu')}</span>
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('admin.users.table.actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(user)}>{t('common.edit')}</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user)}>{t('common.delete')}</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        )}
                    </Table>
                     {!loading && users.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            {permissionError ? t('admin.users.no_data_permission') : t('admin.users.no_users_found')}
                        </div>
                    )}
                </CardContent>
            </Card>
            <EditUserDialog 
                user={selectedUser} 
                isOpen={isEditDialogOpen} 
                onOpenChange={setIsEditDialogOpen} 
                onUserUpdate={handleUserUpdate}
            />
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('admin.users.delete_confirm_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('admin.users.delete_confirm_desc')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">{t('admin.users.delete_understood_button')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
