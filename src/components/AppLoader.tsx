/**
 * App Loader Component
 * Shows a loading screen while the app initializes
 */

import { Loader2 } from 'lucide-react';

export function AppLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-primary/10 via-primary/5 to-white">
      <div className="flex flex-col items-center gap-6 p-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-primary font-tajawal">Naturacalm</h2>
        <p className="text-secondary font-tajawal">جاري تحميل التطبيق...</p>
      </div>
    </div>
  );
}

export default AppLoader;
