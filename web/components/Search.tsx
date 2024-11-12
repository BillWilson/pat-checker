'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnalysisResult } from "@/types/patent"
import { getLikelihoodColor } from "@/utils/patent"

type SearchParams = {
  patentId: string
  companyName: string
}

// API Service
const analyzePatent = async ({ patentId, companyName }: SearchParams): Promise<AnalysisResult> => {
  // Create URL with query parameters
  const params = new URLSearchParams({
    patent_id: patentId,
    company_name: companyName
  })

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/search?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to analyze patent')
  }

  return response.json()
}

export default function Search() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get values from URL query parameters
  const patentId = searchParams.get('patent_id') || ''
  const companyName = searchParams.get('company_name') || ''

  // Create query parameters object for the API call
  const queryParams: SearchParams = {
    patentId,
    companyName,
  }

  const {
    data: analysisResult,
    error,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['patentAnalysis', queryParams],
    queryFn: () => analyzePatent(queryParams),
    enabled: Boolean(patentId && companyName), // Only run when both parameters are present
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newPatentId = formData.get('patentId') as string
    const newCompanyName = formData.get('companyName') as string

    // Create new URLSearchParams object
    const params = new URLSearchParams()
    if (newPatentId) params.set('patent_id', newPatentId)
    if (newCompanyName) params.set('company_name', newCompanyName)

    // Update URL with new search parameters
    router.push(`?${params.toString()}`)
  }

  // Reset form handler
  const handleReset = () => {
    router.push('/')
  }

  // Share URL button handler
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('URL copied to clipboard!'))
      .catch((err) => console.error('Failed to copy URL:', err))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Patent Infringement Analyzer</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="patentId">Patent ID</Label>
            <Input
              id="patentId"
              name="patentId"
              defaultValue={patentId}
              placeholder="Enter Patent ID"
              required
            />
          </div>
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              name="companyName"
              defaultValue={companyName}
              placeholder="Enter Company Name"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isFetching} className="flex-1">
              {isFetching ? 'Analyzing...' : 'Analyze'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleShare}
              disabled={!patentId && !companyName}
            >
              Share URL
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={!patentId && !companyName}
            >
              Reset
            </Button>
          </div>
        </div>
      </form>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error instanceof Error ? error.message : 'An error occurred while analyzing the patent'}
          </AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
              <CardDescription>
                Analysis ID: {analysisResult.analysis_id} | Date: {analysisResult.analysis_date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Patent ID</p>
                      <p className="font-mono">{analysisResult.patent_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p>{analysisResult.company_name}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Risk Assessment</p>
                    <p className="text-sm">{analysisResult.overall_risk_assessment}</p>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">Infringing Products Analysis</h3>
                  {analysisResult.top_infringing_products.map((product, index) => (
                    <Card key={index} className="mt-4">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{product.product_name}</CardTitle>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLikelihoodColor(product.infringement_likelihood)}`}>
                            {product.infringement_likelihood}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Relevant Claims</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.relevant_claims.map(claim => (
                                <Badge key={claim} variant="outline">{claim}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Explanation</p>
                            <p className="text-sm mt-1">{product.explanation}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Specific Features</p>
                            <ul className="list-disc pl-5 text-sm mt-1">
                              {product.specific_features.map((feature, featureIndex) => (
                                <li key={featureIndex}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
