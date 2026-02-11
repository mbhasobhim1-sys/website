"use client"

import { useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  FileText,
  ClipboardList,
  Users,
  Building2,
  Lock,
  ArrowRight,
  Inbox,
} from "lucide-react"

interface Form {
  id: string
  title: string
  description: string | null
  category: string
  requires_auth: boolean
  created_at: string
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  application: { label: "Application", icon: ClipboardList, color: "bg-primary/10 text-primary" },
  survey: { label: "Survey", icon: Users, color: "bg-accent/10 text-accent" },
  registration: { label: "Registration", icon: FileText, color: "bg-chart-3/10 text-chart-3" },
  government: { label: "Government", icon: Building2, color: "bg-chart-4/10 text-chart-4" },
  general: { label: "General", icon: FileText, color: "bg-muted-foreground/10 text-muted-foreground" },
}

export function FormsListing({ forms }: { forms: Form[] }) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const categories = ["all", ...new Set(forms.map((f) => f.category))]

  const filtered = forms.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchesCategory = activeCategory === "all" || f.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h1 className="text-pretty text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Online Forms Portal
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Browse, fill out, and submit official forms online. Access applications, surveys,
              registration forms, and government documents all in one place.
            </p>
          </div>
          <div className="mt-8 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search forms..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const config = categoryConfig[cat]
              return (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="capitalize"
                >
                  {cat === "all" ? "All Forms" : config?.label ?? cat}
                </Button>
              )
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">No forms found</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              {search
                ? "Try adjusting your search terms or browse a different category."
                : "No forms have been published yet. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((form) => {
              const config = categoryConfig[form.category] ?? categoryConfig.general
              const Icon = config.icon

              return (
                <Link key={form.id} href={`/forms/${form.id}`}>
                  <Card className="group h-full transition-all hover:border-primary/30 hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {form.requires_auth && (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Lock className="h-3 w-3" />
                            Login required
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-3 text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {form.title}
                      </CardTitle>
                      {form.description && (
                        <CardDescription className="line-clamp-2 leading-relaxed">
                          {form.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {config.label}
                        </Badge>
                        <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          Open form
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 lg:px-8">
          <p className="text-sm text-muted-foreground">DSP Forms Platform</p>
          <p className="text-sm text-muted-foreground">All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
