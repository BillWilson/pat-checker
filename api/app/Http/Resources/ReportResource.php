<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge([
            'analysis_id' => $this->id,
            'patent_id' => $this->patent_id,
            'company_name' => $this->company_name,
            'analysis_date' => $this->created_at->format('Y-m-d'),
        ], $this->result);
    }
}
