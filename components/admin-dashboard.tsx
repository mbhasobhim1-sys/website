"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  FileText,
  Users,
  ClipboardList,
  Loader2,
  Trash2,
  Eye,
  Download,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface FormField {
  id: string
  label: string
  type: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface Form {
  id: string
  title: string
  description: string | null
  category: string
  fields: FormField[]
  is_public: boolean
  requires_auth: boolean
  created_at: string
}

interface Submission {
  id: string
  form_id: string
  user_id: string | null
  submitter_name: string | null
  submitter_email: string | null
  data: Record<string, string | boolean>
  status: string
  submitted_at: string
  forms: {
    title: string
    category: string
    fields: FormField[]
  } | null
}

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "tel", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkbox" },
]

const statusColors: Record<string, string> = {
  pending: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  approved: "bg-accent/10 text-accent border-accent/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  reviewed: "bg-primary/10 text-primary border-primary/20",
}

export function AdminDashboard({
  forms: initialForms,
  submissions: initialSubmissions,
}: {
  forms: Form[]
  submissions: Submission[]
}) {
  const router = useRouter()
  const [forms] = useState(initialForms)
  const [submissions] = useState(initialSubmissions)
  const [createOpen, setCreateOpen] = useState(false)
  const [viewSub, setViewSub] = useState<Submission | null>(null)
  const [creating, setCreating] = useState(false)

  // Form creation state
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newCategory, setNewCategory] = useState("general")
  const [newRequiresAuth, setNewRequiresAuth] = useState(false)
  const [newFields, setNewFields] = useState<FormField[]>([])

  const addField = () => {
    setNewFields((prev) => [
      ...prev,
      {
        id: `field_${Date.now()}`,
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        options: [],
      },
    ])
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    setNewFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    )
  }

  const removeField = (index: number) => {
    setNewFields((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateForm = async () => {
    if (!newTitle.trim() || newFields.length === 0) {
      toast.error("Please provide a title and at least one field.")
      return
    }

    for (const field of newFields) {
      if (!field.label.trim()) {
        toast.error("All fields must have a label.")
        return
      }
    }

    setCreating(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("forms").insert({
      title: newTitle,
      description: newDescription || null,
      category: newCategory,
      fields: newFields,
      is_public: true,
      requires_auth: newRequiresAuth,
      created_by: user?.id,
    })

    if (error) {
      toast.error("Failed to create form.")
      setCreating(false)
      return
    }

    toast.success("Form created successfully!")
    setCreateOpen(false)
    setNewTitle("")
    setNewDescription("")
    setNewCategory("general")
    setNewRequiresAuth(false)
    setNewFields([])
    setCreating(false)
    router.refresh()
  }

  const handleDeleteForm = async (formId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("forms").delete().eq("id", formId)
    if (error) {
      toast.error("Failed to delete form.")
      return
    }
    toast.success("Form deleted.")
    router.refresh()
  }

  const handleStatusChange = async (submissionId: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("submissions")
      .update({ status })
      .eq("id", submissionId)

    if (error) {
      toast.error("Failed to update status.")
      return
    }
    toast.success(`Status updated to ${status}.`)
    router.refresh()
  }

  const handleDownloadSubmission = async (sub: Submission) => {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text(sub.forms?.title ?? "Submission", 20, 25)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Submitted by: ${sub.submitter_name ?? "Anonymous"} (${sub.submitter_email ?? "N/A"})`, 20, 35)
    doc.text(`Date: ${new Date(sub.submitted_at).toLocaleDateString()}`, 20, 41)
    doc.text(`Status: ${sub.status}`, 20, 47)
    doc.setTextColor(0)

    let yPos = 60
    doc.setFontSize(12)

    const fields = sub.forms?.fields ?? []
    for (const field of fields) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.setFont("helvetica", "bold")
      doc.text(field.label, 20, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")
      const val = sub.data[field.id]
      const displayVal =
        val === undefined || val === ""
          ? "(not provided)"
          : typeof val === "boolean"
            ? val ? "Yes" : "No"
            : String(val)
      doc.text(displayVal, 20, yPos)
      yPos += 10
    }

    doc.save(`submission_${sub.id.slice(0, 8)}.pdf`)
  }

  const totalForms = forms.length
  const totalSubmissions = submissions.length
  const pendingCount = submissions.filter((s) => s.status === "pending").length

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage forms and review submissions.</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Form
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Form</DialogTitle>
                <DialogDescription>
                  Define your form structure with fields that users will fill out.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="form-title">Title</Label>
                  <Input
                    id="form-title"
                    placeholder="e.g., Employee Registration Form"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="form-desc">Description</Label>
                  <Textarea
                    id="form-desc"
                    placeholder="Brief description of this form..."
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label>Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="application">Application</SelectItem>
                        <SelectItem value="survey">Survey</SelectItem>
                        <SelectItem value="registration">Registration</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 justify-end">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="requires-auth"
                        checked={newRequiresAuth}
                        onCheckedChange={(checked) => setNewRequiresAuth(!!checked)}
                      />
                      <Label htmlFor="requires-auth" className="font-normal">
                        Require login to submit
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Form Fields</Label>
                    <Button variant="outline" size="sm" onClick={addField}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Field
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    {newFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="rounded-lg border border-border bg-secondary/30 p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Field {idx + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => removeField(idx)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Label</Label>
                            <Input
                              placeholder="Field label"
                              value={field.label}
                              onChange={(e) => updateField(idx, { label: e.target.value })}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(val) => updateField(idx, { type: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypes.map((ft) => (
                                  <SelectItem key={ft.value} value={ft.value}>
                                    {ft.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs">Placeholder</Label>
                            <Input
                              placeholder="Placeholder text"
                              value={field.placeholder ?? ""}
                              onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                  updateField(idx, { required: !!checked })
                                }
                              />
                              <Label className="text-xs font-normal">Required</Label>
                            </div>
                          </div>
                        </div>
                        {(field.type === "select" || field.type === "radio") && (
                          <div className="mt-3 flex flex-col gap-1.5">
                            <Label className="text-xs">
                              Options (comma-separated)
                            </Label>
                            <Input
                              placeholder="Option 1, Option 2, Option 3"
                              value={field.options?.join(", ") ?? ""}
                              onChange={(e) =>
                                updateField(idx, {
                                  options: e.target.value
                                    .split(",")
                                    .map((o) => o.trim())
                                    .filter(Boolean),
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {newFields.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No fields added yet. Click &quot;Add Field&quot; to start building your form.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateForm} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Form
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Forms
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{totalForms}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Submissions
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{totalSubmissions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="forms">
          <TabsList>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="mt-6">
            {forms.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium text-foreground">No forms created yet</p>
                  <p className="text-sm text-muted-foreground">Create your first form to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead>Auth</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="font-medium text-foreground">{form.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {form.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{form.fields.length}</TableCell>
                        <TableCell>
                          {form.requires_auth ? (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Public</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(form.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteForm(form.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12">
                  <ClipboardList className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium text-foreground">No submissions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Submissions will appear here once users start filling out forms.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form</TableHead>
                      <TableHead>Submitter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium text-foreground">
                          {sub.forms?.title ?? "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground">{sub.submitter_name ?? "Anonymous"}</span>
                            <span className="text-xs text-muted-foreground">{sub.submitter_email ?? ""}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={sub.status}
                            onValueChange={(val) => handleStatusChange(sub.id, val)}
                          >
                            <SelectTrigger className="h-8 w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewSub(sub)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadSubmission(sub)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* View Submission Dialog */}
      <Dialog open={!!viewSub} onOpenChange={(open) => !open && setViewSub(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewSub?.forms?.title ?? "Submission"}</DialogTitle>
            <DialogDescription>
              Submitted by {viewSub?.submitter_name ?? "Anonymous"} on{" "}
              {viewSub ? new Date(viewSub.submitted_at).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {viewSub?.forms?.fields.map((field) => {
              const val = viewSub.data[field.id]
              const displayVal =
                val === undefined || val === ""
                  ? "(not provided)"
                  : typeof val === "boolean"
                    ? val ? "Yes" : "No"
                    : String(val)

              return (
                <div key={field.id} className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">{field.label}</span>
                  <span className="text-foreground">{displayVal}</span>
                </div>
              )
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => viewSub && handleDownloadSubmission(viewSub)}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={() => setViewSub(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
