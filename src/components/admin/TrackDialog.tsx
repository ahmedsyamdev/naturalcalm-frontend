/**
 * Track Dialog Component
 * Dialog for adding and editing tracks with image and audio uploads
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { toast } from '@/hooks/use-toast';
import { AdminContentService, CreateTrackData } from '@/lib/api/services/admin';
import { Track, Category } from '@/types';
import { Upload, Loader2, Music, Image as ImageIcon } from 'lucide-react';

interface TrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track?: Track;
  categories: Category[];
  onSuccess: () => void;
}

export function TrackDialog({ open, onOpenChange, track, categories, onSuccess }: TrackDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateTrackData>({
    defaultValues: track || { isPremium: false },
  });

  const isPremium = watch('isPremium');

  useEffect(() => {
    if (track) {
      // Extract category name if it's a populated object
      const categoryValue = typeof track.category === 'string'
        ? track.category
        : (track.category as any)?.name || '';

      // Don't include duration or durationSeconds in form data - they're managed separately
      const { duration, durationSeconds, ...trackWithoutDuration } = track as any;

      reset({
        ...trackWithoutDuration,
        category: categoryValue,
      });
      setImagePreview(track.imageUrl || null);

      // Store the actual duration in seconds for later use
      if (track.durationSeconds) {
        setAudioDuration(track.durationSeconds);
      } else if (durationSeconds) {
        setAudioDuration(durationSeconds);
      }
    } else {
      reset({ isPremium: false });
      setImagePreview(null);
    }
    setImageFile(null);
    setAudioFile(null);
    if (!track) {
      setAudioDuration(null);
    }
    setImageUploadProgress(0);
    setAudioUploadProgress(0);
  }, [track, reset, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'خطأ',
          description: 'يرجى اختيار ملف صورة صحيح',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'خطأ',
          description: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت',
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'خطأ',
          description: 'يرجى اختيار ملف صوتي صحيح (MP3, WAV)',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'خطأ',
          description: 'حجم الملف الصوتي يجب أن يكون أقل من 50 ميجابايت',
          variant: 'destructive',
        });
        return;
      }

      setAudioFile(file);

      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        setAudioDuration(Math.round(audio.duration));
      };
    }
  };

  const onSubmit = async (data: CreateTrackData) => {
    try {
      setIsLoading(true);
      let imageUrl = track?.imageUrl || data.imageUrl;
      let audioUrl = track?.audioUrl || data.audioUrl;

      // Use duration from state (set from audio file or existing track)
      let duration = audioDuration;

      // If no duration available, this is an error
      if (!duration) {
        toast({
          title: 'خطأ',
          description: 'لم يتم تحديد مدة المسار. يرجى رفع ملف صوتي.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (imageFile) {
        const uploadResponse = await AdminContentService.uploadImage(
          imageFile,
          setImageUploadProgress
        );
        imageUrl = uploadResponse.url;
      }

      if (audioFile) {
        const uploadResponse = await AdminContentService.uploadAudio(
          audioFile,
          setAudioUploadProgress
        );
        audioUrl = uploadResponse.url;
        duration = uploadResponse.duration || duration;
      }

      if (!imageUrl) {
        toast({
          title: 'خطأ',
          description: 'يجب إضافة صورة للمسار',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!audioUrl) {
        toast({
          title: 'خطأ',
          description: 'يجب إضافة ملف صوتي للمسار',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Remove duration field and only send durationSeconds
      const { duration: _, ...dataWithoutDuration } = data as any;

      const trackData = {
        ...dataWithoutDuration,
        imageUrl,
        audioUrl,
        durationSeconds: duration, // Send as durationSeconds for backend
      };

      console.log('Sending track data:', trackData);

      if (track) {
        await AdminContentService.updateTrack(track.id, trackData);
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث المسار بنجاح',
        });
      } else {
        await AdminContentService.createTrack(trackData);
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة المسار بنجاح',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ المسار',
        variant: 'destructive',
      });
      console.error('Error saving track:', error);
    } finally {
      setIsLoading(false);
      setImageUploadProgress(0);
      setAudioUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right" style={{ fontFamily: 'Tajawal' }}>
            {track ? 'تعديل المسار' : 'إضافة مسار جديد'}
          </DialogTitle>
          <DialogDescription className="text-right" style={{ fontFamily: 'Tajawal' }}>
            {track ? 'قم بتعديل بيانات المسار' : 'أضف مساراً صوتياً جديداً'}
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
              placeholder="مثال: تأمل الصباح"
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
              placeholder="وصف المسار..."
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
              {errors.category && (
                <p className="text-sm text-red-500" style={{ fontFamily: 'Tajawal' }}>
                  {errors.category.message}
                </p>
              )}
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
            <Label htmlFor="relaxationType" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              نوع الاسترخاء
            </Label>
            <Select
              onValueChange={(value) => setValue('relaxationType', value)}
              value={watch('relaxationType')}
            >
              <SelectTrigger className="bg-white/60 border-white/80" style={{ fontFamily: 'Tajawal' }}>
                <SelectValue placeholder="اختر نوع الاسترخاء (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="استرخاء صباحي" style={{ fontFamily: 'Tajawal' }}>استرخاء صباحي</SelectItem>
                <SelectItem value="استرخاء مسائي" style={{ fontFamily: 'Tajawal' }}>استرخاء مسائي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              صورة المسار *
            </Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="bg-white/60 border-white/80"
                onClick={() => document.getElementById('image-upload')?.click()}
                style={{ fontFamily: 'Tajawal' }}
              >
                <ImageIcon className="ml-2 h-4 w-4" />
                اختر صورة
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg"
                />
              )}
            </div>
            {imageUploadProgress > 0 && imageUploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={imageUploadProgress} className="h-2" />
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Tajawal' }}>
                  جاري رفع الصورة... {imageUploadProgress}%
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              الملف الصوتي *
            </Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="bg-white/60 border-white/80"
                onClick={() => document.getElementById('audio-upload')?.click()}
                style={{ fontFamily: 'Tajawal' }}
              >
                <Music className="ml-2 h-4 w-4" />
                اختر ملف صوتي
              </Button>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioChange}
              />
              {(audioFile || track?.audioUrl) && (
                <div className="text-sm" style={{ fontFamily: 'Tajawal' }}>
                  {audioFile ? audioFile.name : (
                    <span className="text-gray-600">
                      ملف صوتي موجود
                    </span>
                  )}
                  {audioDuration && (
                    <span className="text-gray-600 mr-2">
                      ({Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')} د)
                    </span>
                  )}
                </div>
              )}
            </div>
            {audioUploadProgress > 0 && audioUploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={audioUploadProgress} className="h-2" />
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Tajawal' }}>
                  جاري رفع الملف الصوتي... {audioUploadProgress}%
                </p>
              </div>
            )}
          </div>

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

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
              style={{ fontFamily: 'Tajawal' }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {track ? 'تحديث' : 'إضافة'}
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

export default TrackDialog;
