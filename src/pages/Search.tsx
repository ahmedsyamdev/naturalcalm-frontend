/**
 * Search Page
 * Advanced search and filtering for tracks and programs with real API integration
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowRight, Bell, Heart, SlidersHorizontal, X, Loader2, Search as SearchIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import TrackCard from "@/components/TrackCard";
import ProgramCard from "@/components/ProgramCard";
import BottomNav from "@/components/BottomNav";
import { DifficultyLevel, RelaxationType } from "@/types";
import { SearchFilters } from "@/types/filters";
import { cn } from "@/lib/utils";
import { useSearch, useSearchSuggestions } from "@/hooks/queries/useSearch";

const SEARCH_HISTORY_KEY = 'naturacalm_search_history';
const MAX_HISTORY_ITEMS = 5;

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | "">(
    (searchParams.get('level') as DifficultyLevel) || ""
  );
  const [selectedTypes, setSelectedTypes] = useState<RelaxationType[]>(() => {
    const types = searchParams.get('relaxationType');
    return types ? [types as RelaxationType] : [];
  });
  const [sessionRange, setSessionRange] = useState([
    Number(searchParams.get('minSessions')) || 0,
    Number(searchParams.get('maxSessions')) || 20
  ]);
  const [durationRange, setDurationRange] = useState([
    Number(searchParams.get('minDuration')) || 0,
    Number(searchParams.get('maxDuration')) || 45
  ]);
  const [searchType, setSearchType] = useState<'track' | 'program' | 'all'>(
    (searchParams.get('type') as 'track' | 'program' | 'all') || 'all'
  );
  const [showFilters, setShowFilters] = useState(false);

  const levels: DifficultyLevel[] = ["مبتدأ", "متوسط", "متقدم"];
  const types: RelaxationType[] = ["استرخاء صباحي", "استرخاء مسائي"];

  const filters: SearchFilters = useMemo(() => ({
    level: selectedLevel || undefined,
    relaxationType: selectedTypes[0] || undefined,
    minSessions: sessionRange[0],
    maxSessions: sessionRange[1],
    minDuration: durationRange[0],
    maxDuration: durationRange[1],
    type: searchType,
  }), [selectedLevel, selectedTypes, sessionRange, durationRange, searchType]);

  const { data: searchResults, isLoading, isError, error, refetch } = useSearch(searchQuery, filters);
  const { data: suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(searchQuery);

  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedLevel) params.set('level', selectedLevel);
    if (selectedTypes.length > 0) params.set('relaxationType', selectedTypes[0]);
    if (sessionRange[0] !== 0) params.set('minSessions', sessionRange[0].toString());
    if (sessionRange[1] !== 20) params.set('maxSessions', sessionRange[1].toString());
    if (durationRange[0] !== 0) params.set('minDuration', durationRange[0].toString());
    if (durationRange[1] !== 45) params.set('maxDuration', durationRange[1].toString());
    if (searchType !== 'all') params.set('type', searchType);

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedLevel, selectedTypes, sessionRange, durationRange, searchType, setSearchParams]);

  const saveToHistory = (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const newHistory = [trimmed, ...searchHistory.filter(item => item !== trimmed)].slice(0, MAX_HISTORY_ITEMS);
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleSearchSelect = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    saveToHistory(query);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 300);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2 || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const toggleType = (type: RelaxationType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedLevel("");
    setSelectedTypes([]);
    setSessionRange([0, 20]);
    setDurationRange([0, 45]);
    setSearchType('all');
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const tracks = searchResults?.tracks || [];
  const programs = searchResults?.programs || [];
  const hasResults = tracks.length > 0 || programs.length > 0;
  const shouldShowEmptyState = !isLoading && searchQuery.trim().length >= 2 && !hasResults;

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="px-5 pt-12 pb-4 overflow-visible">
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

          <div className="flex gap-2">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl" dir="rtl">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 overflow-y-auto max-h-[calc(85vh-120px)] pb-20">
                  <div>
                    <h3 className="text-right mb-3 text-lg font-medium">مستواك</h3>
                    <div className="flex gap-2 justify-end flex-wrap">
                      {levels.map((level) => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(selectedLevel === level ? "" : level)}
                          className={cn(
                            "px-6 py-2 rounded-full border-2 transition-all",
                            selectedLevel === level
                              ? "border-primary bg-primary/10 text-primary font-medium"
                              : "border-border bg-white text-muted-foreground"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <h3 className="text-right mb-3 text-lg font-medium">نوع الاسترخاء</h3>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {types.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={cn(
                            "px-4 py-2 rounded-full border-2 transition-all text-sm",
                            selectedTypes.includes(type)
                              ? "border-primary bg-primary/10 text-primary font-medium"
                              : "border-border bg-white text-muted-foreground"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">
                        {sessionRange[0]}-{sessionRange[1]} جلسة
                      </span>
                      <h3 className="font-medium text-lg">عدد الجلسات:</h3>
                    </div>
                    <Slider
                      value={sessionRange}
                      onValueChange={setSessionRange}
                      min={0}
                      max={20}
                      step={2}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      {[0, 2, 4, 6, 8, 10, 12, 14, 16, 20].map(num => (
                        <span key={num}>{num}</span>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">
                        {durationRange[0]}-{durationRange[1]} د
                      </span>
                      <h3 className="font-medium text-lg">المدة الزمنية:</h3>
                    </div>
                    <Slider
                      value={durationRange}
                      onValueChange={setDurationRange}
                      min={0}
                      max={45}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45].map(num => (
                        <span key={num}>{num}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 fixed bottom-0 left-0 right-0 bg-white p-5 border-t">
                    <button
                      onClick={clearFilters}
                      className="flex-1 px-6 py-3 text-primary font-medium border border-primary rounded-full"
                    >
                      مسح الكل
                    </button>
                    <Button
                      onClick={applyFilters}
                      className="flex-1 bg-primary text-white rounded-full h-auto py-3"
                    >
                      تطبيق
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex-1 relative">
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder="البحث"
                className="h-12 rounded-2xl pr-4 text-right bg-white border shadow-md"
              />
              {isLoading && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              )}

              {showSuggestions && (
                <div
                  className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border z-50 max-h-80 overflow-y-auto"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {searchQuery.trim().length < 2 && searchHistory.length > 0 && (
                    <div className="p-2">
                      <div className="flex justify-between items-center px-3 py-2">
                        <button
                          onClick={clearHistory}
                          className="text-xs text-primary"
                        >
                          مسح الكل
                        </button>
                        <span className="text-sm text-muted-foreground">البحث الأخير</span>
                      </div>
                      {searchHistory.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchSelect(item)}
                          className="w-full text-right px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                        >
                          <SearchIcon className="w-4 h-4 text-muted-foreground" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchQuery.trim().length >= 2 && suggestions && suggestions.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2">
                        <span className="text-sm text-muted-foreground">اقتراحات</span>
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchSelect(suggestion)}
                          className="w-full text-right px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                        >
                          <SearchIcon className="w-4 h-4 text-muted-foreground" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchQuery.trim().length >= 2 && suggestionsLoading && (
                    <div className="p-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                    </div>
                  )}

                  {searchQuery.trim().length >= 2 && !suggestionsLoading && (!suggestions || suggestions.length === 0) && searchHistory.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      لا توجد اقتراحات
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 space-y-8">
        {isLoading && searchQuery.trim().length >= 2 && (
          <div className="px-5">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="w-40 h-48 bg-gray-200 rounded-2xl"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isError && (
          <div className="px-5 py-12 text-center">
            <p className="text-muted-foreground mb-4">حدث خطأ أثناء البحث</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="rounded-full"
            >
              إعادة المحاولة
            </Button>
          </div>
        )}

        {tracks.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4 px-5">
              <button className="text-primary text-sm font-medium">الكل</button>
              <h2 className="text-lg font-bold">الاكثر استماعا</h2>
            </div>
            <Swiper
              modules={[FreeMode]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              dir="rtl"
              slidesOffsetBefore={60}
              slidesOffsetAfter={20}
              className="!pr-0"
            >
              {tracks.map((track) => (
                <SwiperSlide key={track.id} className="!w-[160px]">
                  <TrackCard
                    track={track}
                    onClick={() => {
                      saveToHistory(searchQuery);
                      navigate(`/player/${track.id}`);
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {programs.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4 px-5">
              <button className="text-primary text-sm font-medium">الكل</button>
              <h2 className="text-lg font-bold">جميع المسارات</h2>
            </div>
            <Swiper
              modules={[FreeMode]}
              spaceBetween={12}
              slidesPerView="auto"
              freeMode={true}
              dir="rtl"
              slidesOffsetBefore={60}
              slidesOffsetAfter={20}
              className="!pr-0"
            >
              {programs.map((program) => (
                <SwiperSlide key={program.id} className="!w-[170px]">
                  <ProgramCard
                    program={program}
                    size="default"
                    onClick={() => {
                      saveToHistory(searchQuery);
                      navigate(`/program/${program.id}`);
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {shouldShowEmptyState && (
          <div className="text-center py-12 text-muted-foreground px-5">
            <p className="text-lg mb-2">لا توجد نتائج</p>
            <p className="text-sm">جرب البحث بكلمات أخرى أو تعديل الفلاتر</p>
          </div>
        )}

        {searchQuery.trim().length < 2 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground px-5">
            <SearchIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg mb-2">ابحث عن التأمل المفضل لديك</p>
            <p className="text-sm">استخدم شريط البحث أعلاه للعثور على المسارات والبرامج</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Search;
