import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Code2, 
  BookOpen, 
  Maximize2, 
  X, 
  Check, 
  BarChart3, 
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Scale,
  ArrowRightLeft
} from 'lucide-react';
import { Question } from '../types';

interface RichQuestionViewerProps {
  question: Question;
  questionNumber?: number;
  totalQuestions?: number;
  selectedOptionIndex?: number;
  selectedOptionIndices?: number[];
  onSelectOption?: (index: number) => void;
  onToggleOptionMulti?: (index: number) => void;
  showAnswerFeedback?: boolean; // For results or study mode
  userSelectedIndex?: number;
  userSelectedIndices?: number[];
  readOnly?: boolean;
}

// Helper to render text that might contain a Markdown table
const renderFormattedText = (text: string) => {
  if (!text) return null;

  // Check if text has a markdown table (lines starting and ending with |)
  const lines = text.split('\n');
  const hasTable = lines.some(l => l.trim().startsWith('|') && l.trim().endsWith('|'));

  if (!hasTable) {
    return <span className="whitespace-pre-line">{text}</span>;
  }

  // Render mixed text and table
  const elements: React.ReactNode[] = [];
  let tableLines: string[] = [];
  let textBuffer: string[] = [];

  const flushText = (key: number) => {
    if (textBuffer.length > 0) {
      elements.push(
        <div key={`text-${key}`} className="whitespace-pre-line my-1.5">
          {textBuffer.join('\n')}
        </div>
      );
      textBuffer = [];
    }
  };

  const flushTable = (key: number) => {
    if (tableLines.length > 0) {
      const rows = tableLines
        .filter(line => !line.match(/^[|\s-:]+$/)) // filter separator rows like |---|---|
        .map(line => 
          line
            .split('|')
            .map(c => c.trim())
            .filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1)
        );

      if (rows.length > 0) {
        const header = rows[0];
        const bodyRows = rows.slice(1);

        elements.push(
          <div key={`table-${key}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
            <table className="min-w-full text-xs text-slate-800 text-center divide-y divide-slate-200">
              <thead className="bg-slate-100/80 font-bold text-slate-700">
                <tr>
                  {header.map((col, cIdx) => (
                    <th key={cIdx} className="px-3 py-2 border-r border-slate-200 last:border-r-0">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {row.map((val, vIdx) => (
                      <td key={vIdx} className="px-3 py-2 border-r border-slate-100 last:border-r-0 font-medium">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableLines = [];
    }
  };

  let counter = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushText(counter++);
      tableLines.push(line.trim());
    } else {
      flushTable(counter++);
      textBuffer.push(line);
    }
  }
  flushText(counter++);
  flushTable(counter++);

  return <div className="space-y-1">{elements}</div>;
};

export const RichQuestionViewer: React.FC<RichQuestionViewerProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionIndex,
  selectedOptionIndices = [],
  onSelectOption,
  onToggleOptionMulti,
  showAnswerFeedback = false,
  userSelectedIndex,
  userSelectedIndices,
  readOnly = false,
}) => {
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [isPassageExpanded, setIsPassageExpanded] = useState<boolean>(true);

  if (!question) {
    return null;
  }

  // Diagram / image URL resolution
  const imageUrl = question.imageUrl || question.diagramUrl;
  const isMultiChoice = question.questionType === 'multi_choice';
  const isQuantComp = question.questionType === 'quantitative_comparison';
  const isTrueFalse = question.questionType === 'true_false';
  
  // Default standard options for Quantitative Comparison if not specified or standard
  const defaultQuantCompOptions = [
    "Quantity in Column A is greater",
    "Quantity in Column B is greater",
    "The two quantities are equal",
    "The relationship cannot be determined from the information given"
  ];

  const optionsList = Array.isArray(question.options) && question.options.length > 0
    ? question.options
    : isQuantComp
      ? defaultQuantCompOptions
      : [];

  return (
    <div className="space-y-5">
      {/* 1. Optional Reading Passage or Case Scenario / Shared Context */}
      {question.passage && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Reference Context / Shared Data / Passage</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPassageExpanded(!isPassageExpanded)}
              className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              {isPassageExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          {isPassageExpanded && (
            <div className="text-xs sm:text-sm text-amber-950 leading-relaxed font-serif">
              {renderFormattedText(question.passage)}
            </div>
          )}
        </div>
      )}

      {/* 2. Question Text */}
      <div className="space-y-2">
        <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
          {renderFormattedText(question.questionText)}
        </div>
        
        {isMultiChoice && !showAnswerFeedback && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Multiple Choice (Select all correct answers)</span>
          </div>
        )}

        {isQuantComp && !showAnswerFeedback && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-bold">
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            <span>Quantitative Comparison (Compare Column A and Column B)</span>
          </div>
        )}
      </div>

      {/* 2.5. Dedicated Quantitative Comparison Box (Column A vs Column B) */}
      {isQuantComp && (
        <div className="bg-slate-50/80 border border-slate-300/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Centered Premise / Given Information */}
          {question.premise && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Given Information / Conditions
              </span>
              <div className="text-sm sm:text-base font-semibold text-slate-900 font-serif">
                {renderFormattedText(question.premise)}
              </div>
            </div>
          )}

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Column A */}
            <div className="bg-white border-2 border-indigo-200 hover:border-indigo-300 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xs transition-colors">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-extrabold uppercase tracking-wide mb-2">
                <span>Column A</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 font-serif min-h-[36px] flex items-center justify-center">
                {question.columnA || "(Quantity in Column A)"}
              </div>
            </div>

            {/* Column B */}
            <div className="bg-white border-2 border-purple-200 hover:border-purple-300 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xs transition-colors">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-extrabold uppercase tracking-wide mb-2">
                <span>Column B</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-900 font-serif min-h-[36px] flex items-center justify-center">
                {question.columnB || "(Quantity in Column B)"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Diagram / Graph / Chart Image */}
      {imageUrl && (
        <div className="space-y-1.5">
          <div className="relative group bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center p-3 sm:p-4">
            <img
              src={imageUrl}
              alt={question.imageCaption || 'Question Diagram or Graph'}
              className="max-h-72 sm:max-h-96 w-auto object-contain rounded-lg shadow-xs"
              loading="lazy"
              onError={(e) => {
                // Fallback image error placeholder
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setZoomImageUrl(imageUrl)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1 opacity-90 group-hover:opacity-100"
              title="Expand Image"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">Zoom</span>
            </button>
          </div>
          {question.imageCaption && (
            <p className="text-[11px] text-center text-slate-500 italic">
              Figure: {question.imageCaption}
            </p>
          )}
        </div>
      )}

      {/* 4. Graph Data / Raw SVG Renderer if provided */}
      {question.graphData && question.graphData.trim().startsWith('<svg') && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center shadow-xs overflow-x-auto">
          <div 
            className="w-full max-w-md"
            dangerouslySetInnerHTML={{ __html: question.graphData }}
          />
          {question.imageCaption && (
            <p className="text-[11px] text-center text-slate-500 mt-2 italic">
              {question.imageCaption}
            </p>
          )}
        </div>
      )}

      {/* 5. Code Block / Formula Snippet */}
      {question.codeBlock && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 font-sans">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              Code / Formula Reference
            </span>
          </div>
          <pre className="whitespace-pre">{question.codeBlock}</pre>
        </div>
      )}

      {/* 6. Multiple Choice Options Grid / List */}
      <div className="space-y-2.5 pt-1">
        {optionsList.map((optionText, optIdx) => {
          const optLetter = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D', 'E'
          const optionImage = question.optionImages?.[optIdx];

          // Determine selection state
          let isSelected = false;
          if (isMultiChoice) {
            isSelected = showAnswerFeedback 
              ? (userSelectedIndices?.includes(optIdx) || false)
              : selectedOptionIndices.includes(optIdx);
          } else {
            isSelected = showAnswerFeedback
              ? userSelectedIndex === optIdx
              : selectedOptionIndex === optIdx;
          }

          // Feedback mode styling
          let isCorrectAnswer = false;
          if (showAnswerFeedback) {
            if (isMultiChoice) {
              isCorrectAnswer = question.correctAnswerIndices?.includes(optIdx) || false;
            } else {
              isCorrectAnswer = question.correctAnswerIndex === optIdx;
            }
          }

          let containerClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70';
          let badgeClass = 'bg-white border border-slate-200 text-slate-700';

          if (showAnswerFeedback) {
            if (isCorrectAnswer) {
              containerClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-300 font-medium';
              badgeClass = 'bg-emerald-600 text-white shadow-xs';
            } else if (isSelected && !isCorrectAnswer) {
              containerClass = 'bg-red-50 border-red-300 text-red-950 font-medium';
              badgeClass = 'bg-red-600 text-white shadow-xs';
            } else {
              containerClass = 'bg-white border-slate-200 text-slate-500 opacity-80';
            }
          } else if (isSelected) {
            containerClass = 'bg-emerald-50 border-emerald-500 text-slate-900 shadow-xs ring-1 ring-emerald-300';
            badgeClass = 'bg-emerald-600 text-white shadow-xs';
          }

          const handleClick = () => {
            if (readOnly || showAnswerFeedback) return;
            if (isMultiChoice && onToggleOptionMulti) {
              onToggleOptionMulti(optIdx);
            } else if (onSelectOption) {
              onSelectOption(optIdx);
            }
          };

          return (
            <div
              key={optIdx}
              onClick={handleClick}
              className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl border transition-all ${
                readOnly || showAnswerFeedback ? 'cursor-default' : 'cursor-pointer'
              } ${containerClass}`}
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Option Letter Badge */}
                <div
                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all shrink-0 ${badgeClass}`}
                >
                  {optLetter}
                </div>

                {/* Option Text */}
                <span className="text-xs sm:text-sm font-medium leading-normal flex-1 sm:hidden">
                  {optionText}
                </span>

                {/* Status indicator on mobile */}
                <div className="sm:hidden ml-auto">
                  {showAnswerFeedback ? (
                    isCorrectAnswer ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Correct</span>
                    ) : isSelected ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">Your Answer</span>
                    ) : null
                  ) : (
                    <div className={`w-4 h-4 ${isMultiChoice ? 'rounded-md' : 'rounded-full'} border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Option Text (Desktop) */}
              <div className="hidden sm:block flex-1">
                <div className="text-xs sm:text-sm font-medium leading-normal">
                  {optionText}
                </div>
              </div>

              {/* Option Specific Image (if option is an equation/diagram) */}
              {optionImage && (
                <div className="mt-2 sm:mt-0 max-w-[140px] max-h-20 bg-white p-1 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                  <img 
                    src={optionImage} 
                    alt={`Option ${optLetter} visual`} 
                    className="h-full w-full object-contain rounded"
                  />
                </div>
              )}

              {/* Indicator (Desktop) */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                {showAnswerFeedback ? (
                  isCorrectAnswer ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" /> Correct Answer
                    </span>
                  ) : isSelected ? (
                    <span className="text-[11px] font-bold text-red-700 bg-red-100/90 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <X className="w-3 h-3" /> Your Answer
                    </span>
                  ) : null
                ) : (
                  <div
                    className={`w-4 h-4 ${isMultiChoice ? 'rounded-md' : 'rounded-full'} border flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 group-hover:border-slate-400 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7. Image Lightbox Zoom Modal */}
      {zoomImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl p-4 shadow-2xl flex flex-col items-center">
            <button
              type="button"
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-800 mb-3 self-start">
              High Resolution Diagram / Graph Inspection
            </h3>
            <div className="w-full max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-2">
              <img
                src={zoomImageUrl}
                alt="Enlarged diagram"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            {question.imageCaption && (
              <p className="text-xs text-slate-600 mt-2.5 text-center font-medium">
                {question.imageCaption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
