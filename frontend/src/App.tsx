import { AnimatePresence, motion } from 'framer-motion';
import { HomePage } from '@/pages/HomePage';
import { EditorPage } from '@/pages/EditorPage';
import { useStore } from '@/store/useStore';
import { useAutoSave } from '@/hooks/useAutoSave';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const { page } = useStore();

  useAutoSave();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {page === 'home' ? (
            <PageTransition key="home">
              <HomePage />
            </PageTransition>
          ) : (
            <PageTransition key="editor">
              <EditorPage />
            </PageTransition>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
