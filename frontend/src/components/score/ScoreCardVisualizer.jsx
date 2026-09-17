import React from 'react';
import { DrawBall } from '../draw/DrawBall';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Plus, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ScoreCardVisualizer = ({
  scores = [],
  onAddScoreClick
}) => {
  const maxSlots = 5;
  const isComplete = scores.length === maxSlots;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage/30 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage-light">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink">
              Your 5-Ball Draw Combination
            </h3>
            {isComplete ? (
              <Badge variant="success" size="sm" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active & Eligible</span>
              </Badge>
            ) : (
              <Badge variant="warning" size="sm" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{scores.length}/5 Scores Entered</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            Your 5 latest Stableford rounds form your official entry numbers in every monthly prize draw.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={onAddScoreClick} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          <span>Add Round</span>
        </Button>
      </div>

      {/* 5 Balls Presentation Grid */}
      <div className="py-8 grid grid-cols-5 gap-2 sm:gap-4 max-w-2xl mx-auto">
        {Array.from({ length: maxSlots }).map((_, index) => {
          const scoreRecord = scores[index];
          return (
            <div key={index} className="flex flex-col items-center text-center">
              {scoreRecord ? (
                <div className="flex flex-col items-center gap-2 group">
                  <DrawBall
                    number={scoreRecord.score}
                    size="lg"
                    matched={false}
                    animated={true}
                    delay={index * 0.08}
                  />
                  <div className="mt-1">
                    <span className="text-[10px] font-semibold text-ink-muted uppercase block">
                      Ball #{index + 1}
                    </span>
                    <span className="text-[11px] font-medium text-pine-dark truncate max-w-[70px] sm:max-w-[90px] block" title={scoreRecord.course_name}>
                      {scoreRecord.course_name || 'Home Club'}
                    </span>
                    <span className="text-[10px] text-ink-muted block">
                      {new Date(scoreRecord.played_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={onAddScoreClick}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-sage/60 bg-canvas/60 flex flex-col items-center justify-center cursor-pointer hover:border-pine hover:bg-pine/5 transition-all text-sage hover:text-pine"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-0.5">#{index + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footnote Rule */}
      <div className="pt-4 border-t border-sage-light flex items-center justify-between text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-pine" />
          <span>
            {isComplete
              ? 'Complete combination active. Recording a 6th score automatically updates your combination by dropping your oldest round.'
              : `You need ${maxSlots - scores.length} more round(s) recorded to become eligible for the next monthly draw.`}
          </span>
        </div>
      </div>
    </div>
  );
};
