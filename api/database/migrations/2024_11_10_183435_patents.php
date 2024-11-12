<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patents', function (Blueprint $table) {
            $table->id();
            $table->string('publication_number');
            $table->string('title');
            $table->text('ai_summary')->nullable();
            $table->string('raw_source_url');
            $table->string('assignee');
            $table->jsonb('inventors');
            $table->date('priority_date');
            $table->date('application_date');
            $table->date('grant_date');
            $table->text('abstract');
            $table->text('description');
            $table->jsonb('claims');
            $table->string('jurisdictions');
            $table->jsonb('classifications');
            $table->string('application_events')->nullable();
            $table->jsonb('citations')->nullable();
            $table->jsonb('image_urls')->nullable();
            $table->string('landscapes')->nullable();
            $table->timestamp('publish_date')->nullable();
            $table->string('citations_non_patent')->nullable();
            $table->string('provenance')->nullable();
            $table->text('attachment_urls')->nullable();
            $table->timestamps();
        });

        DB::statement('CREATE INDEX patent_number_idx ON patents (publication_number)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('patents');
    }
};
