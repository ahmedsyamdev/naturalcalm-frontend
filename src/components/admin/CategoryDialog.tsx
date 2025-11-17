/**
 * Category Dialog Component
 * Dialog for adding and editing categories with image upload
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
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { AdminContentService, CreateCategoryData } from '@/lib/api/services/admin';
import { Category } from '@/types';
import { Upload, Loader2 } from 'lucide-react';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSuccess: () => void;
}

export function CategoryDialog({ open, onOpenChange, category, onSuccess }: CategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCategoryData>({
    defaultValues: category || {},
  });

  useEffect(() => {
    if (category) {
      reset(category);
      setImagePreview(category.imageUrl || null);
      setIconPreview(category.icon || null);
    } else {
      reset({});
      setImagePreview(null);
      setIconPreview(null);
    }
    setImageFile(null);
    setIconFile(null);
    setUploadProgress(0);
  }, [category, reset, open]);

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

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'خطأ',
          description: 'حجم الأيقونة يجب أن يكون أقل من 2 ميجابايت',
          variant: 'destructive',
        });
        return;
      }

      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateCategoryData) => {
    try {
      setIsLoading(true);

      if (!iconFile && !category?.icon && !iconPreview) {
        toast({
          title: 'خطأ',
          description: 'يرجى اختيار صورة للأيقونة',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      let imageUrl = category?.imageUrl || data.imageUrl;
      let iconUrl = category?.icon || data.icon;

      if (iconFile) {
        const uploadResponse = await AdminContentService.uploadImage(
          iconFile,
          setUploadProgress
        );
        iconUrl = uploadResponse.url;
      }

      if (imageFile) {
        const uploadResponse = await AdminContentService.uploadImage(
          imageFile,
          setUploadProgress
        );
        imageUrl = uploadResponse.url;
      }

      const categoryData = {
        ...data,
        icon: iconUrl,
        imageUrl,
      };

      if (category) {
        await AdminContentService.updateCategory(category.id, categoryData);
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث التصنيف بنجاح',
        });
      } else {
        await AdminContentService.createCategory(categoryData);
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة التصنيف بنجاح',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ التصنيف',
        variant: 'destructive',
      });
      console.error('Error saving category:', error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right" style={{ fontFamily: 'Tajawal' }}>
            {category ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </DialogTitle>
          <DialogDescription className="text-right" style={{ fontFamily: 'Tajawal' }}>
            {category ? 'قم بتعديل بيانات التصنيف' : 'أضف تصنيفاً جديداً للمحتوى'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              الاسم *
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'الاسم مطلوب' })}
              className="bg-white/60 border-white/80 text-right"
              style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
              placeholder="مثال: التأمل"
            />
            {errors.name && (
              <p className="text-sm text-red-500" style={{ fontFamily: 'Tajawal' }}>
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              الأيقونة *
            </Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="bg-white/60 border-white/80"
                onClick={() => document.getElementById('icon-upload')?.click()}
                style={{ fontFamily: 'Tajawal' }}
              >
                <Upload className="ml-2 h-4 w-4" />
                اختر أيقونة
              </Button>
              <input
                id="icon-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIconChange}
              />
              {iconPreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={iconPreview}
                    alt="Icon Preview"
                    className="h-12 w-12 object-cover rounded-lg bg-white p-1 border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIconFile(null);
                      setIconPreview(null);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Tajawal' }}>
              يُفضل صورة مربعة بحجم 70×70 بكسل أو أكبر (PNG أو SVG)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              اللون (فئة Tailwind) *
            </Label>
            <Input
              id="color"
              {...register('color', { required: 'اللون مطلوب' })}
              className="bg-white/60 border-white/80 text-right"
              style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
              placeholder="مثال: from-blue-400 to-purple-500"
            />
            {errors.color && (
              <p className="text-sm text-red-500" style={{ fontFamily: 'Tajawal' }}>
                {errors.color.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              ترتيب العرض
            </Label>
            <Input
              id="displayOrder"
              type="number"
              {...register('displayOrder', { valueAsNumber: true })}
              className="bg-white/60 border-white/80 text-right"
              style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
              صورة التصنيف
            </Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                className="bg-white/60 border-white/80"
                onClick={() => document.getElementById('image-upload')?.click()}
                style={{ fontFamily: 'Tajawal' }}
              >
                <Upload className="ml-2 h-4 w-4" />
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
                  className="h-16 w-16 object-cover rounded-lg"
                />
              )}
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Tajawal' }}>
                  جاري الرفع... {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
              style={{ fontFamily: 'Tajawal' }}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? 'تحديث' : 'إضافة'}
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

export default CategoryDialog;
