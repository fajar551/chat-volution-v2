<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Faker\Factory;

class DummyController extends Controller
{
    public $successStatus = 200;

    public function accountLists()
    {
        $data = [];
        $faker = Factory::create();
        for ($i = 0; $i <= 20; $i++) {
            $arr[] = [
                "id" => $i + 1,
                "account_name" => $faker->company(),
                "phone" => '+62 8' . $faker->regexify('[0-9]{10}')
            ];
        }
        $data = array_merge($data, $arr);
        return response()->json([
            'code' => 200,
            'messgae' => 'Successfully Procces The Request!',
            'data' => $data
        ], $this->successStatus);
    }

    public function accountListSocial()
    {
        $data = [];
        $faker = Factory::create();
        for ($i = 0; $i <= 20; $i++) {
            $arr[] = [
                "id" => $i + 1,
                "account_name" => $faker->userName(),
                "id_social_media" => $faker->randomNumber()
            ];
        }
        $data = array_merge($data, $arr);
        return response()->json([
            'code' => 200,
            'messgae' => 'Successfully Procces The Request!',
            'data' => $data
        ], $this->successStatus);
    }


    public function groupListSocial()
    {
        $data = [];
        $faker = Factory::create();
        for ($i = 0; $i <= 20; $i++) {
            $arr[] = [
                "id" => $i + 1,
                "group_name" => $faker->domainWord(),
                "count_account" => $faker->randomNumber()
            ];
        }
        $data = array_merge($data, $arr);
        return response()->json([
            'code' => 200,
            'messgae' => 'Successfully Procces The Request!',
            'data' => $data
        ], $this->successStatus);
    }

    public function contactLists()
    {
        $data = [];
        $faker = Factory::create();
        for ($i = 0; $i <= 20; $i++) {
            $arr[] = [
                "id" => $i + 1,
                "name" => $faker->name,
                "account_name" => $faker->company(),
                "email" => $faker->email,
                "phone" => '+62 8' . $faker->regexify('[0-9]{10}')
            ];
        }
        $data = array_merge($data, $arr);
        return response()->json([
            'code' => 200,
            'messgae' => 'Successfully Procces The Request!',
            'data' => $data
        ], $this->successStatus);
    }

    public function leadLists()
    {
        $data = [];
        $faker = Factory::create();
        for ($i = 0; $i <= 20; $i++) {
            $arr[] = [
                "id" => $i + 1,
                "name" => $faker->name(),
                "title" => $faker->paragraph($nbSentences = 1, $variableNbSentences = true),
                "company" => $faker->company(),
                "phone" => '(021) ' . $faker->regexify('[0-9]{5}'),
                "mobile" => '+62 8' . $faker->regexify('[0-9]{10}'),
                "email" => $faker->companyEmail(),
                "lead_status" => $faker->randomElement(['Unqualified', 'New', 'Working', 'Nurturing', 'Qualified']),
            ];
        }
        $data = array_merge($data, $arr);
        return response()->json([
            'code' => 200,
            'messgae' => 'Successfully Procces The Request!',
            'data' => $data
        ], $this->successStatus);
    }

    public function opportunityList()
    {
        $data = [];
        $faker = Factory::create();
        for ($i = 0; $i <= 20; $i++) {
            $arr[] = [
                "id" => $i + 1,
                "opportunity_name" => $faker->catchPhrase(),
                "account_name" => $faker->company(),
                "stage" => $faker->randomElement(['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
                "closed_date" => $faker->date('Y-m-d', 'now'),
            ];
        }
        $data = array_merge($data, $arr);
        return response()->json([
            'code' => 200,
            'messgae' => 'Successfully Procces The Request!',
            'data' => $data
        ], $this->successStatus);
    }

    public function taskLists()
    {
        $data = [];
        $faker = Factory::create();
        for ($i = 0; $i <= 20; $i++) {
            $arr[] = [
                "id" => $i + 1,
                "task_name" => $faker->text($maxNbChars = 15),
                "contact_name" => $faker->name(),
                "due_date" => $faker->date('Y-m-d', 'now'),
            ];
        }
        $data = array_merge($data, $arr);
        return response()->json([
            'code' => 200,
            'messgae' => 'Successfully Procces The Request!',
            'data' => $data
        ], $this->successStatus);
    }

    public function billingLists()
    {
        $data = [];
        $faker = Factory::create();
        for ($i = 0; $i <= 5; $i++) {
            $arr[] = [
                "id" => $i + 1,
                "description" => $faker->randomElement(['Qchat Diamond Tier (Yearly)', 'Qchat Diamond Tier (Monthly)', 'Qchat Gold Tier (Yearly)', 'Qchat Gold Tier (Monthly)']),
                'status' => $faker->randomElement(['Pending', 'Success'])
            ];
        }
        foreach ($arr as $key => $value) {
            $arr[$key]['price'] = strpos($value['description'], "Yearly") ? $faker->randomNumber(8) : $faker->randomNumber(7);
            $arr[$key]['paid_until'] = $value['status'] == 'Success' ? $faker->date('Y-m-d', 'now') : null;
        }

        foreach ($arr as $key => $value) {
            $sum_data[] = $value['price'];
        }

        $data = array_merge($data, $arr);

        return response()->json([
            'code' => 200,
            'messgae' => 'Successfully Procces The Request!',
            'data' => $data,
            'sum_price' => array_sum($sum_data)
        ], $this->successStatus);
    }
}
