<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\API\ApiController;
use Illuminate\Http\Request;
use App\Models\File;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class FileController extends ApiController
{
    public function list(File $file_model)
    {
        try {
            $data = $file_model->orderByDesc('id')->get();
            $data->map(function ($item, $key) {
                $item['url'] = parseFileUrl($item['url']);
            });

            return $this->successResponse($data, 'success');
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, File $file_model)
    {
        try {
            $image = uploadFile($request->file('image'), 'public/assets/images/uploads');
            $input['url'] = $image;
            $post = $file_model->create($input);

            return $this->successResponse($post);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id, File $file_model)
    {
        try {
            $data = $file_model->find($id);
            // upload file
            $image = uploadFile($request->file('image'), 'public/assets/images/uploads');

            // delete old file
            if (Storage::disk()->exists($data->url)) {
                $delete = Storage::delete($data->url);
            }

            // update data
            $input['url'] = $image;
            $post = $data->update($input);

            return $this->successResponse(null);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id, File $file_model)
    {
        try {
            $data = $file_model->find($id);
            if (Storage::disk()->exists($data->url)) {
                $delete = Storage::delete($data->url);
            } else {
                $delete = true;
            }

            if($delete) {
                $data->delete();
            }

            return $this->successResponse(null);
        } catch (\Exception $e) {
            report($e);
            return $this->errorResponse(null, trim(preg_replace('/\s+/', ' ', $e->getMessage())) );
        }
    }
}
