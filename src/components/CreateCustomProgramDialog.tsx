/**
 * Create Custom Program Dialog
 * Dialog for creating a custom program from selected tracks
 */

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateCustomProgram } from "@/hooks/queries/useUserPrograms";
import { useToast } from "@/hooks/use-toast";
import { Track } from "@/types";

interface CreateCustomProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTracks: Track[];
  preSelectedTrackIds?: string[];
}

export const CreateCustomProgramDialog = ({
  open,
  onOpenChange,
  availableTracks,
  preSelectedTrackIds = [],
}: CreateCustomProgramDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createMutation = useCreateCustomProgram();

  const [programName, setProgramName] = useState("");
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(preSelectedTrackIds);

  const handleToggleTrack = (trackId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleCreate = () => {
    if (!programName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم للمسار",
        variant: "destructive",
      });
      return;
    }

    if (selectedTrackIds.length === 0) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار مسار واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(
      { name: programName, trackIds: selectedTrackIds },
      {
        onSuccess: (newProgram) => {
          toast({
            title: "تم الإنشاء بنجاح",
            description: `تم إنشاء المسار "${programName}" بنجاح`,
          });
          onOpenChange(false);
          setProgramName("");
          setSelectedTrackIds([]);
          navigate(`/program/${newProgram.id}?type=custom`);
        },
        onError: () => {
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء إنشاء المسار",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      onOpenChange(false);
      setProgramName("");
      setSelectedTrackIds(preSelectedTrackIds);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إنشاء مسار خاص</DialogTitle>
          <DialogDescription className="text-right">
            قم بتسمية مسارك الخاص واختر الأصوات التي تريد إضافتها
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Program Name */}
          <div className="space-y-2">
            <Label htmlFor="program-name" className="text-right block">
              اسم المسار
            </Label>
            <Input
              id="program-name"
              placeholder="مثال: مسار الاسترخاء المسائي"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="text-right"
              disabled={createMutation.isPending}
            />
          </div>

          {/* Track Selection */}
          <div className="space-y-2">
            <Label className="text-right block">
              اختر الأصوات ({selectedTrackIds.length} محدد)
            </Label>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-3">
                {availableTracks.map((track) => {
                  const isSelected = selectedTrackIds.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={`track-${track.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleTrack(track.id)}
                        disabled={createMutation.isPending}
                      />
                      <label
                        htmlFor={`track-${track.id}`}
                        className="flex-1 cursor-pointer text-right"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{track.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {track.duration} • {track.level}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="flex-1 bg-primary text-white rounded-full"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              "إنشاء المسار"
            )}
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={createMutation.isPending}
            className="flex-1 rounded-full"
          >
            <X className="w-4 h-4 ml-2" />
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
