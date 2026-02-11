import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { FormDetail } from "@/components/form-detail"

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .single()

  if (!form) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <FormDetail form={form} user={user} />
}
