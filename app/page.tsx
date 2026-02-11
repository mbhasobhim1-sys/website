import { createClient } from "@/lib/supabase/server"
import { FormsListing } from "@/components/forms-listing"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, description, category, requires_auth, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  return <FormsListing forms={forms ?? []} />
}
