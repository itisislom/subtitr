import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { VideoPlayer } from '@/components/editor/VideoPlayer';
import { SubtitleList } from '@/components/subtitle/SubtitleList';
import { Timeline } from '@/components/timeline/Timeline';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { ExportPanel } from '@/components/export/ExportPanel';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Undo2, Redo2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function EditorPage() {
  const {
    setPage,
    projectId,
    editor,
    setEditorState,
    searchQuery,
    setSearchQuery,
    undo,
    redo,
    canUndo,
    canRedo,
    pushUndo,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage('home')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold text-gradient tracking-tight">Subtitr</h1>
            <span className="text-[10px] text-muted-foreground/40 font-mono px-2 py-0.5 rounded-full bg-secondary/50 border border-border/30">
              {projectId?.slice(0, 8)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-9 text-xs rounded-xl bg-secondary/30"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={undo}
              disabled={!canUndo()}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={redo}
              disabled={!canRedo()}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-col h-[calc(100vh-57px)]">
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <VideoPlayer />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Timeline />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-96 xl:w-[420px] flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex-1 glass rounded-2xl overflow-hidden min-h-0">
              <SubtitleList />
            </div>

            <div className="space-y-2 flex-shrink-0">
              <SettingsPanel />
              <ExportPanel />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
