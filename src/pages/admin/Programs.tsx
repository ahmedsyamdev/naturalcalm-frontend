/**
 * Admin Programs Management Page
 * Full CRUD interface for managing programs with filters and pagination
 */

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { DataTable } from '@/components/admin/DataTable';
import { ProgramDialog } from '@/components/admin/ProgramDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AdminContentService } from '@/lib/api/services/admin';
import { Program, Category } from '@/types';
import { Plus, Pencil, Trash2, Loader2, Crown, Star } from 'lucide-react';

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>();
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    isPremium: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const loadPrograms = async () => {
    try {
      setIsLoading(true);
      const data = await AdminContentService.getPrograms({
        page: pagination.page,
        limit: 10,
        ...filters,
      });
      setPrograms(data.programs);
      setPagination({
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل البرامج',
        variant: 'destructive',
      });
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await AdminContentService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [filters, pagination.page]);

  const handleAdd = () => {
    setSelectedProgram(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
    setDialogOpen(true);
  };

  const handleDeleteClick = (program: Program) => {
    setSelectedProgram(program);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;

    try {
      await AdminContentService.deleteProgram(selectedProgram.id);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف البرنامج بنجاح',
      });
      loadPrograms();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;

      toast({
        title: 'خطأ',
        description: errorMessage || 'فشل حذف البرنامج',
        variant: 'destructive',
      });
      console.error('Error deleting program:', error);
    }
  };

  const columns: ColumnDef<Program>[] = [
    {
      accessorKey: 'thumbnailImages',
      header: 'الصور',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.thumbnailImages?.slice(0, 3).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${row.original.title} ${idx + 1}`}
              className="w-12 h-12 object-cover rounded"
            />
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'العنوان',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-gray-900 flex items-center gap-2" style={{ fontFamily: 'Tajawal' }}>
            {row.original.title}
            {row.original.isPremium && (
              <Crown className="h-4 w-4 text-yellow-500" />
            )}
            {row.original.isFeatured && (
              <Star className="h-4 w-4 text-primary" />
            )}
          </div>
          {row.original.description && (
            <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
              {row.original.description.substring(0, 60)}...
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'التصنيف',
      cell: ({ row }) => {
        const category = row.original.category as any;
        const categoryName = typeof category === 'string' ? category : category?.name || '';
        return (
          <Badge variant="outline" style={{ fontFamily: 'Tajawal' }}>
            {categoryName}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'level',
      header: 'المستوى',
      cell: ({ row }) => {
        const levelColors = {
          'مبتدأ': 'bg-green-100 text-green-800',
          'متوسط': 'bg-yellow-100 text-yellow-800',
          'متقدم': 'bg-red-100 text-red-800',
        };
        return (
          <Badge className={levelColors[row.original.level as keyof typeof levelColors]} style={{ fontFamily: 'Tajawal' }}>
            {row.original.level}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'sessions',
      header: 'الجلسات',
      cell: ({ row }) => (
        <span className="text-gray-700" style={{ fontFamily: 'Tajawal' }}>
          {row.original.sessions || row.original.tracks?.length || 0} جلسة
        </span>
      ),
    },
    {
      accessorKey: 'totalPlays',
      header: 'الاستماعات',
      cell: ({ row }) => (
        <span className="text-gray-700" style={{ fontFamily: 'Tajawal' }}>
          {row.original.totalPlays}
        </span>
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

  if (isLoading && programs.length === 0) {
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
            البرامج
          </h1>
          <p className="text-gray-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
            إدارة البرامج والدورات
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/90"
          style={{ fontFamily: 'Tajawal' }}
        >
          <Plus className="ml-2 h-5 w-5" />
          إضافة برنامج
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-lg">
          <div className="text-sm text-gray-600" style={{ fontFamily: 'Tajawal' }}>
            إجمالي البرامج
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2" style={{ fontFamily: 'Tajawal' }}>
            {pagination.total}
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-[200px] bg-white/40 backdrop-blur-md border-white/60" style={{ fontFamily: 'Tajawal' }}>
            <SelectValue placeholder="جميع التصنيفات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" style={{ fontFamily: 'Tajawal' }}>جميع التصنيفات</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name} style={{ fontFamily: 'Tajawal' }}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.level || 'all'}
          onValueChange={(value) => setFilters({ ...filters, level: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-[200px] bg-white/40 backdrop-blur-md border-white/60" style={{ fontFamily: 'Tajawal' }}>
            <SelectValue placeholder="جميع المستويات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" style={{ fontFamily: 'Tajawal' }}>جميع المستويات</SelectItem>
            <SelectItem value="مبتدأ" style={{ fontFamily: 'Tajawal' }}>مبتدأ</SelectItem>
            <SelectItem value="متوسط" style={{ fontFamily: 'Tajawal' }}>متوسط</SelectItem>
            <SelectItem value="متقدم" style={{ fontFamily: 'Tajawal' }}>متقدم</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.isPremium || 'all'}
          onValueChange={(value) => setFilters({ ...filters, isPremium: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-[200px] bg-white/40 backdrop-blur-md border-white/60" style={{ fontFamily: 'Tajawal' }}>
            <SelectValue placeholder="نوع المحتوى" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" style={{ fontFamily: 'Tajawal' }}>جميع الأنواع</SelectItem>
            <SelectItem value="true" style={{ fontFamily: 'Tajawal' }}>محتوى مميز</SelectItem>
            <SelectItem value="false" style={{ fontFamily: 'Tajawal' }}>محتوى مجاني</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={programs}
        searchPlaceholder="بحث عن برنامج..."
        searchKey="title"
      />

      <ProgramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        program={selectedProgram}
        categories={categories}
        onSuccess={loadPrograms}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف البرنامج"
        description="هل أنت متأكد من حذف هذا البرنامج؟ لا يمكن التراجع عن هذا الإجراء."
        warningMessage="تنبيه: سيتم حذف البرنامج من جميع المفضلات والاشتراكات المرتبطة."
        onConfirm={handleDelete}
      />
    </div>
  );
}
