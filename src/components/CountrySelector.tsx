/**
 * Country Selector Component
 * Allows users to select their country for phone number registration
 */

import { useState } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Country, COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
}

export function CountrySelector({ selectedCountry, onSelectCountry }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = COUNTRIES.filter(country =>
    country.arabicName.includes(searchQuery) ||
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  const handleSelectCountry = (country: Country) => {
    onSelectCountry(country);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      {/* Country Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white rounded-full px-4 py-3 border border-border shadow-sm min-w-[100px] hover:bg-gray-50 transition-colors"
      >
        <span className="text-2xl">{selectedCountry.flag}</span>
        <span className="text-foreground">{selectedCountry.dialCode.replace('+', '')}+</span>
        <span className="text-muted-foreground">▼</span>
      </button>

      {/* Country Selection Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[600px] overflow-hidden bg-white" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right" style={{ fontFamily: 'Tajawal' }}>
              اختر بلدك
            </DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن بلد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
              style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
            />
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto max-h-[400px] -mx-6 px-6">
            <div className="space-y-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleSelectCountry(country)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-right",
                      selectedCountry.code === country.code && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {selectedCountry.code === country.code && (
                        <Check className="h-5 w-5 text-primary shrink-0" />
                      )}
                      <span className="text-muted-foreground text-sm">{country.dialCode}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-foreground" style={{ fontFamily: 'Tajawal' }}>
                        {country.arabicName}
                      </span>
                      <span className="text-2xl">{country.flag}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground" style={{ fontFamily: 'Tajawal' }}>
                  لا توجد نتائج
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CountrySelector;
