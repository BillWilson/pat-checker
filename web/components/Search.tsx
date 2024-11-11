'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Types
type InfringingProduct = {
  product_name: string
  infringement_likelihood: string
  relevant_claims: string[]
  explanation: string
  specific_features: string[]
}

type AnalysisResult = {
  analysis_id: string
  patent_id: string
  company_name: string
  analysis_date: string
  top_infringing_products: InfringingProduct[]
  overall_risk_assessment: string
}

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
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
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
              <CardTitle className='text-2xl font-extrabold dark:text-white'>Analysis Result</CardTitle>
              <CardDescription>
                Analysis ID: {analysisResult.analysis_id} | Date: {analysisResult.analysis_date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p><strong>Patent ID:</strong> {analysisResult.patent_id}</p>
              <p><strong>Company Name:</strong> {analysisResult.company_name}</p>
              <p className="mt-4"><strong>Overall Risk Assessment:</strong></p>
              <p>{analysisResult.overall_risk_assessment}</p>
            </CardContent>
          </Card>

          <h3 className='text-xl font-extrabold dark:text-white'>Top Infringing Products</h3>

          {analysisResult.top_infringing_products.map((product, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{product.product_name}</CardTitle>
                <CardDescription>
                  Infringement Likelihood: {product.infringement_likelihood}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p><strong>Relevant Claims:</strong> {product.relevant_claims.join(', ')}</p>
                <p className="mt-2"><strong>Explanation:</strong></p>
                <p>{product.explanation}</p>
                <p className="mt-2"><strong>Specific Features:</strong></p>
                <ul className="list-disc pl-5">
                  {product.specific_features.map((feature, featureIndex) => (
                    <li key={featureIndex}>{feature}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
