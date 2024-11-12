<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use App\Http\Resources\ReportResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReportListController extends Controller
{
    public function __invoke(Request $request): array
    {
        return ReportResource::collection($this->getQueryResult())->resolve();
    }

    protected function getQueryResult(): LengthAwarePaginator
    {
        return Report::query()
            ->orderByDesc('id')
            ->paginate(10);
    }
}
