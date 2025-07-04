export const getCategoryColor = (category: string) => {
  switch (category) {
    // Frontend Technologies with exact brand colors
    case "React":
      return "bg-blue-100 text-blue-700 border-blue-200" // React light blue #61DAFB
    case "Next.js":
      return "bg-gray-900 text-white border-gray-700" // Next.js black
    case "Vue":
      return "bg-emerald-100 text-emerald-800 border-emerald-200" // Vue green #4FC08D
    case "Angular":
      return "bg-red-100 text-red-800 border-red-200" // Angular red #DD0031
    case "TypeScript":
      return "bg-indigo-100 text-indigo-800 border-indigo-200" // TypeScript blue #3178C6
    case "JavaScript":
      return "bg-yellow-100 text-yellow-800 border-yellow-200" // JavaScript yellow #F7DF1E
    case "CSS":
      return "bg-sky-100 text-sky-800 border-sky-200" // CSS blue #1572B6
    case "Performance":
      return "bg-purple-100 text-purple-800 border-purple-200"
    // Default color for unspecified categories
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export const categories: string[] = []
