<?php

namespace App\Console\Commands;

use App\Models\Patent;
use Illuminate\Console\Command;

class CreatePatent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-patent';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create patents';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $json = file_get_contents(base_path('patents.json'));
        $patents = collect(json_decode($json, true));

        $progressBar = $this->output->createProgressBar($patents->count());

        collect($patents)->each(function (array $patent) use ($progressBar) {
            Patent::query()->create(
                array_merge($patent, [
                    'inventors' => json_decode($patent['inventors'], true),
                    'claims' => json_decode($patent['claims'], true),
                    'classifications' => json_decode($patent['classifications'], true),
                    'citations' => json_decode($patent['citations'], true),
                    'image_urls' => json_decode($patent['image_urls'], true),
                ])
            );
            $progressBar->advance();
        });

        $progressBar->finish();
    }
}
