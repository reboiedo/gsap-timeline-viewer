/// <reference path="../node_modules/gsap/types/index.d.ts" />

declare module '*.css?inline' {
  const content: string;
  export default content;
}
