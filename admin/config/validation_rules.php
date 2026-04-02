<?php

return [
    /**
     * Available file extensions
     * used for validating chat file
     */
    'allowed_file' => [
        // type     |   extension
        'image' => [
            'gif',
            'ico',
            'jpg',
            'jpeg',
            'png',
            'svg',
            'tif',
            'tiff',
            'webp',
        ],
        'video' => [
            'mp4',
            'webm',
            'avi',
            'mpeg',
            'mkv',
        ],
        'archive' => [
            'arc',
            'bz',
            'bz2',
            'gz',
            'rar',
            'tar',
            'zip',
            '7z',
        ],
        'other' => [
            'crt',
            'csr',
            'doc',
            'docx',
            'pdf',
            'txt',
            'xls',
            'xlsx',
        ]
    ],
];
