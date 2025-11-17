/**
 * React Query hooks for User Profile
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileService } from '@/lib/api/services/ProfileService';
import { User, UpdateProfileData, UserPreferences } from '@/types';
import { toast } from '@/hooks/use-toast';
import { clearTokens } from '@/lib/api/tokens';

export const useProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => ProfileService.getProfile(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => ProfileService.updateProfile(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });

      const previousProfile = queryClient.getQueryData<User>(['profile']);

      queryClient.setQueryData<User>(['profile'], (old) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousProfile };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile);
      }
      toast({
        title: 'خطأ',
        description: 'فشل تحديث الملف الشخصي',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'نجح',
        description: 'تم تحديث الملف الشخصي بنجاح',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => ProfileService.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData<User>(['profile'], (old) => {
        if (!old) return old;
        return { ...old, avatarUrl: data.avatarUrl };
      });

      toast({
        title: 'نجح',
        description: 'تم تحديث الصورة الشخصية بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الصورة الشخصية',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: UserPreferences) =>
      ProfileService.updatePreferences(preferences),
    onSuccess: () => {
      toast({
        title: 'نجح',
        description: 'تم تحديث الإعدادات بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث الإعدادات',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => ProfileService.deleteAccount(password),
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      toast({
        title: 'نجح',
        description: 'تم حذف الحساب بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل حذف الحساب. تحقق من كلمة المرور',
        variant: 'destructive',
      });
    },
  });
};

export const useGenerateInvite = () => {
  return useMutation({
    mutationFn: () => ProfileService.generateInvite(),
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل إنشاء رمز الدعوة',
        variant: 'destructive',
      });
    },
  });
};
