# Patent Infringement Check App

## Introduction

This is a demo of system that analyzes potential patent infringements by comparing patent claims against company products. The system utilizes AI to assess infringement risks and provides detailed analysis reports.

## Project Overview

This project consists of three main services:
- Web service (`Next.js` frontend running on port 8080)
- API service (`Laravel` backend running on port 8000)
- Database service (`PostgreSQL` with pgvector extension running on port 54321)

## Flow Overview
[![](https://mermaid.ink/img/pako:eNp9UU1PwzAM_StRTiBtf6AHpK6t0E4MBkKi3cFt3LWoTSrXQZq2_Xc8UjHGED7F7z0_f2SvK2dQR3pLMDTqOS2skhh9GYBXLNWK3DtWHJhTxPnLiKSWlpFqqHATKLSmsL_q49Xyun6RrxGoahJnmVzXIW3OZJInhMAoVcZX_INJ85sUGEoY8faflg8D2nj5NZ0A3Dp7tsjyiZW5ri1iNZ_fqUMYTj16pN1BLQK3CNw9WhRTVFlfojGt3Y4HlV1InpCpxQ9U0wYimK6aBEHY7y-HSbBmRxfleqZ7pB5aIz-1P2kLzQ32WOhIngZr8B0XurBHkYJnt97ZSkdMHmfaD0b6pS3IOXod1dCNgg5g35w750GVmVaaf4Pk_LaZsuMniTGxGg?type=png)](https://mermaid.live/edit#pako:eNp9UU1PwzAM_StRTiBtf6AHpK6t0E4MBkKi3cFt3LWoTSrXQZq2_Xc8UjHGED7F7z0_f2SvK2dQR3pLMDTqOS2skhh9GYBXLNWK3DtWHJhTxPnLiKSWlpFqqHATKLSmsL_q49Xyun6RrxGoahJnmVzXIW3OZJInhMAoVcZX_INJ85sUGEoY8faflg8D2nj5NZ0A3Dp7tsjyiZW5ri1iNZ_fqUMYTj16pN1BLQK3CNw9WhRTVFlfojGt3Y4HlV1InpCpxQ9U0wYimK6aBEHY7y-HSbBmRxfleqZ7pB5aIz-1P2kLzQ32WOhIngZr8B0XurBHkYJnt97ZSkdMHmfaD0b6pS3IOXod1dCNgg5g35w750GVmVaaf4Pk_LaZsuMniTGxGg)

## Prerequisites

Before running the application, ensure you have the following installed on your system:
-   Docker (20.10.x or higher)
-   Docker Compose (v2.x or higher)
-   Make (GNU Make 4.x or higher)
-   OpenAI API credentials
    -   API Key
    -   Organization ID

## Available make commands

Please check the commnad `make -h` for all the available commands you can use to manage the application.

## Service configuration

### Port mappings
- Frontend (Web): `http://localhost:8080`
- Backend (API): `http://localhost:8000`
- Database: `localhost:54321` (for native database client)


## Project Structure

```
.
├── api/                # Laravel backend service
├── web/                # Next.js frontend service
├── docker-compose.yaml # Docker services configuration
└── Makefile           # Command shortcuts
```

## Step by step guide

1. Initialize the environment files and container images:
   ```bash
   make init
   ```

2. Verify all services are running:
   ```bash
   make ps
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - API: http://localhost:8000

## Usage Examples

### Patent Analysis

1.  Access the search interface: 
[`http://localhost:8080/search/`](http://localhost:8080/search/)

3.  Example to run analysis URL:
[`http://localhost:8080/search/?patent_id=US-RE49889-E1&company_name=Target%20Corporation`](http://localhost:8080/search/?patent_id=US-RE49889-E1&company_name=Target%20Corporation)

4.  View analysis history:
[`http://localhost:8080`](http://localhost:8080%60)

## API Documentation

The application provides a REST API that serves the patent analysis functionality. All API endpoints are hosted at the base URL specified in the environment variable `NEXT_PUBLIC_API_HOST`.

### Endpoints

#### 1. List Analyses
Retrieves all patent analysis results.

```
GET /api/list
```

**Response**
```json
[
  {
    "analysis_id": number,
    "patent_id": string,
    "company_name": string,
    "analysis_date": string,
    "overall_risk_assessment": string,
    "top_infringing_products": [
      {
        "product_name": string,
        "infringement_likelihood": "High" | "Medium" | "Low",
        "relevant_claims": string[],
        "explanation": string,
        "specific_features": string[]
      }
    ]
  }
]
```

#### 2. Search/Analyze Patent
Analyzes a patent for potential infringement by a specific company.

```
GET /api/search
```
**Note**
The result of the API with the same `patent_id` and `company_name` will be cache for `10s` for preventing submitting multiple times. 

**Query Parameters**
- `patent_id` (**required**): The ID of the patent to analyze
- `company_name` (**required**): The name of the company to check against

**Response**
```json
{
  "analysis_id": number,
  "patent_id": string,
  "company_name": string,
  "analysis_date": string,
  "overall_risk_assessment": string,
  "top_infringing_products": [
    {
      "product_name": string,
      "infringement_likelihood": "High" | "Medium" | "Low",
      "relevant_claims": string[],
      "explanation": string,
      "specific_features": string[]
    }
  ]
}
```

### Error Responses
Both endpoints may return the following error responses:

```json
{
  "message": string
}
```


### Frontend Integration

The API is integrated with the frontend using React Query for data fetching and state management. Here's how to use the API endpoints in your frontend code:

#### List Analyses
```typescript
import { useQuery } from '@tanstack/react-query'

const fetchAnalyses = async (): Promise<AnalysisResult[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/list`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to fetch analyses')
  }
  return response.json()
}

// In your component:
const { data: analyses, error, isLoading } = useQuery({
  queryKey: ['analyses'],
  queryFn: fetchAnalyses,
})
```

#### Search/Analyze Patent
```typescript
import { useQuery } from '@tanstack/react-query'

type SearchParams = {
  patentId: string
  companyName: string
}

const analyzePatent = async ({ patentId, companyName }: SearchParams): Promise<AnalysisResult> => {
  const params = new URLSearchParams({
    patent_id: patentId,
    company_name: companyName
  })
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/search?${params.toString()}`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to analyze patent')
  }
  return response.json()
}

// In your component:
const { data: analysisResult, error, isLoading } = useQuery({
  queryKey: ['patentAnalysis', queryParams],
  queryFn: () => analyzePatent(queryParams),
  enabled: Boolean(patentId && companyName),
})
```

### Type Definitions

```typescript
interface AnalysisResult {
  analysis_id: number
  patent_id: string
  company_name: string
  analysis_date: string
  overall_risk_assessment: string
  top_infringing_products: InfringingProduct[]
}

interface InfringingProduct {
  product_name: string
  infringement_likelihood: 'High' | 'Medium' | 'Low'
  relevant_claims: string[]
  explanation: string
  specific_features: string[]
}
```

