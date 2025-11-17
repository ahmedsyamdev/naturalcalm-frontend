/**
 * Onboarding Page
 * Category preference selection for new users
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CategoryType } from "@/types";
import { useCategories } from "@/hooks/queries/useCategories";
import { CategoryCardSkeleton } from "@/components/LoadingSkeleton";

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);
  const { data: categories, isLoading, isError } = useCategories();

  const toggleCategory = (category: CategoryType) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleContinue = () => {
    localStorage.setItem("userPreferences", JSON.stringify(selectedCategories));
    navigate("/home");
  };

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="text-right space-y-2">
          <h1 className="text-2xl font-bold">اختر الاصوات التي تفضل سماعها من وقت لاخر</h1>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 px-5 pb-6 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[280px] w-full rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-destructive text-lg mb-4">حدث خطأ في تحميل الفئات</p>
            <Button onClick={() => window.location.reload()} className="bg-primary text-white">
              إعادة المحاولة
            </Button>
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.name);

              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.name)}
                  className={`w-full rounded-3xl overflow-hidden transition-all ${
                    isSelected ? "ring-4 ring-primary" : ""
                  }`}
                >
                  <div className="relative h-[280px]">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[200px] h-[200px] rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-8xl">{category.icon}</span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-white text-2xl font-bold text-center">
                        {category.name}
                      </h2>
                    </div>

                    {isSelected && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            لا توجد فئات متاحة
          </div>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="px-5 py-4 bg-white border-t space-y-3">
        <div className="flex gap-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 rounded-full h-12 border-2"
          >
            تخطي
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedCategories.length === 0}
            className="flex-1 bg-primary text-white rounded-full h-12"
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

