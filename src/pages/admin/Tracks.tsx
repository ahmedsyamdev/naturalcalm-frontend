/**
 * Admin Tracks Management Page
 * Full CRUD interface for managing audio tracks with filters and pagination
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
import { TrackDialog } from '@/components/admin/TrackDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { AdminContentService } from '@/lib/api/services/admin';
import { Track, Category } from '@/types';
import { Plus, Pencil, Trash2, Loader2, Crown } from 'lucide-react';

export default function Tracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | undefined>();
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

  const loadTracks = async () => {
    try {
      setIsLoading(true);
      const data = await AdminContentService.getTracks({
        page: pagination.page,
        limit: 10,
        ...filters,
      });
      setTracks(data.tracks);
      setPagination({
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المسارات',
        variant: 'destructive',
      });
      console.error('Error loading tracks:', error);
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
    loadTracks();
  }, [filters, pagination.page]);

  const handleAdd = () => {
    setSelectedTrack(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (track: Track) => {
    setSelectedTrack(track);
    setDialogOpen(true);
  };

  const handleDeleteClick = (track: Track) => {
    setSelectedTrack(track);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTrack) return;

    try {
      await AdminContentService.deleteTrack(selectedTrack.id);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف المسار بنجاح',
      });
      loadTracks();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;

      toast({
        title: 'خطأ',
        description: errorMessage || 'فشل حذف المسار',
        variant: 'destructive',
      });
      console.error('Error deleting track:', error);
    }
  };

  const columns: ColumnDef<Track>[] = [
    {
      accessorKey: 'imageUrl',
      header: 'الصورة',
      cell: ({ row }) => (
        <img
          src={row.original.imageUrl}
          alt={row.original.title}
          className="w-16 h-16 object-cover rounded-lg"
        />
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
      accessorKey: 'duration',
      header: 'المدة',
      cell: ({ row }) => (
        <span className="text-gray-700" style={{ fontFamily: 'Tajawal' }}>
          {row.original.duration}
        </span>
      ),
    },
    {
      accessorKey: 'plays',
      header: 'الاستماعات',
      cell: ({ row }) => (
        <span className="text-gray-700" style={{ fontFamily: 'Tajawal' }}>
          {row.original.plays}
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

  if (isLoading && tracks.length === 0) {
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
            المسارات الصوتية
          </h1>
          <p className="text-gray-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
            إدارة المسارات الصوتية
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/90"
          style={{ fontFamily: 'Tajawal' }}
        >
          <Plus className="ml-2 h-5 w-5" />
          إضافة مسار
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-lg">
          <div className="text-sm text-gray-600" style={{ fontFamily: 'Tajawal' }}>
            إجمالي المسارات
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
        data={tracks}
        searchPlaceholder="بحث عن مسار..."
        searchKey="title"
      />

      <TrackDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        track={selectedTrack}
        categories={categories}
        onSuccess={loadTracks}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف المسار"
        description="هل أنت متأكد من حذف هذا المسار؟ لا يمكن التراجع عن هذا الإجراء."
        warningMessage="تنبيه: سيتم حذف المسار من جميع المفضلات والبرامج المرتبطة."
        onConfirm={handleDelete}
      />
    </div>
  );
}
