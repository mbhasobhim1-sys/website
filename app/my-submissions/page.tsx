import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MySubmissions } from "@/components/my-submissions"

export default async function MySubmissionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, form_id, data, status, submitted_at, forms(title, category, fields)")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false })

  return <MySubmissions submissions={submissions ?? []} />
}
