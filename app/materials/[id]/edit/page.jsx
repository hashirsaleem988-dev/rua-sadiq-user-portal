'use client'

import MaterialForm from '@/components/MaterialForm'

export default function EditMaterialPage({ params }) {
  return <MaterialForm materialId={params?.id} />
}
