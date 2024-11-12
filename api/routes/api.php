<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers;

Route::get('/search', Controllers\SearchController::class);
Route::get('/list', Controllers\ReportListController::class);
