import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const isAdmin = user.user_metadata?.is_admin === true
  if (!isAdmin) {
    redirect("/")
  }

  const { data: forms } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, forms(title, category, fields)")
    .order("submitted_at", { ascending: false })

  return <AdminDashboard forms={forms ?? []} submissions={submissions ?? []} />
}
