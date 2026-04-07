/// <reference types="vite/client" />

// Allow importing CSS Module files
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
