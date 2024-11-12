// types/patent.ts
export type InfringingProduct = {
  product_name: string
  infringement_likelihood: string
  relevant_claims: string[]
  explanation: string
  specific_features: string[]
}

export type AnalysisResult = {
  analysis_id: number
  patent_id: string
  company_name: string
  analysis_date: string
  top_infringing_products: InfringingProduct[]
  overall_risk_assessment: string
}
