// Helper untuk mendapatkan ekstensi file
const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
};

// Validasi ekstensi file yang diizinkan
export const fileFilter = (req: any, file: any, cb: any) => {
  const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const allowedDocTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  const ext = getFileExtension(file.originalname);

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Konfigurasi storage untuk multer
export const getStorageConfig = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const multer = require('multer');

  return multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      // Simpan file di folder uploads
      cb(null, './uploads');
    },
    filename: (req: any, file: any, cb: any) => {
      // Generate nama file unik
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = getFileExtension(file.originalname);
      cb(null, `file-${uniqueSuffix}${ext}`);
    },
  });
};

// Helper untuk menentukan tipe file berdasarkan ekstensi
export const getFileType = (filename: string): string => {
  const ext = getFileExtension(filename);
  const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const docTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];

  if (imageTypes.includes(ext)) {
    return 'image';
  } else if (docTypes.includes(ext)) {
    return 'document';
  }
  return 'other';
};

// Helper untuk menentukan message type berdasarkan file type
export const getMessageTypeFromFile = (fileType: string): string => {
  if (fileType === 'image') {
    return 'image';
  } else if (fileType === 'document') {
    return 'document';
  }
  return 'text';
};
