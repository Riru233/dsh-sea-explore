// example.tsx
import { useGlass } from './useGlass';

export const Example = () => {
  useGlass();

  return (
    <div data-glass data-glass-light 
      style={{
          borderTop: "1px solid #fff6",
          borderBottom: "1px solid #fff6",
          outline: "1px solid rgba(35,35,35,0.3)",
          boxShadow: "0px 8px 16px rgba(40,40,40,0.2)",
      }}></div>
  );
};