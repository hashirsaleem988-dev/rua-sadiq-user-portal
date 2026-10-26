'use client'

import CategoryForm from '@/components/CategoryForm'

export default function EditCategoryPage({ params }) {
  return <CategoryForm categoryId={params?.id} />
}
