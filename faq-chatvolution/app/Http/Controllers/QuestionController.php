<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\Answer;
use App\Models\RelatedQuestion;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $questions = Question::with('answers', 'relatedQuestions')->get();
        return view('questions.index', ['questions' => $questions]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('questions.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => 'required|string',
            'question' => 'required|string',
            'answer' => 'required|string',
            'related_questions' => 'array',
            'related_questions.*.related_question' => 'required|string',
            'related_questions.*.type' => 'required|string',
            'related_questions.*.answer' => 'required|string',
        ]);
    
        // Create the main question and its answer
        $question = new Question([
            'category' => $data['category'],
            'question' => $data['question'],
        ]);
        $question->save();

        $answer = new Answer([
            'answer' => $data['answer'],
        ]);
        $question->answers()->save($answer);

        // Create related questions and their answers
        if (isset($data['related_questions'])) {
            foreach ($data['related_questions'] as $relatedQuestion) {
                $relatedQuestionModel = new RelatedQuestion([
                    'related_question' => $relatedQuestion['related_question'],
                    'type' => $relatedQuestion['type'],
                    'answer' => $relatedQuestion['answer'],
                ]);
                $question->relatedQuestions()->save($relatedQuestionModel);
            }
        }

        return redirect()->route('questions.index')->with('success', 'FAQ created successfully');
    }



    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $question = Question::with('answers', 'relatedQuestions')->findOrFail($id);
        return response()->json(['question' => $question], 200);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $question = Question::findOrFail($id);
        return view('questions.edit', ['question' => $question]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $question = Question::findOrFail($id);

        $data = $request->validate([
            'category' => 'required|string',
            'question' => 'required|string',
            'answer' => 'required|string',
            'related_questions' => 'array',
            'related_questions.*.related_question' => 'required|string',
            'related_questions.*.type' => 'required|string',
            'related_questions.*.answer' => 'required|string',
        ]);

        // Update the main question and its answer
        $question->update([
            'category' => $data['category'],
            'question' => $data['question'],
        ]);

        $question->answers()->update([
            'answer' => $data['answer'],
        ]);

        // Update related questions and their answers
        $question->relatedQuestions()->delete();

        if (isset($data['related_questions'])) {
            foreach ($data['related_questions'] as $relatedQuestion) {
                $relatedQuestionModel = new RelatedQuestion([
                    'related_question' => $relatedQuestion['related_question'],
                    'type' => $relatedQuestion['type'],
                    'answer' => $relatedQuestion['answer'],
                ]);
                $question->relatedQuestions()->save($relatedQuestionModel);
            }
        }

        return redirect()->route('questions.index')->with('success', 'FAQ updated successfully');
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $question = Question::findOrFail($id);

        $question->answers()->delete();
        $question->relatedQuestions()->delete();
        $question->delete();

        return redirect()->route('questions.index')->with('success', 'FAQ deleted successfully');
    }

}
