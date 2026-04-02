@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>Edit FAQ</h3>
    </div>
    <form action="{{ route('questions.update', $question->id) }}" method="post">
        @csrf
        @method('PUT')
        <div class="statistics-card">
            <div class="mb-3">
                <label for="category" class="form-label">Category:</label>
                <input type="text" class="form-control" name="category" id="category" value="{{ $question->category }}" required>
            </div>
            <div class="mb-3">
                <label for="question" class="form-label">Question:</label>
                <input type="text" class="form-control" name="question" id="question" value="{{ $question->question }}" required>
            </div>
            <div class="mb-3">
                <label for="answer" class="form-label">Answer:</label>
                <textarea class="form-control" name="answer" rows="4" required>{{ $question->answers->first()->answer }}</textarea>
            </div>
        </div>
        <div id="related-questions-container">
            @foreach ($question->relatedQuestions as $index => $relatedQuestion)
                <div class="related-question-group statistics-card my-4">
                    <div class="mb-3">
                        <label for="related_question" class="form-label">Related Question:</label>
                        <input type="text" class="form-control" name="related_questions[{{ $index }}][related_question]" value="{{ $relatedQuestion->related_question }}" required>
                    </div>
                    <div class="mb-3">
                        <label for="type" class="form-label">Type:</label>
                        <input type="text" class="form-control" name="related_questions[{{ $index }}][type]" value="{{ $relatedQuestion->type }}" required>
                    </div>
                    <div class="mb-3">
                        <label for="related_answer" class="form-label">Answer:</label>
                        <textarea class="form-control" name="related_questions[{{ $index }}][answer]" rows="4" required>{{ $relatedQuestion->answer }}</textarea>
                    </div>
                    <button type="button" class="btn btn-danger" onclick="deleteRelatedQuestion(this)">Delete</button>
                </div>
            @endforeach
        </div>
        <button type="button" class="btn btn-success" id="add-related-question">Add Related Question</button>
        <button type="submit" class="btn btn-primary">Update FAQ</button>
    </form>
    <a href="{{ route('questions.index') }}" class="btn btn-secondary">Back to All Questions</a>
</div>

<script>
    // JavaScript code to add more related question fields dynamically
    document.getElementById('add-related-question').addEventListener('click', function () {
        var container = document.getElementById('related-questions-container');
        var index = container.children.length - 1;
        var newRelatedQuestionField = `
            <div class="related-question-group statistics-card my-4">
                <div class="mb-3">
                    <label for="related_question" class="form-label">Related Question:</label>
                    <input type="text" class="form-control" name="related_questions[${index}][related_question]" required>
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Type:</label>
                    <input type="text" class="form-control" name="related_questions[${index}][type]" required>
                </div>
                <div class="mb-3">
                    <label for="related_answer" class="form-label">Answer:</label>
                    <textarea class="form-control" name="related_questions[${index}][answer]" rows="4" required></textarea>
                </div>
                <button type="button" class="btn btn-danger" onclick="deleteRelatedQuestion(this)">Delete</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', newRelatedQuestionField);
    });

    // JavaScript code to delete related question fields
    function deleteRelatedQuestion(button) {
        var container = document.getElementById('related-questions-container');
        var group = button.closest('.related-question-group');
        if (container.children.length > 1) {
            container.removeChild(group);
        } else {
            // If there's only one related question, clear its input fields
            group.querySelector('input').value = '';
            group.querySelector('textarea').value = '';
        }
    }
</script>
@endsection
