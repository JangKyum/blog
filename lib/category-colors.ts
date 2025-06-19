export const getCategoryColor = (category: string) => {
  // Only default color remains since all categories are removed
  return "bg-gray-100 text-gray-700 border-gray-200"
}

export const getCategoryHoverColor = (category: string) => {
  return "hover:bg-gray-200"
}

export const categories: string[] = []
