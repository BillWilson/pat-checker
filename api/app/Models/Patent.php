<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patent extends Model
{
    protected static $unguarded = true;

    protected $casts = [
        'publication_number' => 'string',
        'title' => 'string',
        'ai_summary' => 'string',
        'raw_source_url' => 'string',
        'assignee' => 'string',
        'inventors' => 'array',
        'priority_date' => 'date',
        'application_date' => 'date',
        'grant_date' => 'date',
        'abstract' => 'string',
        'description' => 'string',
        'claims' => 'array',
        'jurisdictions' => 'string',
        'classifications' => 'array',
        'application_events' => 'string',
        'citations' => 'array',
        'image_urls' => 'array',
        'landscapes' => 'string',
        'publish_date' => 'timestamp',
        'citations_non_patent' => 'string',
        'provenance' => 'string',
        'attachment_urls' => 'string',
    ];
}
