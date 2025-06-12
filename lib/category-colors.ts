export const getCategoryColor = (category: string) => {
  switch (category) {
    case "React":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "Next.js":
      return "bg-black text-white border-black"
    case "Vue":
      return "bg-green-100 text-green-700 border-green-200"
    case "Nuxt":
      return "bg-green-100 text-green-800 border-green-300"
    case "Angular":
      return "bg-red-100 text-red-700 border-red-200"
    case "TypeScript":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "JavaScript":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "CSS":
      return "bg-blue-100 text-blue-600 border-blue-200"
    case "Performance":
      return "bg-green-100 text-green-700 border-green-200"
    case "Node.js":
      return "bg-green-100 text-green-800 border-green-200"
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
    case "Nuxt":
      return "hover:bg-green-600 hover:text-white"
    case "Angular":
      return "hover:bg-red-500 hover:text-white"
    case "TypeScript":
      return "hover:bg-blue-600 hover:text-white"
    case "JavaScript":
      return "hover:bg-yellow-500 hover:text-white"
    case "CSS":
      return "hover:bg-blue-500 hover:text-white"
    case "Performance":
      return "hover:bg-green-500 hover:text-white"
    case "Node.js":
      return "hover:bg-green-600 hover:text-white"
    default:
      return "hover:bg-gray-200"
  }
}

export const categories = [
  "React",
  "Next.js",
  "Vue",
  "Nuxt",
  "Angular",
  "TypeScript",
  "JavaScript",
  "CSS",
  "Performance",
  "Node.js",
]
