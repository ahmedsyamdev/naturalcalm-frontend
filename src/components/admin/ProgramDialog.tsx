/**
 * Program Dialog Component
 * Dialog for adding and editing programs with multiple thumbnail uploads and drag-and-drop track ordering
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { AdminContentService, CreateProgramData } from '@/lib/api/services/admin';
import { Program, Track, Category } from '@/types';
import { Upload, Loader2, GripVertical, X, Search } from 'lucide-react';

interface ProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program?: Program;
  categories: Category[];
  onSuccess: () => void;
}

interface SortableTrackItemProps {
  track: Track;
  onRemove: () => void;
}

function SortableTrackItem({ track, onRemove }: SortableTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-white/80"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <img src={track.imageUrl} alt={track.title} className="w-12 h-12 rounded object-cover" />
      <div className="flex-1" style={{ fontFamily: 'Tajawal' }}>
        <div className="font-semibold text-sm">{track.title}</div>
        <div className="text-xs text-gray-600">{track.duration}</div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-600 hover:bg-red-50"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ProgramDialog({ open, onOpenChange, program, categories, onSuccess }: ProgramDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [showTrackSelector, setShowTrackSelector] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateProgramData>({
    defaultValues: program || { isPremium: false, isFeatured: false },
  });

  const isPremium = watch('isPremium');
  const isFeatured = watch('isFeatured');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadAvailableTracks();
  }, []);

  useEffect(() => {
    if (program) {
      // Extract category name if it's a populated object
      const categoryValue = typeof program.category === 'string'
        ? program.category
        : (program.category as any)?.name || '';

      // Remove tracks, trackIds, thumbnailImages from form data - they're managed separately
      const { tracks, trackIds, thumbnailImages, ...programWithoutTracks } = program as any;

      reset({
        ...programWithoutTracks,
        category: categoryValue,
      });
      setThumbnailPreviews(program.thumbnailImages || []);
      // Extract tracks from the nested trackId structure
      // Backend returns: { tracks: [{ trackId: Track, order: 1 }] }
      const extractedTracks = (program.tracks || [])
        .map((t: any) => t?.trackId || t) // Handle both { trackId: Track } and Track formats
        .filter((track: any) => track != null); // Filter out null/undefined tracks
      setSelectedTracks(extractedTracks);
    } else {
      reset({ isPremium: false, isFeatured: false });
      setThumbnailPreviews([]);
      setSelectedTracks([]);
    }
    setThumbnailFiles([]);
    setUploadProgress(0);
  }, [program, reset, open]);

  const loadAvailableTracks = async () => {
    try {
      const data = await AdminContentService.getTracks({ limit: 1000 });
      setAvailableTracks(data.tracks);
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'خطأ',
          description: 'يرجى اختيار ملفات صور صحيحة',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    setThumbnailFiles([...thumbnailFiles, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeThumbnail = (index: number) => {
    setThumbnailPreviews(prev => prev.filter((_, i) => i !== index));
    setThumbnailFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedTracks((tracks) => {
        const oldIndex = tracks.findIndex((t) => t && t.id === active.id);
        const newIndex = tracks.findIndex((t) => t && t.id === over.id);
        return arrayMove(tracks, oldIndex, newIndex);
      });
    }
  };

  const addTrack = (track: Track) => {
    if (track && !selectedTracks.find(t => t && t.id === track.id)) {
      setSelectedTracks([...selectedTracks, track]);
    }
    setShowTrackSelector(false);
    setTrackSearch('');
  };

  const removeTrack = (trackId: string) => {
    setSelectedTracks(selectedTracks.filter(t => t && t.id !== trackId));
  };

  const filteredTracks = availableTracks.filter(track =>
    track && track.title && track.title.toLowerCase().includes(trackSearch.toLowerCase()) &&
    !selectedTracks.find(t => t && t.id === track.id)
  );

  const onSubmit = async (data: CreateProgramData) => {
    try {
      setIsLoading(true);
      let thumbnailUrls = [...(program?.thumbnailImages || [])];

      if (thumbnailFiles.length > 0) {
        thumbnailUrls = [];
        for (const file of thumbnailFiles) {
          const uploadResponse = await AdminContentService.uploadImage(
            file,
            setUploadProgress
          );
          thumbnailUrls.push(uploadResponse.url);
        }
      }

      if (thumbnailUrls.length < 1) {
        toast({
          title: 'خطأ',
          description: 'يجب إضافة صورة واحدة على الأقل للبرنامج',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (selectedTracks.length === 0) {
        toast({
          title: 'خطأ',
          description: 'يجب إضافة مسار واحد على الأقل للبرنامج',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Remove tracks field and only send trackIds
      const { tracks: _, trackIds: __, ...dataWithoutTracks } = data as any;

      const programData = {
        ...dataWithoutTracks,
        thumbnailImages: thumbnailUrls,
        trackIds: selectedTracks.filter(t => t && t.id).map(t => t.id),
      };

      console.log('Sending program data:', programData);

      if (program) {
        await AdminContentService.updateProgram(program.id, programData);
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث البرنامج بنجاح',
        });
      } else {
        await AdminContentService.createProgram(programData);
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة البرنامج بنجاح',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ البرنامج',
        variant: 'destructive',
      });
      console.error('Error saving program:', error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right" style={{ fontFamily: 'Tajawal' }}>
            {program ? 'تعديل البرنامج' : 'إضافة برنامج جديد'}
          </DialogTitle>
          <DialogDescription className="text-right" style={{ fontFamily: 'Tajawal' }}>
            {program ? 'قم بتعديل بيانات البرنامج' : 'أضف برنامجاً جديداً'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              العنوان *
            </Label>
            <Input
              id="title"
              {...register('title', { required: 'العنوان مطلوب' })}
              className="bg-white/60 border-white/80 text-right"
              style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
              placeholder="مثال: برنامج التأمل الصباحي"
            />
            {errors.title && (
              <p className="text-sm text-red-500" style={{ fontFamily: 'Tajawal' }}>
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              الوصف
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="bg-white/60 border-white/80 text-right"
              style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
              placeholder="وصف البرنامج..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                التصنيف *
              </Label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                value={watch('category')}
              >
                <SelectTrigger className="bg-white/60 border-white/80" style={{ fontFamily: 'Tajawal' }}>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} style={{ fontFamily: 'Tajawal' }}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                المستوى *
              </Label>
              <Select
                onValueChange={(value) => setValue('level', value)}
                value={watch('level')}
              >
                <SelectTrigger className="bg-white/60 border-white/80" style={{ fontFamily: 'Tajawal' }}>
                  <SelectValue placeholder="اختر المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مبتدأ" style={{ fontFamily: 'Tajawal' }}>مبتدأ</SelectItem>
                  <SelectItem value="متوسط" style={{ fontFamily: 'Tajawal' }}>متوسط</SelectItem>
                  <SelectItem value="متقدم" style={{ fontFamily: 'Tajawal' }}>متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              صور البرنامج *
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {thumbnailPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeThumbnail(index)}
                    className="absolute top-1 left-1 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-24 bg-white/60 border-white/80 border-dashed"
                onClick={() => document.getElementById('thumbnails-upload')?.click()}
                style={{ fontFamily: 'Tajawal' }}
              >
                <Upload className="h-6 w-6" />
              </Button>
            </div>
            <input
              id="thumbnails-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleThumbnailChange}
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Tajawal' }}>
                  جاري رفع الصور... {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              المسارات ({selectedTracks.length}) *
            </Label>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/60 border-white/80"
              onClick={() => setShowTrackSelector(!showTrackSelector)}
              style={{ fontFamily: 'Tajawal' }}
            >
              <Search className="ml-2 h-4 w-4" />
              {showTrackSelector ? 'إخفاء البحث' : 'إضافة مسارات'}
            </Button>

            {showTrackSelector && (
              <div className="space-y-2 p-3 bg-white/40 rounded-lg border border-white/60">
                <Input
                  placeholder="ابحث عن مسار..."
                  value={trackSearch}
                  onChange={(e) => setTrackSearch(e.target.value)}
                  className="bg-white/60 border-white/80 text-right"
                  style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
                />
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {filteredTracks.slice(0, 10).map(track => (
                    <div
                      key={track.id}
                      className="flex items-center gap-2 p-2 bg-white/60 rounded hover:bg-white/80 cursor-pointer"
                      onClick={() => addTrack(track)}
                    >
                      <img src={track.imageUrl} alt={track.title} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1" style={{ fontFamily: 'Tajawal' }}>
                        <div className="text-sm font-semibold">{track.title}</div>
                        <div className="text-xs text-gray-600">{track.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedTracks.filter(t => t && t.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {selectedTracks.filter(track => track && track.id).map((track) => (
                    <SortableTrackItem
                      key={track.id}
                      track={track}
                      onRemove={() => removeTrack(track.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contentAccess" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                نوع الوصول *
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue('contentAccess', value);
                  // For backward compatibility, also set isPremium
                  setValue('isPremium', value !== 'free');
                }}
                value={watch('contentAccess') || 'free'}
              >
                <SelectTrigger className="bg-white/60 border-white/80" style={{ fontFamily: 'Tajawal' }}>
                  <SelectValue placeholder="اختر نوع الوصول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free" style={{ fontFamily: 'Tajawal' }}>
                    محتوى مجاني (متاح للجميع)
                  </SelectItem>
                  <SelectItem value="basic" style={{ fontFamily: 'Tajawal' }}>
                    اشتراك أساسي
                  </SelectItem>
                  <SelectItem value="premium" style={{ fontFamily: 'Tajawal' }}>
                    اشتراك مميز
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setValue('isFeatured', checked as boolean)}
                />
                <Label htmlFor="isFeatured" className="text-sm cursor-pointer" style={{ fontFamily: 'Tajawal' }}>
                  برنامج مميز (يظهر في القائمة الرئيسية)
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
              style={{ fontFamily: 'Tajawal' }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {program ? 'تحديث' : 'إضافة'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-white/60 border-white/80"
              style={{ fontFamily: 'Tajawal' }}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProgramDialog;
