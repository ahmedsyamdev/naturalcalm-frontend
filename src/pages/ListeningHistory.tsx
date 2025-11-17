/**
 * Listening History Page
 * Displays user's listening history with pagination
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useListeningHistory } from "@/hooks/queries/useStats";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const ListeningHistory = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useListeningHistory(page, limit);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: ar });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5 text-secondary" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">سجل الاستماع</h1>
              <p className="text-sm text-muted-foreground">
                {data ? `${data.total} جلسة استماع` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-destructive text-sm mb-4">
              حدث خطأ في تحميل سجل الاستماع
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">لا يوجد سجل استماع</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ابدأ الاستماع إلى المسارات لبناء سجل الاستماع الخاص بك
            </p>
            <Button onClick={() => navigate("/home")}>
              تصفح المسارات
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data.data.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {session.completed ? (
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      ) : (
                        <Circle className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 line-clamp-1">
                        {session.trackId}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(session.duration)}</span>
                        {session.completed && (
                          <span className="text-primary">• مكتمل</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.startTime)}
                      </p>
                      {session.programId && (
                        <p className="text-xs text-primary mt-1">
                          من برنامج: {session.programId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  صفحة {page} من {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListeningHistory;
