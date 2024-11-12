<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use OpenAI\Laravel\Facades\OpenAI;
use Symfony\Component\Console\Helper\ProgressBar;

class CreateProduct extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-product';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create index for products';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $json = file_get_contents(base_path('company_products.json'));
        $companies = collect(json_decode($json, true));

        $this->generateInputCollection(collect($companies->first()));
    }

    protected function generateInputCollection(Collection $companies): void
    {
        $bar = $this->output->createProgressBar(count($companies));
        $bar->start();

        $companies
            ->each(
                function(array $company) use ($bar) {
                    $bar->setMaxSteps($bar->getMaxSteps() + count($company['products']));

                    collect($company['products'])->each(
                        fn(array $product) => $this->generateEmbedding($company, $product, $bar)
                    );
                }
            );

        $bar->finish();
    }

    protected function formatter(string $companyName, string $productName, string $productDescription): string
    {
        return sprintf(
            'company: %s, product: %s, description: %s',
            $companyName,
            $productName,
            $productDescription
        );
    }

    protected function generateEmbedding(array $company, array $product, ProgressBar $bar): void
    {
        $response = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'dimensions' => 1536,
            'input' =>  $this->formatter($company['name'], $product['name'], $product['description']),
        ]);

        $vector = $response->embeddings;

        $product = Product::query()->create([
            'company_name' => $company['name'],
            'name' => $product['name'],
            'description' => $product['description'],
            'product_vector' => $vector[0]->embedding,
        ]);

        $product->product_vector = $vector[0]->embedding;
        $product->save();

        $bar->advance();
    }
}
