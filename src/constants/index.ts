export const CONSTANTS = {
  CONSOLE_PROGRESS_THROTTLE_MS: 400,
  CONSOLE_PROGRESS_WIDTH: 25,
  CONSOLE_PROGRESS_TEMPLATES: {
    downloading: {
      descIcon: '📥',
      completeIcon: '🟩',
      incompleteIcon: '⬜',
    },
    uploading: {
      descIcon: '📤',
      completeIcon: '🟩',
      incompleteIcon: '⬜',
    },
    processing: {
      descIcon: '🔧',
      completeIcon: '🟧',
      incompleteIcon: '⬜',
    },
    deleting: {
      descIcon: '🧹',
      completeIcon: '🟥',
      incompleteIcon: '⬜',
    },
    packaging: {
      descIcon: '📦',
      completeIcon: '🟧',
      incompleteIcon: '⬜',
    },
    default: {
      descIcon: '🧭',
      completeIcon: '=',
      incompleteIcon: '-',
    },
    custom: {
      descIcon: null,
      completeIcon: null,
      incompleteIcon: null,
    },
  },
  CONSOLE_PROGRESS_ERROR_CONFIG: {
    errorIcon: '❌',
    errorMessage: 'Error',
  },
  SUBTITLE_URL_EXTENSIONS: ['vtt', 'srt', 'ttml'],
} as const;
