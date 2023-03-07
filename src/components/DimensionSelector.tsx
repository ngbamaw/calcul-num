import { useState } from "react";
import prices from "../price.json";

const { dimensions } = prices.bobine;

interface Props {
  exclude: number[];
  value: number;
  onChange: (diameter: number) => void;
}

const DimensionSelector: React.FC<Props> = ({ exclude, value, onChange }) => {
  return (
    <select value={value} onChange={(e) => onChange(+e.target.value)}>
      {dimensions.map((dimension) => {
        if (!exclude.includes(dimension.diametre)) {
          return (
            <option key={dimension.diametre} value={dimension.diametre}>
              {dimension.diametre / 10} cm
            </option>
          );
        }
        return null;
      })}
    </select>
  );
};

export default DimensionSelector;
