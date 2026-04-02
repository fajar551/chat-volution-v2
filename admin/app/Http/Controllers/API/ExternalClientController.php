<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class ExternalClientController extends Controller
{
    public $successStatus = 200;

    /**
     * Helper function to get client by phone number with additional data
     */
    private function getClientByPhoneWithAdditionalData($connection, $phone)
    {
        // Normalize phone number - remove spaces, dashes, parentheses, and other non-numeric characters except +
        $normalizedPhone = preg_replace('/[^0-9+]/', '', $phone);

        // Extract only digits for matching
        $digitsOnly = preg_replace('/[^0-9]/', '', $phone);

        // Generate phone number variations
        $phoneVariations = [];

        // Add original phone
        if (!empty($phone)) {
            $phoneVariations[] = $phone;
        }

        // Add normalized (with + if present)
        if (!empty($normalizedPhone)) {
            $phoneVariations[] = $normalizedPhone;
        }

        // Add digits only
        if (!empty($digitsOnly)) {
            $phoneVariations[] = $digitsOnly;

            // Add with + prefix
            if (strpos($digitsOnly, '62') === 0) {
                $phoneVariations[] = '+' . $digitsOnly;
            }

            // Add with 0 prefix (if starts with 62, replace with 0)
            if (strpos($digitsOnly, '62') === 0 && strlen($digitsOnly) > 2) {
                $phoneVariations[] = '0' . substr($digitsOnly, 2);
            }

            // If starts with 0, add 62 version
            if (strpos($digitsOnly, '0') === 0 && strlen($digitsOnly) > 1) {
                $phoneVariations[] = '62' . substr($digitsOnly, 1);
                $phoneVariations[] = '+62' . substr($digitsOnly, 1);
            }
        }

        // Remove duplicates and empty values
        $phoneVariations = array_unique(array_filter($phoneVariations));

        // Coba ambil semua kolom untuk mendapatkan primary key
        $clientRaw = DB::connection($connection)
            ->table('tblclients')
            ->select('*')
            ->limit(1)
            ->first();

        // Tentukan nama kolom primary key
        $primaryKey = 'id';
        if ($clientRaw) {
            $clientArray = (array) $clientRaw;
            if (isset($clientArray['id'])) {
                $primaryKey = 'id';
            } elseif (isset($clientArray['clientid'])) {
                $primaryKey = 'clientid';
            } elseif (isset($clientArray['userid'])) {
                $primaryKey = 'userid';
            }
        }

        // Query untuk mencari client berdasarkan phone number
        // Try exact match first
        $client = null;
        foreach ($phoneVariations as $phoneVar) {
            $client = DB::connection($connection)
                ->table('tblclients')
                ->where('phonenumber', $phoneVar)
                ->select('firstname', 'lastname', 'phonenumber', 'email', DB::raw('`' . $primaryKey . '` as client_id'))
                ->first();

            if ($client) {
                break; // Found client, stop searching
            }
        }

        // If exact match not found, try LIKE search (remove all non-digits and compare)
        if (!$client && !empty($digitsOnly)) {
            // Get all clients and filter by normalized phone
            $allClients = DB::connection($connection)
                ->table('tblclients')
                ->select('firstname', 'lastname', 'phonenumber', 'email', DB::raw('`' . $primaryKey . '` as client_id'))
                ->get();

            foreach ($allClients as $potentialClient) {
                $dbPhone = $potentialClient->phonenumber ?? '';
                $dbPhoneDigits = preg_replace('/[^0-9]/', '', $dbPhone);

                // Compare normalized phone numbers
                if ($dbPhoneDigits === $digitsOnly) {
                    $client = $potentialClient;
                    break;
                }
            }
        }

        if (!$client) {
            return null; // Client not found
        }

        // Convert to array format and add additional data
        $client = (array) $client;
        $clientId = $client['client_id'] ?? null;

        // Get layanan aktif (max 2)
        $layananAktif = [];
        if ($clientId) {
            try {
                $layanan = DB::connection($connection)
                    ->table('tblhosting')
                    ->join('tblproducts', 'tblhosting.packageid', '=', 'tblproducts.id')
                    ->where('tblhosting.userid', $clientId)
                    ->where('tblhosting.domainstatus', 'Active')
                    ->select('tblproducts.name')
                    ->limit(2)
                    ->get()
                    ->pluck('name')
                    ->toArray();
                $layananAktif = array_filter(array_map('trim', $layanan));
            } catch (Exception $e) {
                $layananAktif = [];
            }
        }
        $client['layanan_aktif'] = $layananAktif;

        // Get invoices unpaid (max 2)
        $invoicesUnpaid = [];
        if ($clientId) {
            try {
                $invoices = DB::connection($connection)
                    ->table('tblinvoices')
                    ->where('userid', $clientId)
                    ->where('status', 'Unpaid')
                    ->select('id')
                    ->limit(2)
                    ->get()
                    ->pluck('id')
                    ->toArray();
                $invoicesUnpaid = array_filter(array_map('trim', $invoices));
            } catch (Exception $e) {
                $invoicesUnpaid = [];
            }
        }
        $client['invoices_unpaid'] = $invoicesUnpaid;

        // Get ticket selain close (max 2)
        $ticketSelainClose = [];
        if ($clientId) {
            try {
                $tickets = DB::connection($connection)
                    ->table('tbltickets')
                    ->where('userid', $clientId)
                    ->where('status', '!=', 'Closed')
                    ->select('title')
                    ->limit(2)
                    ->get()
                    ->pluck('title')
                    ->toArray();
                $ticketSelainClose = array_filter(array_map('trim', $tickets));
            } catch (Exception $e) {
                $ticketSelainClose = [];
            }
        }
        $client['ticket_selain_close'] = $ticketSelainClose;

        return $client;
    }

    /**
     * Helper function to get clients with additional data (layanan aktif, invoices unpaid, tickets)
     */
    private function getClientsWithAdditionalData($connection)
    {
        // Coba ambil semua kolom untuk mendapatkan primary key
        $clientsRaw = DB::connection($connection)
            ->table('tblclients')
            ->select('*')
            ->limit(1)
            ->first();

        // Tentukan nama kolom primary key
        $primaryKey = 'id';
        if ($clientsRaw) {
            $clientArray = (array) $clientsRaw;
            // Coba beberapa kemungkinan nama kolom primary key
            if (isset($clientArray['id'])) {
                $primaryKey = 'id';
            } elseif (isset($clientArray['clientid'])) {
                $primaryKey = 'clientid';
            } elseif (isset($clientArray['userid'])) {
                $primaryKey = 'userid';
            }
        }

        // Query untuk mengambil field 'firstname', 'lastname', 'phonenumber', 'email'
        $clients = DB::connection($connection)
            ->table('tblclients')
            ->select('firstname', 'lastname', 'phonenumber', 'email', DB::raw('`' . $primaryKey . '` as client_id'))
            ->get()
            ->toArray();

        // Convert to array format and add additional data
        $clients = array_map(function ($item) use ($connection) {
            $client = (array) $item;
            $clientId = $client['client_id'] ?? null;

            // Get layanan aktif (max 2)
            // Join tblhosting dengan tblproducts untuk mendapatkan nama produk
            $layananAktif = [];
            if ($clientId) {
                try {
                    $layanan = DB::connection($connection)
                        ->table('tblhosting')
                        ->join('tblproducts', 'tblhosting.packageid', '=', 'tblproducts.id')
                        ->where('tblhosting.userid', $clientId)
                        ->where('tblhosting.domainstatus', 'Active')
                        ->select('tblproducts.name')
                        ->limit(2)
                        ->get()
                        ->pluck('name')
                        ->toArray();
                    $layananAktif = array_filter(array_map('trim', $layanan));
                } catch (Exception $e) {
                    // Ignore error, set empty array
                    $layananAktif = [];
                }
            }
            $client['layanan_aktif'] = $layananAktif;

            // Get invoices unpaid (max 2)
            $invoicesUnpaid = [];
            if ($clientId) {
                try {
                    $invoices = DB::connection($connection)
                        ->table('tblinvoices')
                        ->where('userid', $clientId)
                        ->where('status', 'Unpaid')
                        ->select('id')
                        ->limit(2)
                        ->get()
                        ->pluck('id')
                        ->toArray();
                    $invoicesUnpaid = array_filter(array_map('trim', $invoices));
                } catch (Exception $e) {
                    // Ignore error, set empty array
                    $invoicesUnpaid = [];
                }
            }
            $client['invoices_unpaid'] = $invoicesUnpaid;

            // Get ticket selain close (max 2)
            $ticketSelainClose = [];
            if ($clientId) {
                try {
                    $tickets = DB::connection($connection)
                        ->table('tbltickets')
                        ->where('userid', $clientId)
                        ->where('status', '!=', 'Closed')
                        ->select('title')
                        ->limit(2)
                        ->get()
                        ->pluck('title')
                        ->toArray();
                    $ticketSelainClose = array_filter(array_map('trim', $tickets));
                } catch (Exception $e) {
                    // Ignore error, set empty array
                    $ticketSelainClose = [];
                }
            }
            $client['ticket_selain_close'] = $ticketSelainClose;

            // Keep client_id for frontend to generate links (don't unset)
            // Frontend will use it to generate service and ticket URLs

            return $client;
        }, $clients);

        return $clients;
    }

    /**
     * Get clients from external database (tblclients)
     * Returns the 'firstname', 'lastname', 'phonenumber', 'email',
     * 'layanan_aktif' (array of domain names, max 2),
     * 'invoices_unpaid' (array of invoice numbers, max 2), and
     * 'ticket_selain_close' (array of ticket titles, max 2) fields
     *
     * NOTE: This endpoint is for testing - NO TOKEN AUTHENTICATION REQUIRED
     * Route is in web.php without auth middleware
     */
    public function getClientsQwords(Request $request)
    {
        // NO TOKEN VALIDATION - Testing only
        // Log request untuk debugging - PASTIKAN LOG INI TERPANGGIL
        Log::info('📥 ========== External Clients API Request START (NO AUTH) ==========');
        Log::info('📥 External Clients API Request:', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'headers' => $request->headers->all(),
            'x_requested_with' => $request->header('X-Requested-With'),
        ]);
        Log::info('📥 ========== External Clients API Request END ==========');

        try {
            Log::info('🔍 Attempting to connect to external database (Qwords)...', [
                'connection' => 'qwords_external',
                'host' => config('database.connections.qwords_external.host'),
                'database' => config('database.connections.qwords_external.database'),
                'username' => config('database.connections.qwords_external.username'),
            ]);

            // Menggunakan koneksi yang sudah didefinisikan di config/database.php
            // Atau set ulang jika perlu
            DB::purge('qwords_external');

            // Get clients with additional data using helper function
            $clients = $this->getClientsWithAdditionalData('qwords_external');

            Log::info('✅ Successfully connected and queried database');

            // Ensure clients is always an array
            if (!is_array($clients)) {
                $clients = [];
            }

            $count = count($clients);
            Log::info('✅ Successfully fetched ' . $count . ' client names from external database');

            // Prepare response data
            $responseData = [
                'success' => true,
                'data' => $clients,
                'count' => $count
            ];

            Log::info('📦 Response data prepared:', ['count' => $count, 'sample' => $count > 0 ? $clients[0] : 'no data']);

            // Ensure response is properly formatted
            $jsonResponse = response()->json($responseData, $this->successStatus);

            // Log final response untuk debugging
            Log::info('📤 Sending response:', [
                'status' => $this->successStatus,
                'data_count' => $count,
                'response_size' => strlen(json_encode($responseData))
            ]);

            return $jsonResponse;
        } catch (Exception $error) {
            Log::error('❌ Error fetching clients from external database: ' . $error->getMessage());

            $errorMessage = 'Failed to fetch clients from external database';
            $statusCode = 500;

            // Berikan error message yang lebih informatif
            if (strpos($error->getMessage(), 'Access denied') !== false) {
                $errorMessage = 'Access denied to external database. Check database credentials.';
                $statusCode = 403;
            } elseif (strpos($error->getMessage(), 'Unknown database') !== false) {
                $errorMessage = 'Database not found. Check database name.';
                $statusCode = 404;
            } elseif (strpos($error->getMessage(), "doesn't exist") !== false) {
                $errorMessage = 'Table tblclients not found in external database.';
                $statusCode = 404;
            } elseif (
                strpos($error->getMessage(), 'Connection refused') !== false ||
                strpos($error->getMessage(), 'Connection timed out') !== false ||
                strpos($error->getMessage(), '2002') !== false
            ) {
                $errorMessage = 'Cannot connect to external database. Possible causes: 1) IP server not allowed for remote MySQL connection, 2) Firewall blocking port 3306, 3) MySQL server not accepting remote connections. Please check MySQL remote access settings and firewall rules.';
                $statusCode = 503;
            }

            $errorResponse = [
                'success' => false,
                'message' => $errorMessage,
                'error' => $error->getMessage(),
                'data' => [],
                'count' => 0
            ];

            Log::error('❌ Error response:', $errorResponse);

            return response()->json($errorResponse, $statusCode, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept',
            ]);
        }
    }

    /**
     * Get clients from external database (tblclients) - Relabs
     * Returns the 'firstname', 'lastname', 'phonenumber', 'email',
     * 'layanan_aktif', 'invoices_unpaid', and 'ticket_selain_close' fields
     *
     * NOTE: This endpoint is for testing - NO TOKEN AUTHENTICATION REQUIRED
     * Route is in web.php without auth middleware
     */
    public function getClientsRelabs(Request $request)
    {
        // NO TOKEN VALIDATION - Testing only
        Log::info('📥 ========== External Clients API Request START (Relabs - NO AUTH) ==========');
        Log::info('📥 External Clients API Request (Relabs):', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'headers' => $request->headers->all(),
            'x_requested_with' => $request->header('X-Requested-With'),
        ]);
        Log::info('📥 ========== External Clients API Request END ==========');

        try {
            Log::info('🔍 Attempting to connect to external database (Relabs)...', [
                'connection' => 'relabs_external',
                'host' => config('database.connections.relabs_external.host'),
                'database' => config('database.connections.relabs_external.database'),
                'username' => config('database.connections.relabs_external.username'),
            ]);

            DB::purge('relabs_external');

            // Get clients with additional data using helper function
            $clients = $this->getClientsWithAdditionalData('relabs_external');

            Log::info('✅ Successfully connected and queried database');

            // Ensure clients is always an array
            if (!is_array($clients)) {
                $clients = [];
            }

            $count = count($clients);
            Log::info('✅ Successfully fetched ' . $count . ' client names from external database (Relabs)');

            // Prepare response data
            $responseData = [
                'success' => true,
                'data' => $clients,
                'count' => $count
            ];

            Log::info('📦 Response data prepared:', ['count' => $count, 'sample' => $count > 0 ? $clients[0] : 'no data']);

            // Ensure response is properly formatted
            $jsonResponse = response()->json($responseData, $this->successStatus);

            // Log final response untuk debugging
            Log::info('📤 Sending response:', [
                'status' => $this->successStatus,
                'data_count' => $count,
                'response_size' => strlen(json_encode($responseData))
            ]);

            return $jsonResponse;
        } catch (Exception $error) {
            Log::error('❌ Error fetching clients from external database (Relabs): ' . $error->getMessage());

            $errorMessage = 'Failed to fetch clients from external database';
            $statusCode = 500;

            // Berikan error message yang lebih informatif
            if (strpos($error->getMessage(), 'Access denied') !== false) {
                $errorMessage = 'Access denied to external database. Check database credentials.';
                $statusCode = 403;
            } elseif (strpos($error->getMessage(), 'Unknown database') !== false) {
                $errorMessage = 'Database not found. Check database name.';
                $statusCode = 404;
            } elseif (strpos($error->getMessage(), "doesn't exist") !== false) {
                $errorMessage = 'Table tblclients not found in external database.';
                $statusCode = 404;
            } elseif (
                strpos($error->getMessage(), 'Connection refused') !== false ||
                strpos($error->getMessage(), 'Connection timed out') !== false ||
                strpos($error->getMessage(), '2002') !== false
            ) {
                $errorMessage = 'Cannot connect to external database. Possible causes: 1) IP server not allowed for remote MySQL connection, 2) Firewall blocking port 3306, 3) MySQL server not accepting remote connections. Please check MySQL remote access settings and firewall rules.';
                $statusCode = 503;
            }

            $errorResponse = [
                'success' => false,
                'message' => $errorMessage,
                'error' => $error->getMessage(),
                'data' => [],
                'count' => 0
            ];

            Log::error('❌ Error response:', $errorResponse);

            return response()->json($errorResponse, $statusCode, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept',
            ]);
        }
    }

    /**
     * Get clients from external database (tblclients) - GoldenFast
     * Returns the 'firstname', 'lastname', 'phonenumber', 'email',
     * 'layanan_aktif', 'invoices_unpaid', and 'ticket_selain_close' fields
     *
     * NOTE: This endpoint is for testing - NO TOKEN AUTHENTICATION REQUIRED
     * Route is in web.php without auth middleware
     */
    public function getClientsGoldenFast(Request $request)
    {
        // NO TOKEN VALIDATION - Testing only
        Log::info('📥 ========== External Clients API Request START (GoldenFast - NO AUTH) ==========');
        Log::info('📥 External Clients API Request (GoldenFast):', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'headers' => $request->headers->all(),
            'x_requested_with' => $request->header('X-Requested-With'),
        ]);
        Log::info('📥 ========== External Clients API Request END ==========');

        try {
            Log::info('🔍 Attempting to connect to external database (GoldenFast)...', [
                'connection' => 'goldenfast_external',
                'host' => config('database.connections.goldenfast_external.host'),
                'database' => config('database.connections.goldenfast_external.database'),
                'username' => config('database.connections.goldenfast_external.username'),
            ]);

            DB::purge('goldenfast_external');

            // Get clients with additional data using helper function
            $clients = $this->getClientsWithAdditionalData('goldenfast_external');

            Log::info('✅ Successfully connected and queried database');

            // Ensure clients is always an array
            if (!is_array($clients)) {
                $clients = [];
            }

            $count = count($clients);
            Log::info('✅ Successfully fetched ' . $count . ' client names from external database (GoldenFast)');

            // Prepare response data
            $responseData = [
                'success' => true,
                'data' => $clients,
                'count' => $count
            ];

            Log::info('📦 Response data prepared:', ['count' => $count, 'sample' => $count > 0 ? $clients[0] : 'no data']);

            // Ensure response is properly formatted
            $jsonResponse = response()->json($responseData, $this->successStatus);

            // Log final response untuk debugging
            Log::info('📤 Sending response:', [
                'status' => $this->successStatus,
                'data_count' => $count,
                'response_size' => strlen(json_encode($responseData))
            ]);

            return $jsonResponse;
        } catch (Exception $error) {
            Log::error('❌ Error fetching clients from external database (GoldenFast): ' . $error->getMessage());

            $errorMessage = 'Failed to fetch clients from external database';
            $statusCode = 500;

            // Berikan error message yang lebih informatif
            if (strpos($error->getMessage(), 'Access denied') !== false) {
                $errorMessage = 'Access denied to external database. Check database credentials.';
                $statusCode = 403;
            } elseif (strpos($error->getMessage(), 'Unknown database') !== false) {
                $errorMessage = 'Database not found. Check database name.';
                $statusCode = 404;
            } elseif (strpos($error->getMessage(), "doesn't exist") !== false) {
                $errorMessage = 'Table tblclients not found in external database.';
                $statusCode = 404;
            } elseif (
                strpos($error->getMessage(), 'Connection refused') !== false ||
                strpos($error->getMessage(), 'Connection timed out') !== false ||
                strpos($error->getMessage(), '2002') !== false
            ) {
                $errorMessage = 'Cannot connect to external database. Possible causes: 1) IP server not allowed for remote MySQL connection, 2) Firewall blocking port 3306, 3) MySQL server not accepting remote connections. Please check MySQL remote access settings and firewall rules.';
                $statusCode = 503;
            }

            $errorResponse = [
                'success' => false,
                'message' => $errorMessage,
                'error' => $error->getMessage(),
                'data' => [],
                'count' => 0
            ];

            Log::error('❌ Error response:', $errorResponse);

            return response()->json($errorResponse, $statusCode, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept',
            ]);
        }
    }

    /**
     * Get clients from external database (tblclients) - BikinWebsite
     * Returns the 'firstname', 'lastname', 'phonenumber', 'email',
     * 'layanan_aktif', 'invoices_unpaid', and 'ticket_selain_close' fields
     *
     * NOTE: This endpoint is for testing - NO TOKEN AUTHENTICATION REQUIRED
     * Route is in web.php without auth middleware
     */
    public function getClientsBikinWebsite(Request $request)
    {
        // NO TOKEN VALIDATION - Testing only
        Log::info('📥 ========== External Clients API Request START (BikinWebsite - NO AUTH) ==========');
        Log::info('📥 External Clients API Request (BikinWebsite):', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'headers' => $request->headers->all(),
            'x_requested_with' => $request->header('X-Requested-With'),
        ]);
        Log::info('📥 ========== External Clients API Request END ==========');

        try {
            Log::info('🔍 Attempting to connect to external database (BikinWebsite)...', [
                'connection' => 'bikinwebsite_external',
                'host' => config('database.connections.bikinwebsite_external.host'),
                'database' => config('database.connections.bikinwebsite_external.database'),
                'username' => config('database.connections.bikinwebsite_external.username'),
            ]);

            DB::purge('bikinwebsite_external');

            // Get clients with additional data using helper function
            $clients = $this->getClientsWithAdditionalData('bikinwebsite_external');

            Log::info('✅ Successfully connected and queried database');

            // Ensure clients is always an array
            if (!is_array($clients)) {
                $clients = [];
            }

            $count = count($clients);
            Log::info('✅ Successfully fetched ' . $count . ' client names from external database (BikinWebsite)');

            // Prepare response data
            $responseData = [
                'success' => true,
                'data' => $clients,
                'count' => $count
            ];

            Log::info('📦 Response data prepared:', ['count' => $count, 'sample' => $count > 0 ? $clients[0] : 'no data']);

            // Ensure response is properly formatted
            $jsonResponse = response()->json($responseData, $this->successStatus);

            // Log final response untuk debugging
            Log::info('📤 Sending response:', [
                'status' => $this->successStatus,
                'data_count' => $count,
                'response_size' => strlen(json_encode($responseData))
            ]);

            return $jsonResponse;
        } catch (Exception $error) {
            Log::error('❌ Error fetching clients from external database (BikinWebsite): ' . $error->getMessage());

            $errorMessage = 'Failed to fetch clients from external database';
            $statusCode = 500;

            // Berikan error message yang lebih informatif
            if (strpos($error->getMessage(), 'Access denied') !== false) {
                $errorMessage = 'Access denied to external database. Check database credentials.';
                $statusCode = 403;
            } elseif (strpos($error->getMessage(), 'Unknown database') !== false) {
                $errorMessage = 'Database not found. Check database name.';
                $statusCode = 404;
            } elseif (strpos($error->getMessage(), "doesn't exist") !== false) {
                $errorMessage = 'Table tblclients not found in external database.';
                $statusCode = 404;
            } elseif (
                strpos($error->getMessage(), 'Connection refused') !== false ||
                strpos($error->getMessage(), 'Connection timed out') !== false ||
                strpos($error->getMessage(), '2002') !== false
            ) {
                $errorMessage = 'Cannot connect to external database. Possible causes: 1) IP server not allowed for remote MySQL connection, 2) Firewall blocking port 3306, 3) MySQL server not accepting remote connections. Please check MySQL remote access settings and firewall rules.';
                $statusCode = 503;
            }

            $errorResponse = [
                'success' => false,
                'message' => $errorMessage,
                'error' => $error->getMessage(),
                'data' => [],
                'count' => 0
            ];

            Log::error('❌ Error response:', $errorResponse);

            return response()->json($errorResponse, $statusCode, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept',
            ]);
        }
    }

    /**
     * Get clients from external database (tblclients) - GudangSSL
     * Returns the 'firstname', 'lastname', 'phonenumber', 'email',
     * 'layanan_aktif', 'invoices_unpaid', and 'ticket_selain_close' fields
     *
     * NOTE: This endpoint is for testing - NO TOKEN AUTHENTICATION REQUIRED
     * Route is in web.php without auth middleware
     */
    public function getClientsGudangSsl(Request $request)
    {
        // NO TOKEN VALIDATION - Testing only
        Log::info('📥 ========== External Clients API Request START (GudangSSL - NO AUTH) ==========');
        Log::info('📥 External Clients API Request (GudangSSL):', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'headers' => $request->headers->all(),
            'x_requested_with' => $request->header('X-Requested-With'),
        ]);
        Log::info('📥 ========== External Clients API Request END ==========');

        try {
            Log::info('🔍 Attempting to connect to external database (GudangSSL)...', [
                'connection' => 'gudangssl_external',
                'host' => config('database.connections.gudangssl_external.host'),
                'database' => config('database.connections.gudangssl_external.database'),
                'username' => config('database.connections.gudangssl_external.username'),
            ]);

            DB::purge('gudangssl_external');

            // Get clients with additional data using helper function
            $clients = $this->getClientsWithAdditionalData('gudangssl_external');

            Log::info('✅ Successfully connected and queried database');

            // Ensure clients is always an array
            if (!is_array($clients)) {
                $clients = [];
            }

            $count = count($clients);
            Log::info('✅ Successfully fetched ' . $count . ' client names from external database (GudangSSL)');

            // Prepare response data
            $responseData = [
                'success' => true,
                'data' => $clients,
                'count' => $count
            ];

            Log::info('📦 Response data prepared:', ['count' => $count, 'sample' => $count > 0 ? $clients[0] : 'no data']);

            // Ensure response is properly formatted
            $jsonResponse = response()->json($responseData, $this->successStatus);

            // Log final response untuk debugging
            Log::info('📤 Sending response:', [
                'status' => $this->successStatus,
                'data_count' => $count,
                'response_size' => strlen(json_encode($responseData))
            ]);

            return $jsonResponse;
        } catch (Exception $error) {
            Log::error('❌ Error fetching clients from external database (GudangSSL): ' . $error->getMessage());

            $errorMessage = 'Failed to fetch clients from external database';
            $statusCode = 500;

            // Berikan error message yang lebih informatif
            if (strpos($error->getMessage(), 'Access denied') !== false) {
                $errorMessage = 'Access denied to external database. Check database credentials.';
                $statusCode = 403;
            } elseif (strpos($error->getMessage(), 'Unknown database') !== false) {
                $errorMessage = 'Database not found. Check database name.';
                $statusCode = 404;
            } elseif (strpos($error->getMessage(), "doesn't exist") !== false) {
                $errorMessage = 'Table tblclients not found in external database.';
                $statusCode = 404;
            } elseif (
                strpos($error->getMessage(), 'Connection refused') !== false ||
                strpos($error->getMessage(), 'Connection timed out') !== false ||
                strpos($error->getMessage(), '2002') !== false
            ) {
                $errorMessage = 'Cannot connect to external database. Possible causes: 1) IP server not allowed for remote MySQL connection, 2) Firewall blocking port 3306, 3) MySQL server not accepting remote connections. Please check MySQL remote access settings and firewall rules.';
                $statusCode = 503;
            }

            $errorResponse = [
                'success' => false,
                'message' => $errorMessage,
                'error' => $error->getMessage(),
                'data' => [],
                'count' => 0
            ];

            Log::error('❌ Error response:', $errorResponse);

            return response()->json($errorResponse, $statusCode, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept',
            ]);
        }
    }

    /**
     * Get client by phone number from external database (tblclients) - Qwords
     * Returns the 'firstname', 'lastname', 'phonenumber', 'email',
     * 'layanan_aktif', 'invoices_unpaid', and 'ticket_selain_close' fields
     *
     * NOTE: This endpoint is for testing - NO TOKEN AUTHENTICATION REQUIRED
     * Route is in web.php without auth middleware
     */
    public function getClientByPhoneQwords(Request $request)
    {
        $phone = $request->query('phone') ?? $request->input('phone');

        if (!$phone) {
            return response()->json([
                'success' => false,
                'message' => 'Phone number is required',
                'data' => null
            ], 400);
        }

        try {
            DB::purge('qwords_external');
            $client = $this->getClientByPhoneWithAdditionalData('qwords_external', $phone);

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $client
            ], $this->successStatus);
        } catch (Exception $error) {
            Log::error('❌ Error fetching client by phone from external database (Qwords): ' . $error->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch client from external database',
                'error' => $error->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get client by phone number from external database (tblclients) - Relabs
     */
    public function getClientByPhoneRelabs(Request $request)
    {
        $phone = $request->query('phone') ?? $request->input('phone');

        if (!$phone) {
            return response()->json([
                'success' => false,
                'message' => 'Phone number is required',
                'data' => null
            ], 400);
        }

        try {
            DB::purge('relabs_external');
            $client = $this->getClientByPhoneWithAdditionalData('relabs_external', $phone);

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $client
            ], $this->successStatus);
        } catch (Exception $error) {
            Log::error('❌ Error fetching client by phone from external database (Relabs): ' . $error->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch client from external database',
                'error' => $error->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get client by phone number from external database (tblclients) - GoldenFast
     */
    public function getClientByPhoneGoldenFast(Request $request)
    {
        $phone = $request->query('phone') ?? $request->input('phone');

        if (!$phone) {
            return response()->json([
                'success' => false,
                'message' => 'Phone number is required',
                'data' => null
            ], 400);
        }

        try {
            DB::purge('goldenfast_external');
            $client = $this->getClientByPhoneWithAdditionalData('goldenfast_external', $phone);

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $client
            ], $this->successStatus);
        } catch (Exception $error) {
            Log::error('❌ Error fetching client by phone from external database (GoldenFast): ' . $error->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch client from external database',
                'error' => $error->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get client by phone number from external database (tblclients) - BikinWebsite
     */
    public function getClientByPhoneBikinWebsite(Request $request)
    {
        $phone = $request->query('phone') ?? $request->input('phone');

        if (!$phone) {
            return response()->json([
                'success' => false,
                'message' => 'Phone number is required',
                'data' => null
            ], 400);
        }

        try {
            DB::purge('bikinwebsite_external');
            $client = $this->getClientByPhoneWithAdditionalData('bikinwebsite_external', $phone);

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $client
            ], $this->successStatus);
        } catch (Exception $error) {
            Log::error('❌ Error fetching client by phone from external database (BikinWebsite): ' . $error->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch client from external database',
                'error' => $error->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get client by phone number from external database (tblclients) - GudangSSL
     */
    public function getClientByPhoneGudangSsl(Request $request)
    {
        $phone = $request->query('phone') ?? $request->input('phone');

        if (!$phone) {
            return response()->json([
                'success' => false,
                'message' => 'Phone number is required',
                'data' => null
            ], 400);
        }

        try {
            DB::purge('gudangssl_external');
            $client = $this->getClientByPhoneWithAdditionalData('gudangssl_external', $phone);

            if (!$client) {
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $client
            ], $this->successStatus);
        } catch (Exception $error) {
            Log::error('❌ Error fetching client by phone from external database (GudangSSL): ' . $error->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch client from external database',
                'error' => $error->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
