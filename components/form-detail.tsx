"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Loader2, CheckCircle2, Lock } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

interface FormField {
  id: string
  label: string
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "tel"
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FormData {
  id: string
  title: string
  description: string | null
  category: string
  fields: FormField[]
  requires_auth: boolean
}

export function FormDetail({ form, user }: { form: FormData; user: User | null }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (form.requires_auth && !user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Login Required</h1>
          <p className="mt-3 text-muted-foreground">
            You need to be signed in to access this form.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/auth/login">
              <Button>Sign in</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to forms</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from("submissions").insert({
      form_id: form.id,
      user_id: user?.id ?? null,
      submitter_name: user?.user_metadata?.full_name ?? (formValues["_name"] as string) ?? null,
      submitter_email: user?.email ?? (formValues["_email"] as string) ?? null,
      data: formValues,
      status: "pending",
    })

    if (error) {
      toast.error("Failed to submit form. Please try again.")
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    toast.success("Form submitted successfully!")
  }

  const handleDownloadBlank = async () => {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text(form.title, 20, 25)

    if (form.description) {
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(form.description, 20, 35)
      doc.setTextColor(0)
    }

    let yPos = form.description ? 50 : 40

    doc.setFontSize(12)
    for (const field of form.fields) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      const label = field.required ? `${field.label} *` : field.label
      doc.text(label, 20, yPos)
      yPos += 6

      if (field.type === "textarea") {
        doc.setDrawColor(180)
        doc.rect(20, yPos, 170, 20)
        yPos += 28
      } else if (field.type === "checkbox") {
        doc.setDrawColor(180)
        doc.rect(20, yPos - 3, 4, 4)
        doc.text("Yes", 27, yPos)
        yPos += 10
      } else if (field.type === "radio" && field.options) {
        for (const opt of field.options) {
          doc.circle(22, yPos - 1, 2)
          doc.text(opt, 27, yPos)
          yPos += 7
        }
        yPos += 3
      } else if (field.type === "select" && field.options) {
        doc.text(`Options: ${field.options.join(", ")}`, 20, yPos)
        yPos += 6
        doc.setDrawColor(180)
        doc.rect(20, yPos, 170, 8)
        yPos += 15
      } else {
        doc.setDrawColor(180)
        doc.rect(20, yPos, 170, 8)
        yPos += 15
      }
    }

    doc.save(`${form.title.replace(/\s+/g, "_")}_blank.pdf`)
  }

  const handleDownloadFilled = async () => {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text(form.title, 20, 25)

    if (form.description) {
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(form.description, 20, 35)
      doc.setTextColor(0)
    }

    let yPos = form.description ? 50 : 40

    doc.setFontSize(12)
    for (const field of form.fields) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.setFont("helvetica", "bold")
      doc.text(field.label, 20, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")

      const val = formValues[field.id]
      const displayVal =
        val === undefined || val === ""
          ? "(not provided)"
          : typeof val === "boolean"
            ? val ? "Yes" : "No"
            : String(val)

      doc.text(displayVal, 20, yPos)
      yPos += 10
    }

    doc.save(`${form.title.replace(/\s+/g, "_")}_filled.pdf`)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Form Submitted</h1>
          <p className="mt-3 text-muted-foreground">
            Your submission has been received and is being reviewed.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button onClick={handleDownloadFilled} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Filled PDF
            </Button>
            <Link href="/">
              <Button>Back to forms</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="w-fit capitalize">
                  {form.category}
                </Badge>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {form.title}
                </CardTitle>
                {form.description && (
                  <CardDescription className="text-base leading-relaxed">
                    {form.description}
                  </CardDescription>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadBlank}>
                <Download className="mr-1.5 h-4 w-4" />
                Blank PDF
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
              {!user && (
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/50 p-4">
                  <p className="text-sm font-medium text-foreground">Your Information</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="_name">Full Name</Label>
                      <Input
                        id="_name"
                        placeholder="Your name"
                        value={(formValues["_name"] as string) ?? ""}
                        onChange={(e) => handleFieldChange("_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="_email">Email</Label>
                      <Input
                        id="_email"
                        type="email"
                        placeholder="your@email.com"
                        value={(formValues["_email"] as string) ?? ""}
                        onChange={(e) => handleFieldChange("_email", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {form.fields.map((field) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="ml-1 text-destructive">*</span>}
                  </Label>

                  {field.type === "text" || field.type === "email" || field.type === "number" || field.type === "tel" || field.type === "date" ? (
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={(formValues[field.id] as string) ?? ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.id}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={4}
                      value={(formValues[field.id] as string) ?? ""}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    />
                  ) : field.type === "select" && field.options ? (
                    <Select
                      required={field.required}
                      value={(formValues[field.id] as string) ?? ""}
                      onValueChange={(val) => handleFieldChange(field.id, val)}
                    >
                      <SelectTrigger id={field.id}>
                        <SelectValue placeholder={field.placeholder ?? "Select an option"} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={field.id}
                        checked={(formValues[field.id] as boolean) ?? false}
                        onCheckedChange={(checked) => handleFieldChange(field.id, !!checked)}
                      />
                      <Label htmlFor={field.id} className="text-sm font-normal text-muted-foreground">
                        {field.placeholder ?? "Yes"}
                      </Label>
                    </div>
                  ) : field.type === "radio" && field.options ? (
                    <RadioGroup
                      value={(formValues[field.id] as string) ?? ""}
                      onValueChange={(val) => handleFieldChange(field.id, val)}
                      required={field.required}
                    >
                      {field.options.map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                          <Label htmlFor={`${field.id}-${opt}`} className="font-normal">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : null}
                </div>
              ))}

              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Form
                </Button>
                <Button type="button" variant="outline" onClick={handleDownloadBlank}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Blank PDF
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
