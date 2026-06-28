import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { SubtitleStyle, AnimationType, SubtitlePreset } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/utils/cn';
import { Settings, ChevronDown, ChevronUp, Check, Palette, Type, AlignCenter, Layers, Sparkles } from 'lucide-react';
import { useState } from 'react';

const FONTS = [
  'Inter, sans-serif',
  'Montserrat, sans-serif',
  'Poppins, sans-serif',
  'Roboto, sans-serif',
  'EB Garamond, serif',
  'system-ui, sans-serif',
];

const ANIMATIONS: AnimationType[] = [
  'fade', 'pop', 'scale', 'slideUp', 'slideDown', 'bounce', 'zoom', 'blur',
  'typewriter', 'wordByWord', 'letterByLetter', 'kineticTypography',
];

const PRESET_IDS: Record<string, string> = {
  Classic: 'classic',
  TikTok: 'tiktok',
  CapCut: 'capcut',
  Minimal: 'minimal',
  Bold: 'bold',
  Cinema: 'cinema',
  YouTube: 'youtube',
  Instagram: 'instagram',
};

export function SettingsPanel() {
  const { style, setStyle, presets, applyPreset, pushUndo } = useStore();
  const [isOpen, setIsOpen] = useState(true);

  const updateStyle = <K extends keyof SubtitleStyle>(
    key: K,
    value: SubtitleStyle[K]
  ) => {
    setStyle({ ...style, [key]: value });
  };

  const handlePresetClick = (preset: SubtitlePreset) => {
    pushUndo();
    applyPreset(preset);
  };

  const sections = [
    {
      id: 'presets',
      icon: Sparkles,
      label: 'Presets',
      content: (
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border',
                style.fontFamily === preset.style.fontFamily &&
                style.fontSize === preset.style.fontSize
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border/30 hover:border-border/60 bg-secondary/20 text-muted-foreground hover:text-foreground'
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'typography',
      icon: Type,
      label: 'Typography',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground">Font Family</label>
            <Select
              value={style.fontFamily}
              onValueChange={(v) => updateStyle('fontFamily', v)}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                    {f.split(',')[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Font Size</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[style.fontSize]}
                  onValueChange={([v]) => updateStyle('fontSize', v)}
                  min={12}
                  max={72}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[24px] text-right tabular-nums">
                  {style.fontSize}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Font Weight</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[style.fontWeight]}
                  onValueChange={([v]) => updateStyle('fontWeight', v)}
                  min={100}
                  max={900}
                  step={100}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[24px] text-right tabular-nums">
                  {style.fontWeight}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Letter Spacing</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[style.letterSpacing]}
                  onValueChange={([v]) => updateStyle('letterSpacing', v)}
                  min={-2}
                  max={10}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[24px] text-right tabular-nums">
                  {style.letterSpacing}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Line Height</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[style.lineHeight]}
                  onValueChange={([v]) => updateStyle('lineHeight', v)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[24px] text-right tabular-nums">
                  {style.lineHeight}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'appearance',
      icon: Palette,
      label: 'Appearance',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.color}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border/30 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] text-muted-foreground font-mono">{style.color}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Stroke Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.strokeColor}
                  onChange={(e) => updateStyle('strokeColor', e.target.value)}
                  className="w-8 h-8 rounded-lg border border-border/30 cursor-pointer bg-transparent"
                />
                <span className="text-[10px] text-muted-foreground font-mono">{style.strokeColor}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Stroke Width</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[style.strokeWidth]}
                  onValueChange={([v]) => updateStyle('strokeWidth', v)}
                  min={0}
                  max={5}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[24px] text-right tabular-nums">
                  {style.strokeWidth}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Opacity</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[Math.round(style.opacity * 100)]}
                  onValueChange={([v]) => updateStyle('opacity', v / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[24px] text-right tabular-nums">
                  {Math.round(style.opacity * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.background === 'transparent' ? '#000000' : style.background}
                onChange={(e) => updateStyle('background', e.target.value)}
                className="w-8 h-8 rounded-lg border border-border/30 cursor-pointer bg-transparent"
              />
              <button
                onClick={() => updateStyle('background', style.background === 'transparent' ? 'rgba(0,0,0,0.5)' : 'transparent')}
                className={cn(
                  'px-2 py-1 rounded-lg text-[10px] font-medium transition-all border',
                  style.background === 'transparent'
                    ? 'border-muted-foreground/30 text-muted-foreground'
                    : 'border-primary/30 text-primary bg-primary/10'
                )}
              >
                {style.background === 'transparent' ? 'Off' : 'On'}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'layout',
      icon: AlignCenter,
      label: 'Layout',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Position</label>
              <Select
                value={style.position}
                onValueChange={(v: 'top' | 'middle' | 'bottom') => updateStyle('position', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Alignment</label>
              <Select
                value={style.alignment}
                onValueChange={(v: 'left' | 'center' | 'right') => updateStyle('alignment', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Padding</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[style.padding]}
                  onValueChange={([v]) => updateStyle('padding', v)}
                  min={0}
                  max={40}
                  step={2}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[24px] text-right tabular-nums">
                  {style.padding}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Border Radius</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[style.borderRadius]}
                  onValueChange={([v]) => updateStyle('borderRadius', v)}
                  min={0}
                  max={30}
                  step={2}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground min-w-[24px] text-right tabular-nums">
                  {style.borderRadius}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'animation',
      icon: Sparkles,
      label: 'Animation',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">In Animation</label>
              <Select
                value={style.animationIn}
                onValueChange={(v: AnimationType) => updateStyle('animationIn', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Out Animation</label>
              <Select
                value={style.animationOut}
                onValueChange={(v: AnimationType) => updateStyle('animationOut', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground">Duration (s)</label>
            <div className="flex items-center gap-2">
              <Slider
                value={[style.animationDuration]}
                onValueChange={([v]) => updateStyle('animationDuration', v)}
                min={0.1}
                max={2}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground min-w-[32px] text-right tabular-nums">
                {style.animationDuration.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Settings</span>
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
            <div className="px-4 pb-4 space-y-6 max-h-[400px] overflow-y-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id} className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-muted-foreground/60" />
                      <h5 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                        {section.label}
                      </h5>
                    </div>
                    {section.content}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
