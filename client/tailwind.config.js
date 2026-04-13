export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'","sans-serif"],
        body:    ["'Plus Jakarta Sans'","sans-serif"],
        mono:    ["'JetBrains Mono'","monospace"],
      },
      colors: {
        qf: {
          bg:      "#060811",
          surface: "#0d1022",
          card:    "#111629",
          border:  "#1c2240",
          cyan:    "#06f7d9",
          violet:  "#7c5cfc",
          pink:    "#f72b8b",
          amber:   "#ffb938",
          green:   "#0df2a0",
          red:     "#ff3d6e",
          text:    "#eef0f8",
          muted:   "#5a6285",
        }
      }
    }
  },
  plugins: []
}
