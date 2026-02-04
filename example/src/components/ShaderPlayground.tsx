import { useState } from 'react';
import { Shader3D } from '@shader3d/effects';
import css from './ShaderPlayground.module.css';

const EFFECTS = {
  flowingLine: {
    name: 'Flowing Line ✨',
    description: 'Animated wavy line with glow',
    config: { type: 'line', animation: 'flowing', color: 'purple', glow: true },
  },
  gradient: {
    name: 'Animated Gradient 🌈',
    description: 'Rotating color blend',
    config: { type: 'gradient', from: 'blue', to: 'pink', animated: true },
  },
  circle: {
    name: 'Pulsing Circle 💫',
    description: 'Glowing animated circle',
    config: { type: 'circle', color: 'cyan', glow: true, pulse: true },
  },
  scanlines: {
    name: 'Retro Scanlines 📺',
    description: 'CRT-style effect',
    config: { type: 'scanlines', color: 'green', speed: 'medium' },
  },
  noise: {
    name: 'Organic Pattern 🌊',
    description: 'Animated noise texture',
    config: { type: 'noise', colors: ['purple', 'blue'], animated: true },
  },
  rainbow: {
    name: 'Rainbow Shift 🎨',
    description: 'Animated color shift',
    config: { type: 'colorShift', speed: 'slow' },
  },
} as const;

type EffectName = keyof typeof EFFECTS;

const Banner = () => (
  <div className={css.banner}>
    <strong>✨ No Shader Knowledge Required!</strong>
    <div className={css.bannerText}>
      Select an effect and click Generate. The library creates the shader for you.
    </div>
  </div>
);

const EffectSelector = ({
  selected,
  onSelect,
}: {
  selected: EffectName;
  onSelect: (name: EffectName) => void;
}) => (
  <div className={css.btnGroup}>
    {(Object.keys(EFFECTS) as EffectName[]).map((name) => (
      <button
        key={name}
        onClick={() => onSelect(name)}
        className={`${css.btn} ${selected === name ? css.active : ''}`}
      >
        {EFFECTS[name].name}
      </button>
    ))}
  </div>
);

const EffectCard = ({ effect }: { effect: (typeof EFFECTS)[EffectName] }) => (
  <div className={css.card}>
    <h4 className={css.cardTitle}>{effect.name}</h4>
    <p className={css.cardDesc}>{effect.description}</p>
    <div className={css.cardConfig}>
      <strong>Configuration:</strong>
      <pre className={css.pre}>{JSON.stringify(effect.config, null, 2)}</pre>
    </div>
  </div>
);

const OutputPanel = ({
  output,
}: {
  output: { success: boolean; wgsl?: string; error?: string } | null;
}) => (
  <>
    <h3 className={css.outputTitle}>Generated WGSL</h3>
    {!output && (
      <div className={`${css.card} ${css.placeholder}`}>Click "Generate Shader" to see output</div>
    )}
    {output?.success && (
      <>
        <div className={css.success}>✓ Generated successfully from your config!</div>
        <pre className={css.output}>{output.wgsl}</pre>
      </>
    )}
    {output?.success === false && (
      <div className={css.error}>
        <strong>Error:</strong> {output.error}
      </div>
    )}
  </>
);

export function ShaderPlayground() {
  const [selected, setSelected] = useState<EffectName>('flowingLine');
  const [output, setOutput] = useState<{ success: boolean; wgsl?: string; error?: string } | null>(
    null
  );

  const handleGenerate = () => {
    try {
      const shader = new Shader3D();
      shader.layers.add(EFFECTS[selected].config.type, EFFECTS[selected].config);
      setOutput({ success: true, wgsl: shader.compile().wgsl });
    } catch (err) {
      setOutput({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
  };

  const handleSelect = (name: EffectName) => {
    setSelected(name);
    setOutput(null);
  };

  return (
    <div className={css.grid}>
      <div>
        <Banner />
        <EffectSelector selected={selected} onSelect={handleSelect} />
        <EffectCard effect={EFFECTS[selected]} />
        <button onClick={handleGenerate} className={css.genBtn}>
          Generate Shader
        </button>
      </div>
      <div>
        <OutputPanel output={output} />
      </div>
    </div>
  );
}
