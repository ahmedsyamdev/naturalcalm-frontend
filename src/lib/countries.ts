/**
 * International Countries Data
 * List of countries with their flags, names (Arabic & English), and dial codes
 */

export interface Country {
  code: string; // ISO 3166-1 alpha-2 code
  name: string;
  arabicName: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  // Popular Middle Eastern Countries
  { code: 'EG', name: 'Egypt', arabicName: 'مصر', dialCode: '+20', flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', arabicName: 'السعودية', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', arabicName: 'الإمارات', dialCode: '+971', flag: '🇦🇪' },
  { code: 'KW', name: 'Kuwait', arabicName: 'الكويت', dialCode: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', arabicName: 'قطر', dialCode: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', arabicName: 'البحرين', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', arabicName: 'عُمان', dialCode: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', arabicName: 'الأردن', dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', arabicName: 'لبنان', dialCode: '+961', flag: '🇱🇧' },
  { code: 'IQ', name: 'Iraq', arabicName: 'العراق', dialCode: '+964', flag: '🇮🇶' },
  { code: 'SY', name: 'Syria', arabicName: 'سوريا', dialCode: '+963', flag: '🇸🇾' },
  { code: 'PS', name: 'Palestine', arabicName: 'فلسطين', dialCode: '+970', flag: '🇵🇸' },
  { code: 'YE', name: 'Yemen', arabicName: 'اليمن', dialCode: '+967', flag: '🇾🇪' },

  // North African Countries
  { code: 'LY', name: 'Libya', arabicName: 'ليبيا', dialCode: '+218', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan', arabicName: 'السودان', dialCode: '+249', flag: '🇸🇩' },
  { code: 'MA', name: 'Morocco', arabicName: 'المغرب', dialCode: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', arabicName: 'الجزائر', dialCode: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', arabicName: 'تونس', dialCode: '+216', flag: '🇹🇳' },

  // Popular International Countries
  { code: 'US', name: 'United States', arabicName: 'الولايات المتحدة', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', arabicName: 'المملكة المتحدة', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', arabicName: 'كندا', dialCode: '+1', flag: '🇨🇦' },
  { code: 'FR', name: 'France', arabicName: 'فرنسا', dialCode: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', arabicName: 'ألمانيا', dialCode: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', arabicName: 'إيطاليا', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', arabicName: 'إسبانيا', dialCode: '+34', flag: '🇪🇸' },
  { code: 'TR', name: 'Turkey', arabicName: 'تركيا', dialCode: '+90', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', arabicName: 'روسيا', dialCode: '+7', flag: '🇷🇺' },
  { code: 'CN', name: 'China', arabicName: 'الصين', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', arabicName: 'الهند', dialCode: '+91', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', arabicName: 'باكستان', dialCode: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', arabicName: 'بنغلاديش', dialCode: '+880', flag: '🇧🇩' },
  { code: 'ID', name: 'Indonesia', arabicName: 'إندونيسيا', dialCode: '+62', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', arabicName: 'ماليزيا', dialCode: '+60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', arabicName: 'سنغافورة', dialCode: '+65', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', arabicName: 'تايلاند', dialCode: '+66', flag: '🇹🇭' },
  { code: 'AU', name: 'Australia', arabicName: 'أستراليا', dialCode: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', arabicName: 'نيوزيلندا', dialCode: '+64', flag: '🇳🇿' },
  { code: 'BR', name: 'Brazil', arabicName: 'البرازيل', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', arabicName: 'المكسيك', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', arabicName: 'الأرجنتين', dialCode: '+54', flag: '🇦🇷' },
  { code: 'ZA', name: 'South Africa', arabicName: 'جنوب أفريقيا', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', arabicName: 'نيجيريا', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', arabicName: 'كينيا', dialCode: '+254', flag: '🇰🇪' },
  { code: 'ET', name: 'Ethiopia', arabicName: 'إثيوبيا', dialCode: '+251', flag: '🇪🇹' },
  { code: 'JP', name: 'Japan', arabicName: 'اليابان', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', arabicName: 'كوريا الجنوبية', dialCode: '+82', flag: '🇰🇷' },
];

// Default country (Egypt)
export const DEFAULT_COUNTRY = COUNTRIES[0];

// Get country by code
export const getCountryByCode = (code: string): Country | undefined => {
  return COUNTRIES.find(country => country.code === code);
};

// Get country by dial code
export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return COUNTRIES.find(country => country.dialCode === dialCode);
};
