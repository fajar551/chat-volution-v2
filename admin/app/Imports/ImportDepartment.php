<?php

namespace App\Imports;

use App\Models\Department;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\SkipsUnknownSheets;

class ImportDepartment implements ToCollection, WithStartRow, SkipsUnknownSheets
{

    private $rows = 0;
    public $data;

    public function startRow(): int
    {
        return 2;
    }

    public function collection(Collection $rows)
    {
        return Department::all();
    }

    public function onUnknownSheet($sheetName)
    {
        // E.g. you can log that a sheet was not found.
        info("Sheet {$sheetName} was skipped");
    }
}
