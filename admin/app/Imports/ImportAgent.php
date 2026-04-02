<?php

namespace App\Imports;

use App\Models\Agent;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\SkipsUnknownSheets;
use Maatwebsite\Excel\Imports\HeadingRowFormatter;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

// class ImportAgent implements ToCollection, WithStartRow, SkipsUnknownSheets

class ImportAgent implements ToModel, WithStartRow, SkipsUnknownSheets, WithHeadingRow
{

    private $rows = 0;
    private $data = [];

    public function startRow(): int
    {
        return 2;
    }

    public function model(array $row)
    {
        $item = [
            'name' => $row['name'],
            'email' => $row['email'],
            'department' => $row['department'],
            'roles' => isset($row['roles']) && !empty($row['roles']) ? $row['roles'] : 'agent',
        ];
        array_push($this->data, $item);

        // return Agent::first();
    }

    public function onUnknownSheet($sheetName)
    {
        // E.g. you can log that a sheet was not found.
        info("Sheet {$sheetName} was skipped");
    }

    public function getData(): array
    {
        return $this->data;
    }
}

