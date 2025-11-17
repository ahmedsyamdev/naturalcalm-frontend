/**
 * MyPrograms Page
 * User's personal programs with progress tracking and custom playlists
 */

import { useState } from "react";
import { ArrowRight, Bell, Heart, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";
import {
  useEnrolledPrograms,
  useCustomPrograms,
  useDeleteCustomProgram
} from "@/hooks/queries/useUserPrograms";
import { useToast } from "@/hooks/use-toast";

const MyPrograms = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-programs");
  const { toast } = useToast();

  const {
    data: enrolledPrograms,
    isLoading: enrolledLoading,
    error: enrolledError
  } = useEnrolledPrograms();

  const {
    data: customPrograms,
    isLoading: customLoading,
    error: customError
  } = useCustomPrograms();

  const deleteCustomProgramMutation = useDeleteCustomProgram();

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button 
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
                onClick={() => navigate("/favorites")}
              >
                <Heart className="w-4.5 h-4.5 text-primary" />
              </button>
            <button 
              onClick={() => navigate("/notifications")}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <Bell className="w-4.5 h-4.5 text-primary" />
            </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(-1)}>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-5 py-4 bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="w-full grid grid-cols-2 h-auto p-1 bg-gray-100 rounded-xl">
            <TabsTrigger 
              value="my-programs" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5"
            >
              مساراتي
            </TabsTrigger>
            <TabsTrigger 
              value="custom-programs" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2.5"
            >
              مساراتي الخاصة
            </TabsTrigger>
          </TabsList>

          {/* My Programs Tab */}
          <TabsContent value="my-programs" className="mt-6 space-y-6">
            {enrolledLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border">
                    <div className="flex gap-3">
                      <Skeleton className="w-[90px] h-[90px] rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : enrolledError ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">حدث خطأ أثناء تحميل البرامج</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : !enrolledPrograms || enrolledPrograms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">لا توجد برامج مسجلة</h3>
                <p className="text-muted-foreground mb-6">
                  ابدأ بتصفح البرامج المتاحة وإضافتها إلى قائمتك
                </p>
                <Button
                  onClick={() => navigate("/home")}
                  className="bg-primary text-white rounded-full"
                >
                  تصفح البرامج
                </Button>
              </div>
            ) : (
              <>
                {enrolledPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/program/${program.id}`)}
                  >
                    <div className="flex gap-3">
                      <div className="w-[90px] h-[90px] rounded-xl overflow-hidden shrink-0">
                        {program.thumbnailImages && program.thumbnailImages.length >= 2 ? (
                          <div className="grid grid-rows-2 gap-0.5 h-full">
                            <img
                              src={program.thumbnailImages[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="grid grid-cols-2 gap-0.5">
                              <img
                                src={program.thumbnailImages[1]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <img
                                src={program.thumbnailImages[2]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={program.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="text-right flex-1 space-y-1">
                            <h3 className="font-semibold text-base">{program.title}</h3>
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                                {program.level}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                              <span>{program.sessions} جلسة</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground text-right">
                            اصوات {program.completedSessions}/{program.sessions}
                          </div>
                          <Progress value={program.progress || 0} className="h-1.5" />
                          <div className="text-xs text-muted-foreground text-right">
                            {Math.round(program.progress || 0)}% مكتمل
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={() => navigate("/home")}
                  className="w-full bg-primary text-white rounded-full h-12"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة مسار جديد
                </Button>
              </>
            )}
          </TabsContent>

          {/* Custom Programs Tab */}
          <TabsContent value="custom-programs" className="mt-6 space-y-6">
            {customLoading ? (
              <>
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border">
                    <div className="flex gap-3">
                      <Skeleton className="w-[90px] h-[90px] rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : customError ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">حدث خطأ أثناء تحميل البرامج الخاصة</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : (
              <>
                {customPrograms && customPrograms.length > 0 ? (
                  customPrograms.map((customProgram) => (
                    <div
                      key={customProgram.id}
                      className="bg-white rounded-2xl p-4 shadow-sm border"
                    >
                      <div className="flex gap-3">
                        <div className="w-[90px] h-[90px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-3xl">🎵</span>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="text-right">
                            <h3 className="font-semibold text-base">{customProgram.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {(customProgram.tracks?.length || customProgram.trackIds?.length || 0)} اصوات
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/program/${customProgram.id}?type=custom`)}
                              className="flex-1 rounded-full"
                            >
                              عرض المسار
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deleteCustomProgramMutation.isPending}
                              onClick={() => {
                                if (window.confirm('هل أنت متأكد من حذف هذا المسار؟')) {
                                  deleteCustomProgramMutation.mutate(customProgram.id, {
                                    onSuccess: () => {
                                      toast({
                                        title: "تم الحذف",
                                        description: "تم حذف المسار الخاص بنجاح",
                                      });
                                    },
                                    onError: () => {
                                      toast({
                                        title: "خطأ",
                                        description: "حدث خطأ أثناء حذف المسار",
                                        variant: "destructive",
                                      });
                                    },
                                  });
                                }
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              {deleteCustomProgramMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "حذف"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : null}

                <button
                  onClick={() => navigate("/favorites")}
                  className="w-full bg-white border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-primary font-medium">إنشاء مسار من المفضلة</p>
                </button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default MyPrograms;

