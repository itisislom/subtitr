import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Video, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { api } from '@/utils/api';
import { ExportFormat } from '@/types';

const FORMATS: { format: ExportFormat; label: string; icon: typeof FileText; description: string }[] = [
  { format: 'srt', label: 'SRT', icon: FileText, description: 'SubRip format - universal compatibility' },
  { format: 'vtt', label: 'VTT', icon: FileText, description: 'WebVTT format - web video' },
  { format: 'txt', label: 'TXT', icon: FileText, description: 'Plain text transcript' },
  { format: 'ass', label: 'ASS', icon: FileText, description: 'Advanced SubStation Alpha - styled' },
];

export function ExportPanel() {
  const { projectId, isExporting, setIsExporting } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!projectId) return;
    setIsExporting(true);
    setExportStatus(`Exporting ${format.toUpperCase()}...`);

    try {
      const blob = await api.exportSubtitles(projectId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subtitles.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus(`${format.toUpperCase()} exported successfully!`);
      setTimeout(() => setExportStatus(null), 2000);
    } catch (error) {
      setExportStatus('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBurnIn = async () => {
    if (!projectId) return;
    setIsExporting(true);
    setExportStatus('Burning subtitles into video...');

    try {
      const blob = await api.burnSubtitles(projectId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subtitled_video.mp4';
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('Video with burned subtitles downloaded!');
      setTimeout(() => setExportStatus(null), 2000);
    } catch (error) {
      setExportStatus('Burn-in failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Export</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {FORMATS.map(({ format, label, icon: Icon, description }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={isExporting}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
                    'border-border/30 hover:border-primary/30 hover:bg-primary/5',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-foreground">{label}</div>
                    <div className="text-[10px] text-muted-foreground/60">{description}</div>
                  </div>
                  {exportStatus?.includes(label) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}

              <div className="pt-2 border-t border-border/30">
                <Button
                  variant="glass"
                  className="w-full gap-2"
                  onClick={handleBurnIn}
                  disabled={isExporting}
                >
                  {isExporting && exportStatus?.includes('Burn') ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  Burn Subtitles into Video
                </Button>
              </div>

              <AnimatePresence>
                {exportStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-center text-muted-foreground/60 py-1"
                  >
                    {exportStatus}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
