<?php
/**
 * Script untuk menjalankan whatsapp:close-expired untuk setiap nomor
 *
 * Cara penggunaan:
 * 1. Pastikan berada di folder admin Laravel
 * 2. Jalankan: php close-expired-numbers.php
 */

// Daftar nomor yang akan diproses
$numbers = [
    '6281113017422',
    '6281298432627',
];

echo "Memulai proses close expired untuk " . count($numbers) . " nomor...\n";
echo str_repeat("=", 50) . "\n\n";

$totalProcessed = 0;
$totalUpdated = 0;

foreach ($numbers as $index => $number) {
    $current = $index + 1;
    $total = count($numbers);

    echo "[{$current}/{$total}] Memproses nomor: {$number}\n";

    // Jalankan command artisan
    $command = "php artisan whatsapp:close-expired --number={$number}";
    $output = [];
    $returnVar = 0;

    exec($command, $output, $returnVar);

    // Tampilkan output
    foreach ($output as $line) {
        echo "  " . $line . "\n";
    }

    if ($returnVar === 0) {
        $totalProcessed++;
        // Coba extract jumlah updated dari output (jika ada)
        foreach ($output as $line) {
            if (preg_match('/(\d+)\s+pesan/', $line, $matches)) {
                $totalUpdated += (int)$matches[1];
            }
        }
    } else {
        echo "  ERROR: Command gagal dengan return code {$returnVar}\n";
    }

    echo "\n";
}

echo str_repeat("=", 50) . "\n";
echo "Proses selesai!\n";
echo "Total nomor diproses: {$totalProcessed}/" . count($numbers) . "\n";
if ($totalUpdated > 0) {
    echo "Total pesan diupdate: {$totalUpdated}\n";
}

