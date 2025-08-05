'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FilePlus,
  Trash2,
  FolderPlus,
  Save,
  TriangleAlert,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';

interface Doc {
  slug: string;
  title: string;
  content: string;
}

interface Category {
  categorySlug: string;
  categoryTitle: string;
  documents: Doc[];
}

type DocsData = Category[];

export default function ContentEditorPage() {
  const [data, setData] = useState<DocsData>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [selectedItem, setSelectedItem] = useState<{
    catIndex: number;
    docIndex: number | null;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'document';
    catIndex: number;
    docIndex?: number;
  } | null>(null);

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/docs');
      if (!response.ok) {
        throw new Error('Failed to fetch docs data');
      }
      const docsData = await response.json();
      setData(docsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: 'Could not fetch documentation from the server.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to save.'});
        return;
    }
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save data');
      }
      toast({
        title: 'Success!',
        description: 'Documentation has been saved successfully.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not save documentation.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    const newCategorySlug = `new-category-${data.length + 1}`;
    const newCategory: Category = {
      categorySlug: newCategorySlug,
      categoryTitle: 'New Category',
      documents: [],
    };
    setData([...data, newCategory]);
  };

  const handleAddDocument = (catIndex: number) => {
    const newDocSlug = `new-document-${data[catIndex].documents.length + 1}`;
    const newDocument: Doc = {
      slug: newDocSlug,
      title: 'New Document',
      content: '# New Document\n\nStart writing your content here.',
    };
    const newData = [...data];
    newData[catIndex].documents.push(newDocument);
    setData(newData);
    setSelectedItem({ catIndex, docIndex: newData[catIndex].documents.length - 1 });
  };
  
  const confirmDelete = () => {
    if (!deleteTarget) return;

    let newData = [...data];
    if (deleteTarget.type === 'category') {
        newData.splice(deleteTarget.catIndex, 1);
        if (selectedItem?.catIndex === deleteTarget.catIndex) {
            setSelectedItem(null);
        }
    } else if (deleteTarget.type === 'document' && deleteTarget.docIndex !== undefined) {
        newData[deleteTarget.catIndex].documents.splice(deleteTarget.docIndex, 1);
        if (selectedItem?.catIndex === deleteTarget.catIndex && selectedItem?.docIndex === deleteTarget.docIndex) {
            setSelectedItem(null);
        }
    }

    setData(newData);
    setDeleteTarget(null);
    toast({ title: "Deleted", description: "The item has been removed."})
  }
  
  const handleFieldChange = (field: string, value: string) => {
    if (!selectedItem) return;

    const { catIndex, docIndex } = selectedItem;
    const newData = [...data];
    
    if (docIndex === null) { 
        const category = newData[catIndex];
        if (field === 'categoryTitle') category.categoryTitle = value;
        if (field === 'categorySlug') category.categorySlug = value.toLowerCase().replace(/\s+/g, '-');
    } else { 
        const document = newData[catIndex].documents[docIndex];
        if (field === 'title') document.title = value;
        if (field === 'slug') document.slug = value.toLowerCase().replace(/\s+/g, '-');
        if (field === 'content') document.content = value;
    }
    
    setData(newData);
  };
  
  const toggleCategory = (categorySlug: string) => {
      const newSet = new Set(collapsedCategories);
      if (newSet.has(categorySlug)) {
          newSet.delete(categorySlug);
      } else {
          newSet.add(categorySlug);
      }
      setCollapsedCategories(newSet);
  }

  const selectedData = useMemo(() => {
    if (!selectedItem) return null;
    const { catIndex, docIndex } = selectedItem;
    if (docIndex === null) {
      return { type: 'category', data: data[catIndex] };
    }
    return { type: 'document', data: data[catIndex]?.documents[docIndex] };
  }, [selectedItem, data]);

  if (loading) {
    return (
       <Card>
        <CardHeader><CardTitle>Documentation Editor</CardTitle><CardDescription>Loading content...</CardDescription></CardHeader>
        <CardContent>
             <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1"><Skeleton className="h-96 w-full" /></div>
                <div className="md:col-span-2"><Skeleton className="h-96 w-full" /></div>
            </div>
        </CardContent>
       </Card>
    );
  }
  
  if (error) {
    return (
         <Card>
            <CardHeader><CardTitle>Documentation Editor</CardTitle></CardHeader>
            <CardContent>
                <div className="p-8 text-center border-2 border-dashed rounded-lg bg-destructive/10 text-destructive">
                    <TriangleAlert className="h-10 w-10 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Failed to Load</h3>
                    <p>{error}</p>
                    <Button onClick={fetchData} className="mt-4">Try Again</Button>
                </div>
            </CardContent>
         </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Documentation Editor</CardTitle>
                <CardDescription>
                Manage categories and documents. Changes are not saved until you hit the save button.
                </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
             <Button onClick={handleAddCategory} variant="outline" className="w-full mb-4">
                <FolderPlus className="mr-2 h-4 w-4"/>
                Add New Category
            </Button>
            <div className="border rounded-lg p-2 min-h-[500px] overflow-auto">
              {data.map((cat, catIndex) => (
                <div key={cat.categorySlug}>
                  <div className={cn(
                      "flex items-center justify-between p-2 rounded-md hover:bg-muted",
                      selectedItem?.catIndex === catIndex && selectedItem.docIndex === null && "bg-muted"
                  )}>
                    <button
                        onClick={() => toggleCategory(cat.categorySlug)}
                        className="flex items-center gap-2 flex-grow text-left"
                    >
                        {collapsedCategories.has(cat.categorySlug) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span className="font-semibold">{cat.categoryTitle}</span>
                    </button>
                    <button onClick={() => setSelectedItem({ catIndex, docIndex: null })} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                    <button onClick={() => setDeleteTarget({ type: 'category', catIndex})} className="p-1 hover:bg-destructive/20 rounded-md">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                  {!collapsedCategories.has(cat.categorySlug) && (
                      <div className="pl-4 border-l-2 ml-4">
                          {cat.documents.map((doc, docIndex) => (
                               <div key={doc.slug} className={cn(
                                   "flex items-center justify-between p-2 rounded-md hover:bg-muted",
                                   selectedItem?.catIndex === catIndex && selectedItem.docIndex === docIndex && "bg-muted"
                               )}>
                                    <button onClick={() => setSelectedItem({ catIndex, docIndex })} className="flex items-center gap-2 flex-grow text-left">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span>{doc.title}</span>
                                    </button>
                                     <button onClick={() => setDeleteTarget({ type: 'document', catIndex, docIndex })} className="p-1 hover:bg-destructive/20 rounded-md">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </button>
                               </div>
                          ))}
                          <Button onClick={() => handleAddDocument(catIndex)} variant="ghost" size="sm" className="w-full justify-start mt-1">
                                <FilePlus className="mr-2 h-4 w-4" /> Add Document
                          </Button>
                      </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            {selectedItem && selectedData ? (
                <div className="space-y-4">
                    {selectedData.type === 'category' ? (
                        <>
                            <h3 className="text-lg font-semibold">Editing Category: {selectedData.data.categoryTitle}</h3>
                             <div className="space-y-2">
                                <Label htmlFor="categoryTitle">Category Title</Label>
                                <Input id="categoryTitle" value={selectedData.data.categoryTitle} onChange={(e) => handleFieldChange('categoryTitle', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="categorySlug">Category Slug (URL)</Label>
                                <Input id="categorySlug" value={selectedData.data.categorySlug} onChange={(e) => handleFieldChange('categorySlug', e.target.value)} />
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold">Editing Document: {selectedData.data.title}</h3>
                             <div className="space-y-2">
                                <Label htmlFor="title">Document Title</Label>
                                <Input id="title" value={selectedData.data.title} onChange={(e) => handleFieldChange('title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Document Slug (URL)</Label>
                                <Input id="slug" value={selectedData.data.slug} onChange={(e) => handleFieldChange('slug', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content (Markdown)</Label>
                                <Textarea id="content" value={selectedData.data.content} onChange={(e) => handleFieldChange('content', e.target.value)} className="min-h-[400px] font-mono" />
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="text-center text-muted-foreground">
                        <p>Select a category or document to edit,</p>
                        <p>or create a new one.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </CardContent>
       <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the {deleteTarget?.type} and all its content.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Card>
  );
}
