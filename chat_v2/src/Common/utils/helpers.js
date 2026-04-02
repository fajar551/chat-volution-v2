import _ from 'lodash';
import moment from 'moment';
import { toast } from 'react-toastify';
import { validateSession } from '../../app/Auth/AuthApi';

/* alert toastify */
export const notify = (type, timeOut, message, position = false) => {
  let alertPosition = '';
  switch (position) {
    case 'top_right':
      alertPosition = toast.POSITION.TOP_RIGHT;
      break;
    case 'top_left':
      alertPosition = toast.POSITION.TOP_LEFT;
      break;
    case 'bottom_left':
      alertPosition = toast.POSITION.BOTTOM_LEFT;
      break;
    case 'bottom_right':
      alertPosition = toast.POSITION.BOTTOM_RIGHT;
      break;
    case 'bottom_center':
      alertPosition = toast.POSITION.BOTTOM_CENTER;
      break;
    default:
      alertPosition = toast.POSITION.TOP_CENTER;
      break;
  }

  if (type === 'loading') {
    return toast.loading(Boolean(message) ? message : 'default text', {
      position: alertPosition,
      close: Boolean(timeOut) ? timeOut : false,
      theme: 'colored',
      pauseOnFocusLoss: false,
    });
  }

  if (type === 'error') {
    return toast.error(Boolean(message) ? message : 'default text', {
      position: alertPosition,
      close: Boolean(timeOut) ? timeOut : false,
      theme: 'colored',
      pauseOnFocusLoss: false,
    });
  }

  if (type === 'warn') {
    return toast.warn(Boolean(message) ? message : 'default text', {
      position: alertPosition,
      close: Boolean(timeOut) ? timeOut : false,
      theme: 'colored',
      pauseOnFocusLoss: false,
    });
  }

  if (type === 'success') {
    return toast.success(Boolean(message) ? message : 'default text', {
      position: alertPosition,
      close: Boolean(timeOut) ? timeOut : false,
      theme: 'colored',
      pauseOnFocusLoss: false,
    });
  }

  if (type === 'info') {
    return toast.info(Boolean(message) ? message : 'default text', {
      position: alertPosition,
      close: Boolean(timeOut) ? timeOut : false,
      theme: 'colored',
      pauseOnFocusLoss: false,
    });
  }
};

/* agent online */
export const validateUsersOnline = (listUsers, session) => {
  return listUsers.filter((el) => {
    return el.id !== session.agent_id;
  });
};

/* validate department online */
export const validateDepartmentOnline = (listDepartment, session) => {
  return listDepartment.filter((el) => {
    return el.name.toLowerCase() !== session.department_name.toLowerCase();
  });
};

/* capitalize first text */
export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/* capitalize first text with multiple paragraph */
export const capitalizeFirstMultiParagraph = (string) => {
  const splitUname = string.split(' ');
  let result = '';
  splitUname.map((value) => {
    result = result.concat(` ${capitalizeFirstLetter(value)}`);
  });

  return result;
};

/* filter chat active on client chat */
export const clientActive = (listChat, chatId) => {
  return listChat.filter((el) => {
    return el.chat_id !== chatId;
  });
};

/* create date */
export const createDate = (request = false) => {
  switch (request) {
    case 'unix_timestamp':
      return moment().format('X');
    case 'time_no_seconds':
      return moment.format('HH:mm');
    case 'full_time':
      return moment().format('HH:mm:ss');
    case 'hours':
      return moment().format('HH');
    case 'no_time':
      return moment().format('YYYY-MM-DD');
    case 'normal_year':
      return moment().format('YYYY');
    case '2d_year':
      return moment().format('YY');
    case 'normal_month':
      return moment().format('MM');
    case 'sort_name_month':
      return moment().format('MMM');
    case 'long_name_month':
      return moment().format('MMMM');
    case 'normal_day':
      return moment().format('DD');
    case 'name_day':
      return moment().format('dddd');
    case 'long_time_seconds':
      return moment().format('LTS');
    case 'long_date_name_time_seconds':
      return moment().format('LLLL');
    default:
      return moment().format('YYYY-MM-DD HH:mm:ss');
  }
};

/* date diff */
export const dateDiff = (param_start_date = false, param_end_date = false) => {
  let now = createDate();

  let start_date = !Boolean(param_start_date)
    ? now
    : moment(param_start_date).format('YYYY-MM-DD HH:mm:ss');

  let end_date = !Boolean(param_end_date)
    ? now
    : moment(param_end_date).format('YYYY-MM-DD HH:mm:ss');

  let diffDate = moment.duration(moment().diff(start_date, end_date));

  return {
    yearsDiff: diffDate.years(),
    monthsDiff: diffDate.months(),
    weeksDiff: diffDate.weeks(),
    daysDiff: diffDate.days(),
    hoursDiff: diffDate.hours(),
    minutesDiff: diffDate.minutes(),
  };
};

/* change format date */
export const changeFormatDate = (date, request = false) => {
  switch (request) {
    case 'unix_timestamp':
      return moment(date).format('X');
    case 'time_no_seconds':
      return moment.format('HH:mm');
    case 'full_time':
      return moment(date).format('HH:mm:ss');
    case 'hours':
      return moment(date).format('HH');
    case 'no_time':
      return moment(date).format('YYYY-MM-DD');
    case 'normal_year':
      return moment(date).format('YYYY');
    case '2d_year':
      return moment(date).format('YY');
    case 'normal_month':
      return moment(date).format('MM');
    case 'sort_name_month':
      return moment(date).format('MMM');
    case 'long_name_month':
      return moment(date).format('MMMM');
    case 'normal_day':
      return moment(date).format('DD');
    case 'name_day':
      return moment(date).format('dddd');
    case 'date_long_time_no_seconds':
      return moment(date).format('DD MMM YYYY LT');
    case 'time_24h_no_seconds':
      return moment(date).format('HH:mm');
    case 'long_time_seconds':
      return moment(date).format('LTS');
    case 'long_date_name_time_seconds':
      return moment(date).format('LLLL');
    case 'two_digit_date_with_slash':
      return moment(date).format('DD/MM/YY');
    case 'two_digit_date_with_strip':
      return moment(date).format('DD-MM-YY');
    case 'to_iso':
      return moment(date).toDate();
    default:
      return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }
};

/* format customize date reference from social media */
export const parseDateSocial = (date, request = false) => {
  if (!request) {
    return moment(date).fromNow();
  }

  const compareDate = dateDiff(date);

  if (compareDate.hoursDiff < 21) {
    if (compareDate.daysDiff > 0) {
      return changeFormatDate(date, 'date_long_time_no_seconds');
    }

    if (compareDate.hoursDiff < 2) {
      return moment(date).fromNow();
    }

    return changeFormatDate(date, 'date_long_time_no_seconds');
  }

  return changeFormatDate(date, 'date_long_time_no_seconds');
};

/* parse date from now reference whatsapp v 2.22.27.4 */
export const parseDateNowVWa = (date) => {
  if (!date) return '';

  try {
    // Pastikan tanggal dalam format yang valid untuk moment.js
    let momentDate;

    // Coba berbagai format tanggal
    if (typeof date === 'string') {
      // Coba parse sebagai ISO string atau format lainnya
      // Gunakan moment.utc() jika format ISO dengan Z (UTC), lalu konversi ke local time
      if (date.endsWith('Z') || (date.includes('T') && date.includes('Z'))) {
        // Format ISO dengan Z (UTC), konversi ke local time
        momentDate = moment.utc(date).local();
      } else {
        momentDate = moment(date);
      }

      // Jika tidak valid, coba format lain
      if (!momentDate.isValid()) {
        // Coba parse sebagai timestamp (Unix timestamp dalam detik atau milidetik)
        const timestamp = parseInt(date);
        if (!isNaN(timestamp)) {
          // Jika timestamp dalam detik (kurang dari 1e12), konversi ke milidetik
          momentDate = moment(timestamp < 1e12 ? timestamp * 1000 : timestamp);
        } else {
          // Coba parse dengan format lain
          momentDate = moment(date, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'DD/MM/YYYY HH:mm', 'DD-MM-YYYY HH:mm']);
        }
      }
    } else if (date instanceof Date) {
      momentDate = moment(date);
    } else {
      momentDate = moment(date);
    }

    // Validasi apakah tanggal valid
    if (!momentDate.isValid()) {
      console.warn('Invalid date format:', date, 'Type:', typeof date);
      return '';
    }

    // Simpan momentDate asli sebelum menggunakan startOf('day')
    const originalMomentDate = momentDate.clone();

    // Cek apakah hari ini (bandingkan tanggal, bukan waktu)
    const today = moment().startOf('day');
    const dateToCheck = momentDate.startOf('day');
    const isToday = today.isSame(dateToCheck, 'day');

    if (isToday) {
      // Jika hari ini, tampilkan jam saja (format Indonesia 24 jam)
      // Format: HH:mm (contoh: 14:30, 09:15)
      // Gunakan originalMomentDate untuk mendapatkan jam yang benar, bukan yang sudah di-startOf('day')
      const timeFormatted = originalMomentDate.format('HH:mm');

      return timeFormatted;
    } else {
      // Jika bukan hari ini, tampilkan tanggal saja
      // Format: DD/MM/YYYY (contoh: 07/11/2025)
      // Gunakan originalMomentDate untuk mendapatkan tanggal yang benar
      const dateFormatted = originalMomentDate.format('DD/MM/YYYY');

      return dateFormatted;
    }
  } catch (error) {
    console.error('Error parsing date:', error, date, 'Type:', typeof date);
    return '';
  }
};

/* parse date with complete format for WhatsApp detail (tanggal dan jam lengkap) */
export const parseDateNowVWaComplete = (date) => {
  if (!date) return '';

  try {
    // Pastikan tanggal dalam format yang valid untuk moment.js
    const momentDate = moment(date);

    // Validasi apakah tanggal valid
    if (!momentDate.isValid()) {
      console.warn('Invalid date format:', date);
      return '';
    }

    // Format lengkap: DD/MM/YYYY HH:mm (contoh: 07/11/2025 14:30)
    return momentDate.format('DD/MM/YYYY HH:mm');
  } catch (error) {
    console.error('Error parsing date:', error, date);
    return '';
  }
};

/* generate random string */
export const randomString = (length, type = 'default') => {
  let result = '';
  let characters = '';

  if (type === 'number') {
    characters = '0123456789';
  } else if (type === 'alphabet') {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  } else if (type === 'random') {
    characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@*!&_';
  } else {
    characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  }

  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/* change numbering counter from symbol non currency*/
export const changeNumbering = (number, request) => {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];

  const regexVal = /\.0+$|(\.[0-9]*[1-9])0+$/;

  let item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return number >= item.value;
    });

  return item
    ? (number / item.value).toFixed(request).replace(regexVal, '$1') +
    item.symbol
    : '0';
};

/* get Extension File */
export const getExtensionFile = (path) => {
  let baseName = path.split(/[\\/]/).pop();
  let splitBaseName = baseName.lastIndexOf('.');

  if (baseName === '' || splitBaseName < 1) {
    return '';
  }

  return baseName.slice(splitBaseName + 1).toLowerCase();
};

export const declareExtensionPerCategory = (type) => {
  switch (type) {
    case 'image':
      return ['gif', 'ico', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'tiff', 'webp'];
    case 'video':
      return ['mp4', 'webm', 'avi', 'mpeg', 'mkv'];
    case 'archived':
      return ['arc', 'bz', 'bz2', 'gz', 'rar', 'tar', 'zip', '7z'];
    case 'code':
      return [
        'sh',
        'bash',
        'bats',
        'cgi',
        'command',
        'fcgi',
        'ksh',
        'tmux',
        'tool',
        'zsh',
        'js',
        '_js',
        'bones',
        'es6',
        'frag',
        'gs',
        'jake',
        'jsb',
        'jsfl',
        'jsm',
        'jss',
        'jsx',
        'njs',
        'pac',
        'sjs',
        'ssjs',
        'sublime-build',
        'sublime-commands',
        'sublime-completions',
        'sublime-keymap',
        'sublime-macro',
        'sublime-menu',
        'sublime-mousemap',
        'sublime-project',
        'sublime-settings',
        'sublime-theme',
        'sublime-workspace',
        'sublime_metrics',
        'sublime_session',
        'xsjs',
        'xsjslib',
        'php',
        'json',
        'sql',
        'psql',
        'aw',
        'ctp',
        'fcgi',
        'php3',
        'php4',
        'php5',
        'phpt',
        'html',
        'htm',
        'html.hl',
        'st',
        'xht',
        'xhtml',
        'scss',
        'css',
        'xml',
        'ant',
        'axml',
        'ccxml',
        'clixml',
        'cproject',
        'csproj',
        'ct',
        'dita',
        'ditamap',
        'ditaval',
        'dll.config',
        'filters',
        'fsproj',
        'fxml',
        'glade',
        'grxml',
        'ivy',
        'jelly',
        'kml',
        'launch',
        'mm',
        'mxml',
        'nproj',
        'nuspec',
        'odd',
        'osm',
        'plist',
        'pluginspec',
        'ps1xml',
        'psc1',
        'pt',
        'rdf',
        'rss',
        'scxml',
        'srdf',
        'storyboard',
        'stTheme',
        'sublime-snippet',
        'targets',
        'tmCommand',
        'tml',
        'tmLanguage',
        'tmPreferences',
        'tmSnippet',
        'tmTheme',
        'ts',
        'ui',
        'urdf',
        'vbproj',
        'vcxproj',
        'vxml',
        'wsdl',
        'wsf',
        'wxi',
        'wxl',
        'wxs',
        'x3d',
        'xacro',
        'xaml',
        'xib',
        'xlf',
        'xliff',
        'xmi',
        'xml.dist',
        'xsd',
        'xul',
        'zcml',
      ];
    default:
      return ['crt', 'csr', 'doc', 'docx', 'pdf', 'txt', 'xls', 'xlsx'];
  }
};

/* get category file */
export const getCategoryFile = (extension) => {
  if (declareExtensionPerCategory('image').includes(extension)) {
    return { name: 'image', size: 5242880, unit: '5MB' };
  } else if (declareExtensionPerCategory('video').includes(extension)) {
    return { name: 'video', size: 5242880, unit: '5MB' };
  } else if (declareExtensionPerCategory('archived').includes(extension)) {
    return { name: 'archived', size: 10485760, unit: '10MB' };
  } else if (declareExtensionPerCategory('other').includes(extension)) {
    return { name: 'other', size: 5242880, unit: '5MB' };
  } else if (declareExtensionPerCategory('code').includes(extension)) {
    return { name: 'code', size: 5242880, unit: '5MB' };
  } else {
    return null;
  }
};

/* validation size file */
export const validationSizeFile = (category, fileOriginSize) => {
  const validate = fileOriginSize > category.size ? false : true;
  return validate;
};

/* file size converter */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/* limit text */
export const limitText = (value, startLimit = 0, endLimit) => {
  const valLength = value.length;

  if (valLength > endLimit) {
    return `${value.substring(startLimit, endLimit)}...`;
  }

  return value.substring(startLimit, endLimit);
};

/* is empty object */
export const isEmptyObj = (value) => {
  const result =
    value &&
    Object.keys(value).length === 0 &&
    Object.getPrototypeOf(value) === Object.prototype;
  return result;
};

/* validate sessions */
export const checkAvailableSessions = () => {
  const sessionData = JSON.parse(localStorage.getItem('user'));
  if (Boolean(sessionData)) {
    return { isSessions: true, dataSessions: sessionData };
  } else {
    return { isSessions: false, dataSessions: {} };
  }
};

export const validateSessions = async (dataUsers, command) => {
  const promise = new Promise((resolve, reject) => {
    validateSession(dataUsers.token)
      .then((response) => {
        const { login_data } = response.data;

        resolve({ isValid: true, message: 'session valid!', data: login_data });
      })
      .catch((err) => {
        reject(err);
      });
  });

  return promise;
};

export const filterChatHistory = (data, query) => {
  const regex = new RegExp(_.escapeRegExp(query), 'i');

  const results = data.filter((val) => {
    if (regex.test(val.user_name)) {
      return val;
    }
  });

  return results;
};
