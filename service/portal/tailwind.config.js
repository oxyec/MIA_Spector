import { tsNamespaceExportDeclaration } from "@babel/types"

// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: "#1E2630", // 比 800 再深一点，显得柔和不刺眼
        },
      },
    },
  }
  ,
  plugins: [],
}
