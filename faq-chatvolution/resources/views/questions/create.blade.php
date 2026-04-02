@extends('layouts.app')

@section('content')
<div class="content-inside">
    <div class="d-flex justify-content-between w-100 mb-3">
        <h3>Create New FAQ</h3>
    </div>
    <form action="{{ route('questions.store') }}" method="post">
        @csrf
        <div class="statistics-card">
            <div class="mb-3">
                <label for="category" class="form-label">Category:</label>
                <input type="text" class="form-control" name="category" id="category" required>
            </div>
            <div class="mb-3">
                <label for="question" class="form-label">Question:</label>
                <input type="text" class="form-control" name="question" id="question" required>
            </div>
            <div class="mb-3">
                <label for="answer" class="form-label">Answer:</label>
                <textarea class="form-control" name="answer" rows="4" required></textarea>
            </div>
        </div>
        <div id="related-questions-container">
            <!-- No related question fields initially -->
        </div>
        <button type="button" class="btn btn-success" id="add-related-question">Add Related Question</button>
        <button type="submit" class="btn btn-primary">Create FAQ</button>
    </form>
    <a href="{{ route('questions.index') }}" class="btn btn-secondary">Back to All Questions</a>

<script>
    let questionIndex = 0;

    document.getElementById('add-related-question').addEventListener('click', function () {
        var container = document.getElementById('related-questions-container');
        var newRelatedQuestionField = `
            <div class="related-question-group statistics-card my-4">
                <div class="mb-3">
                    <label for="related_question" class="form-label">Related Question:</label>
                    <input type="text" class="form-control" name="related_questions[${questionIndex}][related_question]" required>
                </div>
                <div class="mb-3">
                    <label for="type" class="form-label">Type:</label>
                    <input type="text" class="form-control" name="related_questions[${questionIndex}][type]" required>
                </div>
                <div class="mb-3">
                    <label for="related_answer" class="form-label">Answer:</label>
                    <textarea class="form-control" name="related_questions[${questionIndex}][answer]" rows="4" required></textarea>
                </div>
                <button type="button" class="btn btn-danger" onclick="removeRelatedQuestion(this)">Delete</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', newRelatedQuestionField);
        questionIndex++;
    });

    function removeRelatedQuestion(button) {
        var relatedQuestionGroup = button.closest('.related-question-group');
        relatedQuestionGroup.remove();
    }
</script>

@endsection
