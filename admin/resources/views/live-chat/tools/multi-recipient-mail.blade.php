@extends('layouts.app-chat.app')

@section('header')
    {{-- Tanpa overlay loader di halaman ini (validasi token async tidak memanggil fadeOut). --}}
    <style>
        .page-loader {
            display: none !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
    </style>
@endsection

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 ml-1">
                <div class="page-title-box d-flex align-items-center justify-content-between">
                    <h4 class="mb-0">Kirim email ke beberapa penerima</h4>
                </div>
                <p class="text-muted">Pisahkan alamat email dengan koma, titik koma, atau baris baru. SMTP memakai konfigurasi <code>MAIL_*</code> di server.</p>
            </div>
        </div>

        <div class="row justify-content-center">
            <div class="col-xl-10 col-sm-12">
                <div class="card">
                    <div class="card-body">
                        @if (session('status'))
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                {{ session('status') }}
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        @endif
                        @if (session('error'))
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                {{ session('error') }}
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        @endif

                        <form method="post" action="{{ url('/multi-recipient-mail/send') }}" data-parsley-validate="">
                            @csrf
                            <div class="form-group">
                                <label for="recipients">Penerima</label>
                                <textarea class="form-control" id="recipients" name="recipients" rows="3" required
                                    placeholder="email1@domain.com, email2@domain.com">{{ old('recipients', $default_recipients) }}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="subject">Subjek</label>
                                <input type="text" class="form-control" id="subject" name="subject" required
                                    value="{{ old('subject') }}" placeholder="Subjek email">
                            </div>
                            <div class="form-group">
                                <label for="body">Isi pesan</label>
                                <textarea class="form-control" id="body" name="body" rows="10" required
                                    placeholder="Teks pesan (plain text)">{{ old('body') }}</textarea>
                            </div>
                            <button type="submit" class="btn btn-primary waves-effect waves-light">Kirim</button>
                        </form>

                        <hr class="my-4">
                        <p class="mb-1 small text-muted"><strong>API untuk backend lain</strong></p>
                        <p class="small text-muted mb-0">
                            <code>POST {{ url('/api/internal/multi-recipient-mail') }}</code><br>
                            Header: <code>Authorization: Bearer …</code> (sama dengan <code>MULTI_RECIPIENT_MAIL_API_SECRET</code> di <code>.env</code> admin).<br>
                            JSON: <code>recipients</code> (string atau array), <code>subject</code>, <code>body</code>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('footer')
    @include('shared.footer')
@endsection
