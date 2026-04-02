<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\RelatedQuestionController;
use App\Http\Controllers\ProductHostingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AccountSettingsController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


Route::get('/', [UserController::class, 'showLoginForm']);
Route::get('/login', [UserController::class, 'showLoginForm'])->name('login');
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout'])->name('logout');
Route::get('/register', [UserController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [UserController::class, 'register']);


Route::middleware('auth')->group(function () {

    Route::get('/dashboard', function () {return view('welcome');})->name('home');

    Route::get('/account-settings', [AccountSettingsController::class, 'index'])->name('account-settings.index');
    Route::put('/account-settings/update', [AccountSettingsController::class, 'update'])->name('account-settings.update');

    // Route Questions
    Route::get('/questions', [QuestionController::class, 'index'])->name('questions.index');
    Route::get('/questions/create', [QuestionController::class, 'create'])->name('questions.create');
    Route::post('/questions', [QuestionController::class, 'store'])->name('questions.store');
    Route::get('/questions/{question}', [QuestionController::class, 'show'])->name('questions.show');
    Route::get('/questions/{question}/edit', [QuestionController::class, 'edit'])->name('questions.edit');
    Route::put('/questions/{question}', [QuestionController::class, 'update'])->name('questions.update');
    Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');

    // Route Answers
    Route::get('/answers', [AnswerController::class, 'index'])->name('answers.index');
    Route::get('/answers/create', [AnswerController::class, 'create'])->name('answers.create');
    Route::post('/answers', [AnswerController::class, 'store'])->name('answers.store');
    Route::get('/answers/{answer}', [AnswerController::class, 'show'])->name('answers.show');
    Route::get('/answers/{answer}/edit', [AnswerController::class, 'edit'])->name('answers.edit');
    Route::put('/answers/{answer}', [AnswerController::class, 'update'])->name('answers.update');
    Route::delete('/answers/{answer}', [AnswerController::class, 'destroy'])->name('answers.destroy');

    // Route Related Questions
    Route::get('/related-questions', [RelatedQuestionController::class, 'index'])->name('related-questions.index');
    Route::get('/related-questions/create', [RelatedQuestionController::class, 'create'])->name('related-questions.create');
    Route::post('/related-questions', [RelatedQuestionController::class, 'store'])->name('related-questions.store');
    Route::get('/related-questions/{related_question}', [RelatedQuestionController::class, 'show'])->name('related-questions.show');
    Route::get('/related-questions/{related_question}/edit', [RelatedQuestionController::class, 'edit'])->name('related-questions.edit');
    Route::put('/related-questions/{related_question}', [RelatedQuestionController::class, 'update'])->name('related-questions.update');
    Route::delete('/related-questions/{related_question}', [RelatedQuestionController::class, 'destroy'])->name('related-questions.destroy');

    // Product Hosting Routes
    Route::get('/product-hostings', [ProductHostingController::class, 'index'])->name('product_hostings.index');
    Route::get('/product-hostings/create', [ProductHostingController::class, 'create'])->name('product_hostings.create');
    Route::post('/product-hostings', [ProductHostingController::class, 'store'])->name('product_hostings.store');
    Route::get('/product-hostings/{id}', [ProductHostingController::class, 'show'])->name('product_hostings.show');
    Route::get('/product-hostings/{id}/edit', [ProductHostingController::class, 'edit'])->name('product_hostings.edit');
    Route::put('/product-hostings/{id}', [ProductHostingController::class, 'update'])->name('product_hostings.update');
    Route::delete('/product-hostings/{id}', [ProductHostingController::class, 'destroy'])->name('product_hostings.destroy');

    // Order Payments Routes
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/create', [PaymentController::class, 'create'])->name('payments.create');
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');
    Route::get('/payments/{payment}/edit', [PaymentController::class, 'edit'])->name('payments.edit');
    Route::put('/payments/{payment}', [PaymentController::class, 'update'])->name('payments.update');
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');
});
