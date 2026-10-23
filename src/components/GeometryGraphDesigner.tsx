import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  Layers, 
  Maximize2, 
  RefreshCw,
  Sliders,
  Eye,
  PenTool
} from 'lucide-react';

export interface GraphTemplateConfig {
  type: 'kite' | 'trapezoid' | 'rhombus' | 'parallelogram' | 'triangle_angles' | 'shaded_right_triangle' | 'circles_in_rectangle' | 'parallel_transversal' | 'coordinate_plane';
  label1?: string;
  label2?: string;
  label3?: string;
  label4?: string;
  label5?: string;
  caption?: string;
  fillColor?: string;
  strokeColor?: string;
  showDiagonals?: boolean;
  showAngles?: boolean;
}

export const generateGeometrySvg = (config: GraphTemplateConfig): { svg: string; caption: string } => {
  const stroke = config.strokeColor || '#15803d'; // Green-700
  const fill = config.fillColor || '#f0fdf4'; // Green-50
  const accent = '#d97706'; // Amber-600 for diagonals/lines
  const textFill = '#1e293b';

  switch (config.type) {
    case 'kite': {
      const b = config.label1 || 'b';
      const c = config.label2 || 'c';
      const d1 = config.label3 || 'd₁';
      const d2 = config.label4 || 'd₂';
      const caption = config.caption || `Figure: Geometric Kite with sides ${b}, ${c} and diagonals ${d1}, ${d2}`;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 220" className="w-full h-auto max-h-60 mx-auto">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
    </filter>
  </defs>
  <!-- Kite Polygon Outer Shape -->
  <polygon points="40,110 130,25 390,110 130,195" fill="${fill}" stroke="${stroke}" stroke-width="3" filter="url(#shadow)" stroke-linejoin="round" />
  
  <!-- Diagonals -->
  <line x1="40" y1="110" x2="390" y2="110" stroke="${accent}" stroke-width="2.5" stroke-dasharray="none" />
  <line x1="130" y1="25" x2="130" y2="195" stroke="${accent}" stroke-width="2.5" stroke-dasharray="none" />
  
  <!-- Right Angle Indicator at Center -->
  <path d="M 130,100 L 140,100 L 140,110" fill="none" stroke="${accent}" stroke-width="1.5" />
  
  <!-- Side Labels -->
  <text x="75" y="60" font-family="serif" font-size="16" font-weight="bold" fill="${textFill}">${b}</text>
  <text x="75" y="170" font-family="serif" font-size="16" font-weight="bold" fill="${textFill}">${b}</text>
  <text x="260" y="58" font-family="serif" font-size="16" font-weight="bold" fill="${textFill}">${c}</text>
  <text x="260" y="175" font-family="serif" font-size="16" font-weight="bold" fill="${textFill}">${c}</text>
  
  <!-- Diagonal Labels -->
  <text x="230" y="102" font-family="serif" font-size="15" font-weight="bold" fill="${accent}">${d1}</text>
  <text x="138" y="155" font-family="serif" font-size="15" font-weight="bold" fill="${accent}">${d2}</text>
</svg>`;
      return { svg, caption };
    }

    case 'trapezoid': {
      const b1 = config.label1 || 'b₁ (top)';
      const b2 = config.label2 || 'b₂ (base)';
      const h = config.label3 || 'h (height)';
      const c = config.label4 || 'c';
      const d = config.label5 || 'd';
      const caption = config.caption || `Figure: Trapezoid with parallel bases ${b1}, ${b2} and height ${h}`;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" className="w-full h-auto max-h-60 mx-auto">
  <polygon points="90,40 270,40 360,160 40,160" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" />
  <!-- Height altitude line -->
  <line x1="90" y1="40" x2="90" y2="160" stroke="${accent}" stroke-width="2" stroke-dasharray="4 3" />
  <path d="M 90,150 L 100,150 L 100,160" fill="none" stroke="${accent}" stroke-width="1.5" />
  <!-- Labels -->
  <text x="170" y="30" font-family="serif" font-size="15" font-weight="bold" fill="${textFill}" text-anchor="middle">${b1}</text>
  <text x="200" y="182" font-family="serif" font-size="15" font-weight="bold" fill="${textFill}" text-anchor="middle">${b2}</text>
  <text x="75" y="105" font-family="serif" font-size="14" font-weight="bold" fill="${accent}">${h}</text>
  <text x="50" y="95" font-family="serif" font-size="14" font-weight="bold" fill="${textFill}">${d}</text>
  <text x="325" y="95" font-family="serif" font-size="14" font-weight="bold" fill="${textFill}">${c}</text>
</svg>`;
      return { svg, caption };
    }

    case 'rhombus': {
      const s = config.label1 || 's';
      const d1 = config.label2 || 'd₁';
      const d2 = config.label3 || 'd₂';
      const caption = config.caption || `Figure: Rhombus with 4 equal sides ${s} and perpendicular diagonals ${d1}, ${d2}`;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 220" className="w-full h-auto max-h-60 mx-auto">
  <polygon points="180,20 320,110 180,200 40,110" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" />
  <line x1="40" y1="110" x2="320" y2="110" stroke="${accent}" stroke-width="2" />
  <line x1="180" y1="20" x2="180" y2="200" stroke="${accent}" stroke-width="2" />
  <path d="M 180,100 L 190,100 L 190,110" fill="none" stroke="${accent}" stroke-width="1.5" />
  <!-- Side Labels -->
  <text x="95" y="60" font-family="serif" font-size="15" font-weight="bold" fill="${textFill}">${s}</text>
  <text x="255" y="60" font-family="serif" font-size="15" font-weight="bold" fill="${textFill}">${s}</text>
  <text x="95" y="170" font-family="serif" font-size="15" font-weight="bold" fill="${textFill}">${s}</text>
  <text x="255" y="170" font-family="serif" font-size="15" font-weight="bold" fill="${textFill}">${s}</text>
  <!-- Diagonal Labels -->
  <text x="240" y="102" font-family="serif" font-size="14" font-weight="bold" fill="${accent}">${d1}</text>
  <text x="186" y="160" font-family="serif" font-size="14" font-weight="bold" fill="${accent}">${d2}</text>
</svg>`;
      return { svg, caption };
    }

    case 'parallelogram': {
      const angle1 = config.label1 || '3x';
      const angle2 = config.label2 || '2x';
      const angle3 = config.label3 || 'y';
      const caption = config.caption || `Figure: Parallelogram ABCD with consecutive angles ${angle1}, ${angle2} and exterior angle ${angle3}`;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 200" className="w-full h-auto max-h-60 mx-auto">
  <!-- Extended line for exterior angle y -->
  <line x1="280" y1="160" x2="330" y2="40" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" />
  <line x1="280" y1="160" x2="310" y2="80" stroke="${stroke}" stroke-width="2.5" />
  <line x1="310" y1="80" x2="330" y2="40" stroke="#6366f1" stroke-width="2" />
  
  <!-- Parallelogram Main Body -->
  <polygon points="80,160 300,160 340,60 120,60" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" />
  
  <!-- Vertex Labels -->
  <text x="65" y="170" font-family="sans-serif" font-size="14" font-weight="bold" fill="${textFill}">D</text>
  <text x="110" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="${textFill}">A</text>
  <text x="350" y="60" font-family="sans-serif" font-size="14" font-weight="bold" fill="${textFill}">B</text>
  <text x="305" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="${textFill}">C</text>
  
  <!-- Interior Angle Arcs & Labels -->
  <text x="135" y="80" font-family="serif" font-size="15" font-weight="bold" fill="#7c3aed">${angle1}</text>
  <text x="95" y="150" font-family="serif" font-size="15" font-weight="bold" fill="#7c3aed">${angle2}</text>
  <text x="315" y="55" font-family="serif" font-size="15" font-weight="bold" fill="#2563eb">${angle3}</text>
</svg>`;
      return { svg, caption };
    }

    case 'shaded_right_triangle': {
      const base = config.label1 || '4 cm';
      const hSmall = config.label2 || '3 cm';
      const hBig = config.label3 || '5 cm';
      const caption = config.caption || `Figure: Composite right-angled figure with base ${base}, heights ${hSmall} and ${hBig}`;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 200" className="w-full h-auto max-h-60 mx-auto">
  <!-- Outer Triangle -->
  <polygon points="50,160 310,160 310,40" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
  <!-- Shaded Region Triangle -->
  <polygon points="50,160 310,40 310,100" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5" />
  <!-- Lower Right Triangle -->
  <polygon points="50,160 310,160 310,100" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />
  
  <!-- Right Angle Indicator -->
  <path d="M 295,160 L 295,145 L 310,145" fill="none" stroke="#64748b" stroke-width="1.5" />
  
  <!-- Dimension Labels -->
  <text x="180" y="180" font-family="serif" font-size="14" font-weight="bold" fill="${textFill}" text-anchor="middle">${base}</text>
  <text x="325" y="135" font-family="serif" font-size="14" font-weight="bold" fill="${textFill}">${hSmall}</text>
  <text x="325" y="70" font-family="serif" font-size="14" font-weight="bold" fill="${textFill}">${hBig}</text>
</svg>`;
      return { svg, caption };
    }

    case 'circles_in_rectangle': {
      const caption = config.caption || `Figure: Rectangle ABCD with 3 tangent circles aligned along axis EF`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" className="w-full h-auto max-h-60 mx-auto">
  <!-- Shaded Rectangle ABCD -->
  <rect x="50" y="30" width="300" height="140" fill="#cbd5e1" stroke="#334155" stroke-width="2.5" rx="2" />
  <!-- Axis Center Line -->
  <line x1="40" y1="100" x2="360" y2="100" stroke="#94a3b8" stroke-dasharray="4 3" stroke-width="1.5" />
  
  <!-- Circle 1 (Small Left) -->
  <circle cx="85" cy="100" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="2" />
  <circle cx="85" cy="100" r="2.5" fill="#e11d48" />
  <text x="85" y="105" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e11d48" text-anchor="middle">E</text>

  <!-- Circle 2 (Large Center) -->
  <circle cx="200" cy="100" r="70" fill="#ffffff" stroke="#1e293b" stroke-width="2.5" />
  <circle cx="200" cy="100" r="3" fill="#e11d48" />
  <text x="200" y="105" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e11d48" text-anchor="middle">F</text>

  <!-- Circle 3 (Small Right) -->
  <circle cx="315" cy="100" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="2" />
  <circle cx="315" cy="100" r="2.5" fill="#e11d48" />
  <text x="315" y="105" font-family="sans-serif" font-size="12" font-weight="bold" fill="#e11d48" text-anchor="middle">G</text>

  <!-- Vertex Labels -->
  <text x="38" y="32" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">D</text>
  <text x="38" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">A</text>
  <text x="355" y="180" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">B</text>
  <text x="355" y="32" font-family="sans-serif" font-size="14" font-weight="bold" fill="#1e293b">C</text>
</svg>`;
      return { svg, caption };
    }

    case 'parallel_transversal': {
      const caption = config.caption || `Figure: Parallel lines m // n intersected by transversal with angle pairs`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 220" className="w-full h-auto max-h-60 mx-auto">
  <!-- Parallel Lines m and n -->
  <line x1="40" y1="70" x2="380" y2="70" stroke="#0f766e" stroke-width="3" />
  <line x1="40" y1="160" x2="380" y2="160" stroke="#0f766e" stroke-width="3" />
  
  <!-- Transversal Line -->
  <line x1="120" y1="20" x2="260" y2="210" stroke="#d97706" stroke-width="2.5" />
  
  <!-- Line Names -->
  <text x="385" y="75" font-family="serif" font-size="15" font-weight="bold" fill="#0f766e">m</text>
  <text x="385" y="165" font-family="serif" font-size="15" font-weight="bold" fill="#0f766e">n</text>
  
  <!-- Upper Intersection Angles (A, B, C, D) -->
  <text x="135" y="60" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b">A</text>
  <text x="175" y="60" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b">B</text>
  <text x="140" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b">C</text>
  <text x="180" y="90" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b">D</text>

  <!-- Lower Intersection Angles (E, F, G, H) -->
  <text x="200" y="150" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b">E</text>
  <text x="240" y="150" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b">F</text>
  <text x="205" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b">G</text>
  <text x="245" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b">H</text>
</svg>`;
      return { svg, caption };
    }

    default: {
      return generateGeometrySvg({ ...config, type: 'kite' });
    }
  }
};

interface GeometryGraphDesignerProps {
  onInsertGraph: (svgCode: string, captionText: string) => void;
  onClose: () => void;
}

export const GeometryGraphDesigner: React.FC<GeometryGraphDesignerProps> = ({
  onInsertGraph,
  onClose
}) => {
  const [activeTemplate, setActiveTemplate] = useState<GraphTemplateConfig['type']>('kite');
  const [label1, setLabel1] = useState<string>('b');
  const [label2, setLabel2] = useState<string>('c');
  const [label3, setLabel3] = useState<string>('d₁');
  const [label4, setLabel4] = useState<string>('d₂');
  const [label5, setLabel5] = useState<string>('');
  const [caption, setCaption] = useState<string>('Figure: Geometric Kite with diagonals and sides');
  const [copied, setCopied] = useState<boolean>(false);

  const currentConfig: GraphTemplateConfig = {
    type: activeTemplate,
    label1,
    label2,
    label3,
    label4,
    label5,
    caption
  };

  const { svg, caption: generatedCaption } = generateGeometrySvg(currentConfig);

  const handleTemplateChange = (tmpl: GraphTemplateConfig['type']) => {
    setActiveTemplate(tmpl);
    if (tmpl === 'kite') {
      setLabel1('b');
      setLabel2('c');
      setLabel3('d₁');
      setLabel4('d₂');
      setCaption('Figure: Geometric Kite with sides b, c and diagonals d₁, d₂');
    } else if (tmpl === 'trapezoid') {
      setLabel1('b₁');
      setLabel2('b₂');
      setLabel3('h');
      setLabel4('c');
      setLabel5('d');
      setCaption('Figure: Trapezoid with parallel bases b₁, b₂ and height h');
    } else if (tmpl === 'rhombus') {
      setLabel1('s');
      setLabel2('d₁');
      setLabel3('d₂');
      setCaption('Figure: Rhombus with sides s and perpendicular diagonals d₁, d₂');
    } else if (tmpl === 'parallelogram') {
      setLabel1('3x');
      setLabel2('2x');
      setLabel3('y');
      setCaption('Figure: Parallelogram ABCD with consecutive and exterior angles');
    } else if (tmpl === 'shaded_right_triangle') {
      setLabel1('4 cm');
      setLabel2('3 cm');
      setLabel3('5 cm');
      setCaption('Figure: Right-angled composite triangle with shaded area');
    } else if (tmpl === 'circles_in_rectangle') {
      setCaption('Figure: Rectangle ABCD containing three tangent circles');
    } else if (tmpl === 'parallel_transversal') {
      setCaption('Figure: Parallel lines m // n with transversal and angle pairs');
    }
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyToQuestion = () => {
    onInsertGraph(svg, caption || generatedCaption);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-in fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <PenTool className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold">Interactive Geometry & Graph Designer</h3>
              <p className="text-xs text-slate-400">Generate scalable SVG geometric shapes, kites, angles, and diagrams for questions.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Controls */}
          <div className="md:col-span-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Select Shape Template</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleTemplateChange('kite')}
                  className={`p-2 rounded-lg border font-bold text-left transition-all ${
                    activeTemplate === 'kite' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  🪁 Kite (d₁, d₂, b, c)
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('trapezoid')}
                  className={`p-2 rounded-lg border font-bold text-left transition-all ${
                    activeTemplate === 'trapezoid' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  📐 Trapezoid (b₁, b₂, h)
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('rhombus')}
                  className={`p-2 rounded-lg border font-bold text-left transition-all ${
                    activeTemplate === 'rhombus' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  🔶 Rhombus (s, d₁, d₂)
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('parallelogram')}
                  className={`p-2 rounded-lg border font-bold text-left transition-all ${
                    activeTemplate === 'parallelogram' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  ▱ Parallelogram Angles
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('shaded_right_triangle')}
                  className={`p-2 rounded-lg border font-bold text-left transition-all ${
                    activeTemplate === 'shaded_right_triangle' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  🔺 Shaded Triangle Area
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('circles_in_rectangle')}
                  className={`p-2 rounded-lg border font-bold text-left transition-all ${
                    activeTemplate === 'circles_in_rectangle' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  ⚪ 3 Circles in Rectangle
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('parallel_transversal')}
                  className={`p-2 rounded-lg border font-bold text-left col-span-2 transition-all ${
                    activeTemplate === 'parallel_transversal' ? 'bg-purple-50 border-purple-400 text-purple-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  ═ Parallel Lines & Transversal (m // n)
                </button>
              </div>
            </div>

            {/* Custom Label Inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Customize Labels & Variables</span>
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600">Label 1</span>
                  <input
                    type="text"
                    value={label1}
                    onChange={(e) => setLabel1(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600">Label 2</span>
                  <input
                    type="text"
                    value={label2}
                    onChange={(e) => setLabel2(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600">Label 3</span>
                  <input
                    type="text"
                    value={label3}
                    onChange={(e) => setLabel3(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600">Label 4</span>
                  <input
                    type="text"
                    value={label4}
                    onChange={(e) => setLabel4(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-600">Figure Caption / Description</span>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Live SVG Preview */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4 bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>Real-Time SVG Diagram Preview</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                  Vector Scale 100%
                </span>
              </div>

              {/* Rendered SVG Canvas */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-center min-h-[200px]">
                <div 
                  className="w-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </div>

              <p className="text-xs text-center text-slate-500 italic mt-2 font-medium">
                {caption || generatedCaption}
              </p>
            </div>

            {/* SVG Code snippet toggle & buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopySvg}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'SVG Copied!' : 'Copy SVG Code'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyToQuestion}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Insert Diagram into Question</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
