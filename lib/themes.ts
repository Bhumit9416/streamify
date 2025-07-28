export const themes = {
  default: {
    name: "Default",
    primary: "bg-blue-600",
    secondary: "bg-gray-100",
    accent: "bg-blue-500",
    background: "bg-white",
    text: "text-gray-900",
    border: "border-gray-200",
  },
  dark: {
    name: "Dark",
    primary: "bg-purple-600",
    secondary: "bg-gray-800",
    accent: "bg-purple-500",
    background: "bg-gray-900",
    text: "text-white",
    border: "border-gray-700",
  },
  ocean: {
    name: "Ocean",
    primary: "bg-teal-600",
    secondary: "bg-teal-50",
    accent: "bg-teal-500",
    background: "bg-cyan-50",
    text: "text-gray-900",
    border: "border-teal-200",
  },
  sunset: {
    name: "Sunset",
    primary: "bg-orange-600",
    secondary: "bg-orange-50",
    accent: "bg-orange-500",
    background: "bg-amber-50",
    text: "text-gray-900",
    border: "border-orange-200",
  },
  forest: {
    name: "Forest",
    primary: "bg-green-600",
    secondary: "bg-green-50",
    accent: "bg-green-500",
    background: "bg-emerald-50",
    text: "text-gray-900",
    border: "border-green-200",
  },
  lavender: {
    name: "Lavender",
    primary: "bg-violet-600",
    secondary: "bg-violet-50",
    accent: "bg-violet-500",
    background: "bg-purple-50",
    text: "text-gray-900",
    border: "border-violet-200",
  },
  cherry: {
    name: "Cherry",
    primary: "bg-rose-600",
    secondary: "bg-rose-50",
    accent: "bg-rose-500",
    background: "bg-pink-50",
    text: "text-gray-900",
    border: "border-rose-200",
  },
  midnight: {
    name: "Midnight",
    primary: "bg-indigo-600",
    secondary: "bg-slate-800",
    accent: "bg-indigo-500",
    background: "bg-slate-900",
    text: "text-slate-100",
    border: "border-slate-700",
  },
} as const

export type ThemeName = keyof typeof themes

export function getThemeClasses(themeName: ThemeName) {
  return themes[themeName] || themes.default
}
