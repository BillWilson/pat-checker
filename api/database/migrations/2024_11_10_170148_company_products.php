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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('name');
            $table->text('description');
            $table->vector('product_vector', 1536)->nullable();
            $table->timestamps();
        });


        DB::statement('CREATE INDEX product_vec_idx ON products USING ivfflat (product_vector vector_l2_ops) WITH (lists = 100)');
        DB::statement('CREATE INDEX company_name_idx ON products (company_name)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::drop('products');
    }
};
