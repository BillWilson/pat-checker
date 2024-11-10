<?php

namespace App\Http\Controllers;

use App\Models\Patent;
use App\Models\Product;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Http\Request;
use Pgvector\Laravel\Vector;

class SearchController extends Controller
{
    protected array $validations = [
        'patent_id' => ['required', 'string', 'max:255'],
        'company_name' => ['required', 'string', 'max:255'],
    ];

    public function __invoke(Request $request): array
    {
        $validated = $request->validate($this->validations);
        $patent = Patent::query()->where('publication_number', data_get($validated, 'patent_id'))->first();

        $claims = collect($patent->claims)->map(fn (array $claim)  => $claim['text']);

        $searchPrompt = 'Search for a company\'s products has infringed on the given patent.
        Give me top two infringing products which may makes, uses, sells, or offers to sell a patented invention
        And here is the patent details:
        Patent Title: ' . $patent->title . '
        Patent Assignee: ' . $patent->assignee . '
        Patent Abstract: ' . $patent->abstract . '
        Patent Description: ' . $patent->Description . '
        Patent Claims: ' . $claims->join(' \n')
        ;

        $result = OpenAI::embeddings()->create([
            'model' => 'text-embedding-3-small',
            'dimensions' => 1536,
            'input' =>  $searchPrompt,
        ]);

        $embedding = new Vector($result->embeddings[0]->embedding);

        $products = Product::query()
            ->where('company_name', data_get($validated, 'company_name'))
            ->orderByRaw('product_vector <-> ?', [$embedding])
            ->take(2)
            ->get();

        \Log::info(json_encode($products));

        $prompt = '
        Use the following question to answer the question with related products:
        Question: '.$searchPrompt.'
        Related products: '.json_encode($products).'
        Give me the the result same as example in JSON format.
        Example:
        ```json
        {"analysis_id":"1","patent_id":"US-RE49889-E1","company_name":"Walmart Inc.","analysis_date":"2024-10-31","top_infringing_products":[{"product_name":"Walmart Shopping App","infringement_likelihood":"High","relevant_claims":["1","2","3","20","21"],"explanation":"The Walmart Shopping App implements several key elements of the patent claims including the direct advertisement-to-list functionality, mobile application integration, and shopping list synchronization. The app\'s implementation of digital advertisement display and product data handling closely matches the patent\'s specifications.","specific_features":["Direct advertisement-to-list functionality","Mobile app integration","Shopping list synchronization","Digital weekly ads integration","Product data payload handling"]},{"product_name":"Walmart+","infringement_likelihood":"Moderate","relevant_claims":["1","40","41","42"],"explanation":"The Walmart+ membership program includes shopping list features that partially implement the patent\'s claims, particularly regarding list synchronization and deep linking capabilities. While not as complete an implementation as the main Shopping App, it still incorporates key patented elements in its list management functionality.","specific_features":["Shopping list synchronization across devices","Deep linking to product lists","Advertisement integration in member benefits","Cloud-based list storage"]}],"overall_risk_assessment":"High risk of infringement due to implementation of core patent claims in multiple products, particularly the Shopping App which implements most key elements of the patent claims. Walmart+ presents additional moderate risk through its partial implementation of the patented technology."}
        ```
        ';

        $response = OpenAI::chat()->create([
            'model' => 'gpt-4o',
            'response_format' => [
                'type' => 'json_object',
            ],
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Your professional patent infringement reviewer and understand the patent details.',
                ],
                [
                    'role' => 'user',
                    'content' => $prompt,
                ],
            ],
        ]);

        return json_decode(data_get($response->toArray(), 'choices.0.message.content'), true) ?? [];
    }
}
