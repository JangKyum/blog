export const getCategoryColor = (category: string) => {
  switch (category) {
    case "React":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "Next.js":
      return "bg-gray-900 text-white border-gray-800"
    case "Vue":
      return "bg-green-100 text-green-700 border-green-200"
    case "Angular":
      return "bg-red-200 text-red-800 border-red-300"
    case "TypeScript":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "JavaScript":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "CSS":
      return "bg-cyan-100 text-cyan-800 border-cyan-200"
    case "Performance":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export const getCategoryHoverColor = (category: string) => {
  switch (category) {
    case "React":
      return "hover:bg-blue-500 hover:text-white"
    case "Next.js":
      return "hover:bg-gray-800 hover:text-white"
    case "Vue":
      return "hover:bg-green-500 hover:text-white"
    case "Angular":
      return "hover:bg-red-500 hover:text-white"
    case "TypeScript":
      return "hover:bg-blue-600 hover:text-white"
    case "JavaScript":
      return "hover:bg-yellow-500 hover:text-white"
    case "CSS":
      return "hover:bg-cyan-500 hover:text-white"
    case "Performance":
      return "hover:bg-green-500 hover:text-white"
    default:
      return "hover:bg-gray-200"
  }
}

export const categories = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "TypeScript",
  "JavaScript",
  "CSS",
  "Performance",
]
