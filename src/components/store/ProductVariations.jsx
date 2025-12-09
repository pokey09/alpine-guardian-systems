import React from 'react';
import { Label } from '@/components/ui/label';

export default function ProductVariations({ variations, selectedVariations, onVariationChange }) {
  if (!variations || variations.length === 0) return null;

  return (
    <div className="space-y-4">
      {variations.map((variation, varIndex) => (
        <div key={varIndex}>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            {variation.name}
          </Label>
          <div className="flex flex-wrap gap-2">
            {variation.options?.map((option, optIndex) => {
              const isSelected = selectedVariations[variation.name] === option.value;
              return (
                <button
                  key={optIndex}
                  onClick={() => onVariationChange(variation.name, option.value, option.price_adjustment || 0)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                    isSelected
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {option.value}
                  {option.price_adjustment !== 0 && (
                    <span className="ml-1 text-xs">
                      ({option.price_adjustment > 0 ? '+' : ''}${option.price_adjustment})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}