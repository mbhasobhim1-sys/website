"use client"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Inbox } from "lucide-react"

interface Submission {
  id: string
  form_id: string
  data: Record<string, string | boolean>
  status: string
  submitted_at: string
  forms: {
    title: string
    category: string
    fields: Array<{ id: string; label: string; type: string }>
  } | null
}

const statusColors: Record<string, string> = {
  pending: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  approved: "bg-accent/10 text-accent border-accent/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  reviewed: "bg-primary/10 text-primary border-primary/20",
}

export function MySubmissions({ submissions }: { submissions: Submission[] }) {
  const handleDownload = async (submission: Submission) => {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    const title = submission.forms?.title ?? "Form Submission"
    doc.setFontSize(20)
    doc.text(title, 20, 25)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Submitted: ${new Date(submission.submitted_at).toLocaleDateString()}`, 20, 35)
    doc.text(`Status: ${submission.status}`, 20, 41)
    doc.setTextColor(0)

    let yPos = 55
    doc.setFontSize(12)

    const fields = submission.forms?.fields ?? []
    for (const field of fields) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.setFont("helvetica", "bold")
      doc.text(field.label, 20, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")

      const val = submission.data[field.id]
      const displayVal =
        val === undefined || val === ""
          ? "(not provided)"
          : typeof val === "boolean"
            ? val ? "Yes" : "No"
            : String(val)

      doc.text(displayVal, 20, yPos)
      yPos += 10
    }

    doc.save(`${title.replace(/\s+/g, "_")}_submission.pdf`)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Submissions</h1>
          <p className="mt-2 text-muted-foreground">
            View and download your submitted forms.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">No submissions yet</h2>
            <p className="mt-2 text-muted-foreground">
              You have not submitted any forms yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {submissions.map((sub) => (
              <Card key={sub.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-lg text-foreground">
                        {sub.forms?.title ?? "Unknown Form"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(sub.submitted_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`capitalize ${statusColors[sub.status] ?? ""}`} variant="outline">
                        {sub.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(sub)}>
                        <Download className="mr-1.5 h-4 w-4" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-2 rounded-lg bg-secondary/50 p-3 sm:grid-cols-2">
                    {sub.forms?.fields?.slice(0, 4).map((field) => {
                      const val = sub.data[field.id]
                      const displayVal =
                        val === undefined || val === ""
                          ? "-"
                          : typeof val === "boolean"
                            ? val ? "Yes" : "No"
                            : String(val)
                      return (
                        <div key={field.id} className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
                          <span className="truncate text-sm text-foreground">{displayVal}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
