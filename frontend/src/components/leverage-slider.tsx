import React from "react";

interface LeverageSliderProps {
  leverage: number;
  maxLeverage?: number;
  onChange: (val: number) => void;
}

const LeverageSlider: React.FC<LeverageSliderProps> = ({ leverage, maxLeverage = 50, onChange }) => {
  return (
    <div className="relative mb-6">
      <label htmlFor="leverage-range" className="block mb-2">Leverage</label>
      <div className="relative w-full">
        <input
          id="leverage-range"
          type="range"
          min="1"
          max={maxLeverage}
          value={leverage}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600"
          style={{
            background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${(leverage - 1) / (maxLeverage - 1) * 100}%, #e5e7eb ${(leverage - 1) / (maxLeverage - 1) * 100}%, #e5e7eb 100%)`
          }}
        />

        {/* Tooltip */}
        <div
          className="absolute -bottom-6 px-2 py-1 text-xs font-semibold bg-teal-600 text-white rounded shadow transition-all"
          style={{
            left: `calc(${((leverage - 1) / (maxLeverage - 1)) * 100}% - 10px)`,
            minWidth: "32px",
            textAlign: "center"
          }}
        >
          {leverage}x
        </div>
      </div>

      {/* Static labels */}
      <div className="flex justify-between mt-7 text-sm text-gray-500">
        <span>1x</span>
        <span>{Math.floor(maxLeverage / 2)}x</span>
        <span>{maxLeverage}x</span>
      </div>
    </div>
  );
};

export default LeverageSlider;
