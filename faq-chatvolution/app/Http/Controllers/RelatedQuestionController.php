<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RelatedQuestion;

class RelatedQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $relatedQuestions = RelatedQuestion::all();
        return view('related_questions.index', ['relatedQuestions' => $relatedQuestions]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('related_questions.create');
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
            'question_id' => 'required|exists:questions,id',
            'answer_id' => 'required|exists:answers,id',
            'related_question' => 'required',
        ]);

        RelatedQuestion::create($data);

        return redirect()->route('related-questions.index')->with('success', 'Related Question created successfully!');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $relatedQuestion = RelatedQuestion::findOrFail($id);
        return view('related_questions.show', ['relatedQuestion' => $relatedQuestion]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $relatedQuestion = RelatedQuestion::findOrFail($id);
        return view('related_questions.edit', ['relatedQuestion' => $relatedQuestion]);
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
        $data = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'answer_id' => 'required|exists:answers,id',
            'related_question' => 'required',
        ]);

        $relatedQuestion = RelatedQuestion::findOrFail($id);
        $relatedQuestion->update($data);

        return redirect()->route('related-questions.index')->with('success', 'Related Question updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
         $relatedQuestion = RelatedQuestion::findOrFail($id);
        $relatedQuestion->delete();

        return redirect()->route('related-questions.index')->with('success', 'Related Question deleted successfully!');
    }
}
