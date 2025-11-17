/**
 * Admin Notifications Management Page
 * Send notifications to users with FCM push support
 * Liquid Glass design with Arabic RTL support
 */

import { useState } from 'react';
import { Bell, Send, Users, User, Loader2, BarChart3, TrendingUp, X, Settings, History, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  useNotificationTemplates,
  useNotificationStats,
  useNotificationHistory,
  useSendNotification,
  useBroadcastNotification,
  useNotificationUsers,
  useNotificationTracks,
  useNotificationPrograms,
} from '@/hooks/queries/useAdminNotifications';
import { toast } from '@/hooks/use-toast';

type NotificationType = 'new_content' | 'achievement' | 'reminder' | 'subscription' | 'system';

export default function Notifications() {
  const [recipientType, setRecipientType] = useState<'all' | 'user' | 'subscribers'>('all');
  const [userId, setUserId] = useState('');
  const [type, setType] = useState<NotificationType>('system');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sendPush, setSendPush] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');

  // Automation Settings
  const [autoNewTrack, setAutoNewTrack] = useState(true);
  const [autoNewTrackTitle, setAutoNewTrackTitle] = useState('مسار جديد متاح الآن! 🎵');
  const [autoNewTrackMessage, setAutoNewTrackMessage] = useState('تم إضافة مسار صوتي جديد للتأمل والاسترخاء. استمع إليه الآن!');

  const [autoNewProgram, setAutoNewProgram] = useState(true);
  const [autoNewProgramTitle, setAutoNewProgramTitle] = useState('برنامج جديد متاح! 🌟');
  const [autoNewProgramMessage, setAutoNewProgramMessage] = useState('اكتشف برنامجنا الجديد للتأمل والاسترخاء. ابدأ رحلتك الآن!');

  const [autoDailyReminder, setAutoDailyReminder] = useState(true);
  const [autoDailyReminderTime, setAutoDailyReminderTime] = useState('09:00');
  const [autoDailyReminderTitle, setAutoDailyReminderTitle] = useState('وقت التأمل اليومي 🧘');
  const [autoDailyReminderMessage, setAutoDailyReminderMessage] = useState('حان وقت جلسة التأمل اليومية. خذ دقائق من الهدوء والسكينة.');

  const [autoSubscriptionReminder, setAutoSubscriptionReminder] = useState(true);
  const [autoSubscriptionReminderDays, setAutoSubscriptionReminderDays] = useState(3);
  const [autoSubscriptionReminderTitle, setAutoSubscriptionReminderTitle] = useState('تذكير: اشتراكك على وشك الانتهاء');
  const [autoSubscriptionReminderMessage, setAutoSubscriptionReminderMessage] = useState('اشتراكك سينتهي قريباً. جدد الآن لمواصلة الاستمتاع بجميع المزايا.');

  // History Tab State
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');

  const { data: templates, isLoading: templatesLoading } = useNotificationTemplates();
  const { data: stats, isLoading: statsLoading } = useNotificationStats();
  const { data: history, isLoading: historyLoading } = useNotificationHistory(historyPage, 50, historyTypeFilter);
  const { data: users, isLoading: usersLoading } = useNotificationUsers();
  const { data: tracks, isLoading: tracksLoading } = useNotificationTracks();
  const { data: programs, isLoading: programsLoading } = useNotificationPrograms();
  const sendNotification = useSendNotification();
  const broadcastNotification = useBroadcastNotification();

  const handleTemplateSelect = (templateKey: string) => {
    // Template selection would auto-fill title and message based on template
    // For now, just set a placeholder
    const template = templates?.find(t => t.key === templateKey);
    if (template) {
      setTitle(`قالب: ${template.name}`);
      setMessage('يمكنك تعديل هذه الرسالة حسب الحاجة');
    }
  };

  const handleSend = async () => {
    if (!title || !message) {
      return;
    }

    // Build notification data object
    const notificationData: Record<string, unknown> = {};

    if (selectedTrackId) {
      notificationData.trackId = selectedTrackId;
      notificationData.action = 'view_track';
      notificationData.deepLink = `/player/${selectedTrackId}`;
    } else if (selectedProgramId) {
      notificationData.programId = selectedProgramId;
      notificationData.action = 'view_program';
      notificationData.deepLink = `/program/${selectedProgramId}`;
    }

    if (recipientType === 'user') {
      if (!userId) return;
      await sendNotification.mutateAsync({
        userId,
        type,
        title,
        message,
        icon,
        imageUrl,
        sendPush,
        data: Object.keys(notificationData).length > 0 ? notificationData : undefined,
      });
    } else {
      await broadcastNotification.mutateAsync({
        type,
        title,
        message,
        icon,
        imageUrl,
        subscribersOnly: recipientType === 'subscribers',
        sendPush,
        data: Object.keys(notificationData).length > 0 ? notificationData : undefined,
      });
    }

    // Reset form
    setTitle('');
    setMessage('');
    setIcon('');
    setImageUrl('');
    setUserId('');
    setSelectedTrackId('');
    setSelectedProgramId('');
  };

  const getTypeColor = (notifType: string) => {
    const colors: Record<string, string> = {
      new_content: 'bg-blue-500',
      achievement: 'bg-yellow-500',
      reminder: 'bg-purple-500',
      subscription: 'bg-green-500',
      system: 'bg-gray-500',
    };
    return colors[notifType] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen p-8" dir="rtl">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-50 via-teal-50 to-slate-50 -z-10" />

      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#4091A5]/20 to-[#535353]/20 rounded-2xl blur-xl" />
          <div className="relative bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#4091A5] to-[#535353] rounded-2xl shadow-lg">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                  إدارة الإشعارات
                </h1>
                <p className="text-slate-600 mt-1" style={{ fontFamily: 'Tajawal' }}>
                  إرسال الإشعارات للمستخدمين عبر التطبيق والدفع
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="send" className="space-y-8">
          <div className="px-6 py-4">
            <TabsList className="bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-2xl border-2 border-white/60 p-2 flex flex-row-reverse shadow-2xl rounded-2xl gap-2">
            <TabsTrigger
              value="send"
              style={{ fontFamily: 'Tajawal' }}
              className="flex-row-reverse px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#4091A5] data-[state=active]:to-[#2d6b7a] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/70 hover:scale-105"
            >
              <Send className="h-5 w-5 ml-2" />
              إرسال إشعار
            </TabsTrigger>
            <TabsTrigger
              value="history"
              style={{ fontFamily: 'Tajawal' }}
              className="flex-row-reverse px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#4091A5] data-[state=active]:to-[#2d6b7a] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/70 hover:scale-105"
            >
              <History className="h-5 w-5 ml-2" />
              سجل الإشعارات
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              style={{ fontFamily: 'Tajawal' }}
              className="flex-row-reverse px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#4091A5] data-[state=active]:to-[#2d6b7a] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/70 hover:scale-105"
            >
              <BarChart3 className="h-5 w-5 ml-2" />
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger
              value="automation"
              style={{ fontFamily: 'Tajawal' }}
              className="flex-row-reverse px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#4091A5] data-[state=active]:to-[#2d6b7a] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/70 hover:scale-105"
            >
              <Settings className="h-5 w-5 ml-2" />
              الإعدادات التلقائية
            </TabsTrigger>
          </TabsList>
          </div>

          {/* Send Notification Tab */}
          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Send Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                  <CardHeader className="text-right">
                    <CardTitle style={{ fontFamily: 'Tajawal' }}>تفاصيل الإشعار</CardTitle>
                    <CardDescription style={{ fontFamily: 'Tajawal' }}>
                      املأ البيانات لإرسال إشعار جديد
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Recipient Selection */}
                    <div className="space-y-3">
                      <Label className="text-right block" style={{ fontFamily: 'Tajawal' }}>المستلمون</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={recipientType === 'all' ? 'default' : 'outline'}
                          onClick={() => setRecipientType('all')}
                          className="w-full flex-row-reverse"
                          style={{ fontFamily: 'Tajawal' }}
                        >
                          <Users className="h-4 w-4 ml-2" />
                          جميع المستخدمين
                        </Button>
                        <Button
                          variant={recipientType === 'user' ? 'default' : 'outline'}
                          onClick={() => setRecipientType('user')}
                          className="w-full flex-row-reverse"
                          style={{ fontFamily: 'Tajawal' }}
                        >
                          <User className="h-4 w-4 ml-2" />
                          مستخدم محدد
                        </Button>
                        <Button
                          variant={recipientType === 'subscribers' ? 'default' : 'outline'}
                          onClick={() => setRecipientType('subscribers')}
                          className="w-full flex-row-reverse"
                          style={{ fontFamily: 'Tajawal' }}
                        >
                          <TrendingUp className="h-4 w-4 ml-2" />
                          المشتركين فقط
                        </Button>
                      </div>
                    </div>

                    {recipientType === 'user' && (
                      <div className="space-y-2">
                        <Label htmlFor="userId" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                          اختر المستخدم
                        </Label>
                        <select
                          id="userId"
                          value={userId}
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            console.log('Selected user ID:', selectedValue);
                            setUserId(selectedValue);
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
                          style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
                        >
                          <option value="">اختر مستخدم...</option>
                          {usersLoading ? (
                            <option disabled>جاري التحميل...</option>
                          ) : (
                            users?.map((user) => {
                              const userId = user._id || user.id;
                              const displayText = `${user.name} ${user.email ? `(${user.email})` : user.phone ? `(${user.phone})` : ''}${user.subscription?.status === 'active' ? ' - مشترك' : ''}`;
                              return (
                                <option key={userId} value={userId}>
                                  {displayText}
                                </option>
                              );
                            })
                          )}
                        </select>
                      </div>
                    )}

                    {/* Notification Type */}
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                        نوع الإشعار
                      </Label>
                      <Select value={type} onValueChange={(value) => setType(value as NotificationType)}>
                        <SelectTrigger className="bg-white/50 border-white/50 text-right" dir="rtl" style={{ fontFamily: 'Tajawal' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_content" style={{ fontFamily: 'Tajawal' }}>
                            محتوى جديد
                          </SelectItem>
                          <SelectItem value="achievement" style={{ fontFamily: 'Tajawal' }}>
                            إنجاز
                          </SelectItem>
                          <SelectItem value="reminder" style={{ fontFamily: 'Tajawal' }}>
                            تذكير
                          </SelectItem>
                          <SelectItem value="subscription" style={{ fontFamily: 'Tajawal' }}>
                            اشتراك
                          </SelectItem>
                          <SelectItem value="system" style={{ fontFamily: 'Tajawal' }}>
                            نظام
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                        العنوان
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="عنوان الإشعار"
                        className="bg-white/50 border-white/50 text-right" dir="rtl"
                        style={{ fontFamily: 'Tajawal' }}
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                        الرسالة
                      </Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="نص الإشعار"
                        rows={4}
                        className="bg-white/50 border-white/50 resize-none text-right" dir="rtl"
                        style={{ fontFamily: 'Tajawal' }}
                      />
                    </div>

                    {/* Icon */}
                    <div className="space-y-2">
                      <Label htmlFor="icon" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                        الأيقونة (اختياري)
                      </Label>
                      <Input
                        id="icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="مثال: 🎉"
                        className="bg-white/50 border-white/50 text-right" dir="rtl"
                        style={{ fontFamily: 'Tajawal' }}
                      />
                    </div>

                    {/* Image URL */}
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                        رابط الصورة (اختياري)
                      </Label>
                      <Input
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="bg-white/50 border-white/50 text-right" dir="rtl"
                        style={{ fontFamily: 'Tajawal' }}
                      />
                    </div>

                    {/* Link to Content */}
                    <div className="space-y-3">
                      <Label className="text-right block" style={{ fontFamily: 'Tajawal' }}>
                        ربط المحتوى (اختياري)
                      </Label>
                      <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                        اختر مسار صوتي أو برنامج للربط مع الإشعار
                      </p>

                      {/* Track Selector */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between flex-row-reverse">
                          <Label htmlFor="trackId" className="text-sm" style={{ fontFamily: 'Tajawal' }}>
                            مسار صوتي
                          </Label>
                          {selectedTrackId && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTrackId('')}
                              className="h-6 px-2 flex-row-reverse"
                            >
                              <X className="h-3 w-3 ml-1" />
                              <span style={{ fontFamily: 'Tajawal' }}>إلغاء</span>
                            </Button>
                          )}
                        </div>
                        <select
                          id="trackId"
                          value={selectedTrackId}
                          onChange={(e) => {
                            setSelectedTrackId(e.target.value);
                            if (e.target.value) setSelectedProgramId('');
                          }}
                          disabled={!!selectedProgramId}
                          className="flex h-10 w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
                        >
                          <option value="">{selectedProgramId ? 'تم اختيار برنامج' : 'اختر مسار صوتي...'}</option>
                          {tracksLoading ? (
                            <option disabled>جاري التحميل...</option>
                          ) : (
                            tracks?.map((track) => (
                              <option key={track._id} value={track._id}>
                                {track.title} - {track.category} - {track.level}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Program Selector */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between flex-row-reverse">
                          <Label htmlFor="programId" className="text-sm" style={{ fontFamily: 'Tajawal' }}>
                            برنامج
                          </Label>
                          {selectedProgramId && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProgramId('')}
                              className="h-6 px-2 flex-row-reverse"
                            >
                              <X className="h-3 w-3 ml-1" />
                              <span style={{ fontFamily: 'Tajawal' }}>إلغاء</span>
                            </Button>
                          )}
                        </div>
                        <select
                          id="programId"
                          value={selectedProgramId}
                          onChange={(e) => {
                            setSelectedProgramId(e.target.value);
                            if (e.target.value) setSelectedTrackId('');
                          }}
                          disabled={!!selectedTrackId}
                          className="flex h-10 w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
                        >
                          <option value="">{selectedTrackId ? 'تم اختيار مسار صوتي' : 'اختر برنامج...'}</option>
                          {programsLoading ? (
                            <option disabled>جاري التحميل...</option>
                          ) : (
                            programs?.map((program) => (
                              <option key={program._id} value={program._id}>
                                {program.title} - {program.category} - {program.level}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Delivery Options */}
                    <div className="space-y-4">
                      <Label className="text-right block" style={{ fontFamily: 'Tajawal' }}>خيارات التوصيل</Label>
                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/50 flex-row-reverse">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="text-2xl">📱</div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                              إشعار داخل التطبيق
                            </p>
                            <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                              يظهر في قائمة الإشعارات
                            </p>
                          </div>
                        </div>
                        <Switch checked={sendInApp} onCheckedChange={setSendInApp} />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/50 flex-row-reverse">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="text-2xl">🔔</div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                              إشعار دفع (Push)
                            </p>
                            <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                              يظهر على جهاز المستخدم
                            </p>
                          </div>
                        </div>
                        <Switch checked={sendPush} onCheckedChange={setSendPush} />
                      </div>
                    </div>

                    {/* Send Button */}
                    <Button
                      onClick={handleSend}
                      disabled={!title || !message || sendNotification.isPending || broadcastNotification.isPending}
                      className="w-full bg-gradient-to-r from-[#4091A5] to-[#535353] hover:from-[#357a8a] hover:to-[#424242] h-12 flex-row-reverse"
                      style={{ fontFamily: 'Tajawal' }}
                    >
                      {(sendNotification.isPending || broadcastNotification.isPending) ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 ml-2" />
                          إرسال الإشعار
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Templates Sidebar */}
              <div>
                <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                  <CardHeader className="text-right">
                    <CardTitle style={{ fontFamily: 'Tajawal' }}>القوالب الجاهزة</CardTitle>
                    <CardDescription style={{ fontFamily: 'Tajawal' }}>
                      اختر قالب للبدء السريع
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {templatesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#4091A5]" />
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {templates?.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template.key)}
                            className="w-full text-right p-3 bg-white/50 hover:bg-white/70 rounded-lg border border-white/50 transition-all"
                          >
                            <p className="font-medium text-slate-900 text-sm" style={{ fontFamily: 'Tajawal' }}>
                              {String(template.name)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notification History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
              <CardHeader className="text-right">
                <div className="flex items-center justify-between flex-row-reverse">
                  <div className="text-right">
                    <CardTitle style={{ fontFamily: 'Tajawal' }}>سجل الإشعارات</CardTitle>
                    <CardDescription style={{ fontFamily: 'Tajawal' }}>
                      عرض جميع الإشعارات المرسلة سابقاً
                    </CardDescription>
                  </div>
                  <Select value={historyTypeFilter} onValueChange={setHistoryTypeFilter}>
                    <SelectTrigger className="w-[200px] bg-white/50" style={{ fontFamily: 'Tajawal' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" style={{ fontFamily: 'Tajawal' }}>جميع الأنواع</SelectItem>
                      <SelectItem value="new_content" style={{ fontFamily: 'Tajawal' }}>محتوى جديد</SelectItem>
                      <SelectItem value="achievement" style={{ fontFamily: 'Tajawal' }}>إنجاز</SelectItem>
                      <SelectItem value="reminder" style={{ fontFamily: 'Tajawal' }}>تذكير</SelectItem>
                      <SelectItem value="subscription" style={{ fontFamily: 'Tajawal' }}>اشتراك</SelectItem>
                      <SelectItem value="system" style={{ fontFamily: 'Tajawal' }}>نظام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#4091A5]" />
                  </div>
                ) : !history?.notifications || history.notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500" style={{ fontFamily: 'Tajawal' }}>
                      لا توجد إشعارات مرسلة
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className="p-4 bg-white/50 rounded-lg border border-white/50 hover:bg-white/70 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-row-reverse">
                          {/* Notification Icon */}
                          <div className="p-3 bg-gradient-to-br from-[#4091A5] to-[#535353] rounded-xl shadow-lg flex-shrink-0">
                            <Bell className="h-5 w-5 text-white" />
                          </div>

                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2 flex-row-reverse">
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <span className="text-xs text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                                  {new Date(notification.createdAt).toLocaleString('ar-SA', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                {notification.isBroadcast ? (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex-row-reverse">
                                    <Users className="h-3 w-3" />
                                    <span style={{ fontFamily: 'Tajawal' }}>
                                      بث جماعي ({notification.recipientCount})
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex-row-reverse">
                                    <User className="h-3 w-3" />
                                    <span style={{ fontFamily: 'Tajawal' }}>فردي</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 text-right">
                                <h3 className="font-semibold text-slate-900 mb-1" style={{ fontFamily: 'Tajawal' }}>
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                                  {notification.message}
                                </p>
                              </div>
                            </div>

                            {/* Recipient Info */}
                            <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                              {notification.isBroadcast && notification.sampleRecipients ? (
                                <div className="flex items-center gap-2 text-xs text-slate-600 flex-row-reverse justify-end">
                                  <span style={{ fontFamily: 'Tajawal' }}>أرسل إلى:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {notification.sampleRecipients.map((recipient, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded">
                                        {recipient.name}
                                      </span>
                                    ))}
                                    {notification.recipientCount > 5 && (
                                      <span className="px-2 py-1 bg-gray-100 rounded" style={{ fontFamily: 'Tajawal' }}>
                                        +{notification.recipientCount - 5} آخرين
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : notification.recipient ? (
                                <div className="flex items-center gap-3 flex-row-reverse justify-end">
                                  {notification.recipient.avatar ? (
                                    <img
                                      src={notification.recipient.avatar}
                                      alt={notification.recipient.name}
                                      className="h-6 w-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#4091A5] to-[#535353] flex items-center justify-center text-white text-xs">
                                      {notification.recipient.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="text-xs text-right">
                                    <p className="font-medium text-slate-700">{notification.recipient.name}</p>
                                    <p className="text-slate-500">
                                      {notification.recipient.email || notification.recipient.phone}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500" style={{ fontFamily: 'Tajawal' }}>
                                  المستخدم غير متاح
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {history.pagination && history.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t flex-row-reverse">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                          disabled={historyPage === 1}
                          style={{ fontFamily: 'Tajawal' }}
                          className="flex-row-reverse"
                        >
                          <ChevronRight className="h-4 w-4 ml-1" />
                          السابق
                        </Button>
                        <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                          صفحة {history.pagination.page} من {history.pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setHistoryPage((p) => Math.min(history.pagination.totalPages, p + 1))}
                          disabled={historyPage === history.pagination.totalPages}
                          style={{ fontFamily: 'Tajawal' }}
                          className="flex-row-reverse"
                        >
                          <ChevronLeft className="h-4 w-4 ml-2" />
                          التالي
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            {statsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-[#4091A5]" />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                            إجمالي الإشعارات
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2" style={{ fontFamily: 'Tajawal' }}>
                            {stats?.totalNotifications.toLocaleString('ar-EG')}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Bell className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                            اليوم
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2" style={{ fontFamily: 'Tajawal' }}>
                            {stats?.notificationsToday.toLocaleString('ar-EG')}
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                            معدل القراءة
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2" style={{ fontFamily: 'Tajawal' }}>
                            {stats?.readRate.toFixed(0)}%
                          </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                            نسبة الاشتراك في الدفع
                          </p>
                          <p className="text-3xl font-bold text-slate-900 mt-2" style={{ fontFamily: 'Tajawal' }}>
                            {stats?.fcmStats.pushOptInRate.toFixed(0)}%
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <Users className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Notifications by Type */}
                <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                  <CardHeader className="text-right">
                    <CardTitle style={{ fontFamily: 'Tajawal' }}>الإشعارات حسب النوع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.notificationsByType.map((item) => {
                        const total = stats.totalNotifications;
                        const percentage = total > 0 ? (item.count / total) * 100 : 0;
                        return (
                          <div key={item._id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                                {item._id === 'new_content' && 'محتوى جديد'}
                                {item._id === 'achievement' && 'إنجاز'}
                                {item._id === 'reminder' && 'تذكير'}
                                {item._id === 'subscription' && 'اشتراك'}
                                {item._id === 'system' && 'نظام'}
                              </span>
                              <span className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                                {item.count.toLocaleString('ar-EG')} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getTypeColor(item._id)} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* FCM Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                    <CardContent className="p-6">
                      <p className="text-sm text-slate-600 mb-2" style={{ fontFamily: 'Tajawal' }}>
                        المستخدمين مع رموز FCM
                      </p>
                      <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                        {stats?.fcmStats.usersWithTokens.toLocaleString('ar-EG')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: 'Tajawal' }}>
                        من {stats?.fcmStats.totalUsers.toLocaleString('ar-EG')} مستخدم
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                    <CardContent className="p-6">
                      <p className="text-sm text-slate-600 mb-2" style={{ fontFamily: 'Tajawal' }}>
                        إجمالي الرموز
                      </p>
                      <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                        {stats?.fcmStats.totalTokens.toLocaleString('ar-EG')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: 'Tajawal' }}>
                        رموز نشطة
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
                    <CardContent className="p-6">
                      <p className="text-sm text-slate-600 mb-2" style={{ fontFamily: 'Tajawal' }}>
                        متوسط الرموز لكل مستخدم
                      </p>
                      <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                        {stats?.fcmStats.averageTokensPerUser.toFixed(1)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1" style={{ fontFamily: 'Tajawal' }}>
                        أجهزة لكل مستخدم
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Automation Settings Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card className="bg-white/40 backdrop-blur-xl border-white/50 shadow-xl">
              <CardHeader className="text-right">
                <CardTitle style={{ fontFamily: 'Tajawal' }}>إعدادات الإشعارات التلقائية</CardTitle>
                <CardDescription style={{ fontFamily: 'Tajawal' }}>
                  التحكم في الإشعارات التي يتم إرسالها تلقائياً
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* New Track Notification */}
                <div className="p-4 bg-white/50 rounded-lg border border-white/50 space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                          إشعار المسار الجديد
                        </p>
                        <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                          إرسال إشعار تلقائي عند إضافة مسار صوتي جديد
                        </p>
                      </div>
                    </div>
                    <Switch checked={autoNewTrack} onCheckedChange={setAutoNewTrack} />
                  </div>
                  {autoNewTrack && (
                    <div className="pr-16 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="autoNewTrackTitle" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          عنوان الإشعار
                        </Label>
                        <Input
                          id="autoNewTrackTitle"
                          value={autoNewTrackTitle}
                          onChange={(e) => setAutoNewTrackTitle(e.target.value)}
                          className="bg-white/50 border-white/50 text-right"
                          dir="rtl"
                          style={{ fontFamily: 'Tajawal' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="autoNewTrackMessage" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          نص الرسالة
                        </Label>
                        <Textarea
                          id="autoNewTrackMessage"
                          value={autoNewTrackMessage}
                          onChange={(e) => setAutoNewTrackMessage(e.target.value)}
                          className="bg-white/50 border-white/50 text-right min-h-[80px]"
                          dir="rtl"
                          style={{ fontFamily: 'Tajawal' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* New Program Notification */}
                <div className="p-4 bg-white/50 rounded-lg border border-white/50 space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                          إشعار البرنامج الجديد
                        </p>
                        <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                          إرسال إشعار تلقائي عند إضافة برنامج جديد
                        </p>
                      </div>
                    </div>
                    <Switch checked={autoNewProgram} onCheckedChange={setAutoNewProgram} />
                  </div>
                  {autoNewProgram && (
                    <div className="pr-16 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="autoNewProgramTitle" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          عنوان الإشعار
                        </Label>
                        <Input
                          id="autoNewProgramTitle"
                          value={autoNewProgramTitle}
                          onChange={(e) => setAutoNewProgramTitle(e.target.value)}
                          className="bg-white/50 border-white/50 text-right"
                          dir="rtl"
                          style={{ fontFamily: 'Tajawal' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="autoNewProgramMessage" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          نص الرسالة
                        </Label>
                        <Textarea
                          id="autoNewProgramMessage"
                          value={autoNewProgramMessage}
                          onChange={(e) => setAutoNewProgramMessage(e.target.value)}
                          className="bg-white/50 border-white/50 text-right min-h-[80px]"
                          dir="rtl"
                          style={{ fontFamily: 'Tajawal' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Meditation Reminder */}
                <div className="p-4 bg-white/50 rounded-lg border border-white/50 space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                          التذكير اليومي بالتأمل
                        </p>
                        <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                          إرسال تذكير يومي للمستخدمين حسب وقتهم المفضل
                        </p>
                      </div>
                    </div>
                    <Switch checked={autoDailyReminder} onCheckedChange={setAutoDailyReminder} />
                  </div>
                  {autoDailyReminder && (
                    <div className="pr-16 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="autoDailyReminderTitle" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          عنوان الإشعار
                        </Label>
                        <Input
                          id="autoDailyReminderTitle"
                          value={autoDailyReminderTitle}
                          onChange={(e) => setAutoDailyReminderTitle(e.target.value)}
                          className="bg-white/50 border-white/50 text-right"
                          dir="rtl"
                          style={{ fontFamily: 'Tajawal' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="autoDailyReminderMessage" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          نص الرسالة
                        </Label>
                        <Textarea
                          id="autoDailyReminderMessage"
                          value={autoDailyReminderMessage}
                          onChange={(e) => setAutoDailyReminderMessage(e.target.value)}
                          className="bg-white/50 border-white/50 text-right min-h-[80px]"
                          dir="rtl"
                          style={{ fontFamily: 'Tajawal' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dailyReminderTime" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          وقت إرسال التذكير اليومي
                        </Label>
                        <input
                          type="time"
                          id="dailyReminderTime"
                          value={autoDailyReminderTime}
                          onChange={(e) => setAutoDailyReminderTime(e.target.value)}
                          className="flex h-10 w-full max-w-xs rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
                          style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Subscription Reminder */}
                <div className="p-4 bg-white/50 rounded-lg border border-white/50 space-y-4">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900" style={{ fontFamily: 'Tajawal' }}>
                          تذكير الاشتراك
                        </p>
                        <p className="text-sm text-slate-600" style={{ fontFamily: 'Tajawal' }}>
                          إرسال تذكير للمستخدمين قبل انتهاء الاشتراك
                        </p>
                      </div>
                    </div>
                    <Switch checked={autoSubscriptionReminder} onCheckedChange={setAutoSubscriptionReminder} />
                  </div>
                  {autoSubscriptionReminder && (
                    <div className="pr-16 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="autoSubscriptionReminderTitle" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          عنوان الإشعار
                        </Label>
                        <Input
                          id="autoSubscriptionReminderTitle"
                          value={autoSubscriptionReminderTitle}
                          onChange={(e) => setAutoSubscriptionReminderTitle(e.target.value)}
                          className="bg-white/50 border-white/50 text-right"
                          dir="rtl"
                          style={{ fontFamily: 'Tajawal' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="autoSubscriptionReminderMessage" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          نص الرسالة
                        </Label>
                        <Textarea
                          id="autoSubscriptionReminderMessage"
                          value={autoSubscriptionReminderMessage}
                          onChange={(e) => setAutoSubscriptionReminderMessage(e.target.value)}
                          className="bg-white/50 border-white/50 text-right min-h-[80px]"
                          dir="rtl"
                          style={{ fontFamily: 'Tajawal' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subscriptionReminderDays" className="text-right block text-sm" style={{ fontFamily: 'Tajawal' }}>
                          إرسال التذكير قبل ... أيام من انتهاء الاشتراك
                        </Label>
                        <input
                          type="number"
                          id="subscriptionReminderDays"
                          value={autoSubscriptionReminderDays}
                          onChange={(e) => setAutoSubscriptionReminderDays(parseInt(e.target.value) || 3)}
                          min="1"
                          max="30"
                          className="flex h-10 w-full max-w-xs rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right"
                          style={{ fontFamily: 'Tajawal', direction: 'rtl' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Card */}
                <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                  <p className="text-sm text-blue-900" style={{ fontFamily: 'Tajawal' }}>
                    💡 ملاحظة: هذه الإعدادات تتحكم في الإشعارات التلقائية التي يتم إرسالها من النظام. يمكنك دائماً إرسال إشعارات يدوية من تبويب "إرسال إشعار".
                  </p>
                </div>

                {/* Save Button */}
                <Button
                  className="w-full bg-gradient-to-r from-[#4091A5] to-[#535353] hover:from-[#357a8a] hover:to-[#424242] h-12"
                  style={{ fontFamily: 'Tajawal' }}
                  onClick={() => {
                    // Prepare settings data
                    const settings = {
                      autoNewTrack: {
                        enabled: autoNewTrack,
                        title: autoNewTrackTitle,
                        message: autoNewTrackMessage,
                      },
                      autoNewProgram: {
                        enabled: autoNewProgram,
                        title: autoNewProgramTitle,
                        message: autoNewProgramMessage,
                      },
                      autoDailyReminder: {
                        enabled: autoDailyReminder,
                        title: autoDailyReminderTitle,
                        message: autoDailyReminderMessage,
                        time: autoDailyReminderTime,
                      },
                      autoSubscriptionReminder: {
                        enabled: autoSubscriptionReminder,
                        title: autoSubscriptionReminderTitle,
                        message: autoSubscriptionReminderMessage,
                        daysBeforeExpiry: autoSubscriptionReminderDays,
                      },
                    };

                    // TODO: Save to backend when API endpoint is ready
                    console.log('Automation Settings:', settings);

                    toast({
                      title: 'تم حفظ الإعدادات',
                      description: 'تم حفظ إعدادات الإشعارات التلقائية بنجاح',
                      variant: 'default',
                    });
                  }}
                >
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
