/**
 * Admin Categories Management Page
 * Full CRUD interface for managing content categories
 */

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { DataTable } from '@/components/admin/DataTable';
import { CategoryDialog } from '@/components/admin/CategoryDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AdminContentService } from '@/lib/api/services/admin';
import { Category } from '@/types';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await AdminContentService.getCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل التصنيفات',
        variant: 'destructive',
      });
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = () => {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await AdminContentService.deleteCategory(selectedCategory.id);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف التصنيف بنجاح',
      });
      loadCategories();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;

      toast({
        title: 'خطأ',
        description: errorMessage || 'فشل حذف التصنيف. قد يحتوي على محتوى مرتبط',
        variant: 'destructive',
      });
      console.error('Error deleting category:', error);
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'icon',
      header: 'الأيقونة',
      cell: ({ row }) => {
        if (row.original.icon && (row.original.icon.startsWith('http') || row.original.icon.startsWith('/'))) {
          return (
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/50 p-1">
              <img
                src={row.original.icon}
                alt="Icon"
                className="w-full h-full object-contain"
              />
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
            <span className="text-2xl">{row.original.icon || '📁'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'imageUrl',
      header: 'الصورة',
      cell: ({ row }) => {
        if (!row.original.imageUrl) return <span className="text-gray-400">-</span>;
        return (
          <img
            src={row.original.imageUrl}
            alt={row.original.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'الاسم',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900" style={{ fontFamily: 'Tajawal' }}>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'color',
      header: 'اللون',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${row.original.color}`} />
          <span className="text-xs text-gray-600" style={{ fontFamily: 'Tajawal' }}>
            {row.original.color}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
            className="hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.original);
            }}
            className="hover:bg-red-50 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Tajawal' }}>
            التصنيفات
          </h1>
          <p className="text-gray-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
            إدارة تصنيفات المحتوى
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/90"
          style={{ fontFamily: 'Tajawal' }}
        >
          <Plus className="ml-2 h-5 w-5" />
          إضافة تصنيف
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-lg">
          <div className="text-sm text-gray-600" style={{ fontFamily: 'Tajawal' }}>
            إجمالي التصنيفات
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2" style={{ fontFamily: 'Tajawal' }}>
            {categories.length}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="بحث عن تصنيف..."
        searchKey="name"
      />

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSuccess={loadCategories}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف التصنيف"
        description="هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن التراجع عن هذا الإجراء."
        warningMessage="تنبيه: إذا كان التصنيف يحتوي على محتوى (مسارات أو برامج)، سيفشل الحذف."
        onConfirm={handleDelete}
      />
    </div>
  );
}
