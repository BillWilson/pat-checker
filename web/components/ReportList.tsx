'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AnalysisResult } from "@/types/patent"
import { getLikelihoodColor } from "@/utils/patent"


// API Service
const fetchAnalyses = async (): Promise<AnalysisResult[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/list`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to fetch analyses')
  }

  return response.json()
}

export default function ReportList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')

  const {
    data: analyses,
    error: listError,
    isError: isListError,
    isFetching: isListFetching
  } = useQuery({
    queryKey: ['analyses'],
    queryFn: fetchAnalyses,
  })

  // Get selected analysis from the list
  const selectedAnalysis = selectedId
    ? analyses?.find(analysis => analysis.analysis_id === Number(selectedId))
    : null

  const handleViewAnalysis = (id: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('id', id.toString())
    router.push(`?${params.toString()}`)
  }

  const handleNewSearch = () => {
    router.push('/search')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Patent Infringement Analyses</h1>
        <Button onClick={handleNewSearch}>New Analysis</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Analysis List</CardTitle>
            <CardDescription>
              Found {analyses?.length || 0} analysis results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isListError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  {listError instanceof Error ? listError.message : 'Failed to load analyses'}
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Patent</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isListFetching ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : analyses?.map((analysis) => (
                    <TableRow
                      key={analysis.analysis_id}
                      className={Number(selectedId) === analysis.analysis_id ? "bg-muted" : ""}
                    >
                      <TableCell>{analysis.analysis_id}</TableCell>
                      <TableCell className="font-mono">{analysis.patent_id}</TableCell>
                      <TableCell>{analysis.company_name}</TableCell>
                      <TableCell>{analysis.analysis_date}</TableCell>
                      <TableCell>
                        {analysis.top_infringing_products.some(p => p.infringement_likelihood === 'High') && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            High Risk
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleViewAnalysis(analysis.analysis_id)}
                          variant={Number(selectedId) === analysis.analysis_id ? "secondary" : "default"}
                          size="sm"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Details</CardTitle>
            <CardDescription>
              {selectedAnalysis
                ? `Analysis ID: ${selectedAnalysis.analysis_id} | Date: ${selectedAnalysis.analysis_date}`
                : 'Select an analysis to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isListFetching ? (
              <div className="h-[600px] flex items-center justify-center">
                Loading...
              </div>
            ) : selectedAnalysis ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Patent ID</p>
                      <p className="font-mono">{selectedAnalysis.patent_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p>{selectedAnalysis.company_name}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Risk Assessment</p>
                    <p className="text-sm">{selectedAnalysis.overall_risk_assessment}</p>
                  </div>

                  <h3 className="text-lg font-semibold mt-6">Infringing Products Analysis</h3>
                  {selectedAnalysis.top_infringing_products.map((product, index) => (
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
            ) : (
              <p className="text-center text-muted-foreground">
                No analysis selected. Please choose an analysis from the list.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
