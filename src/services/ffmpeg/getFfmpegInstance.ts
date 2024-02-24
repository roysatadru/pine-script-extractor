import ffmpegBinary from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

export const getFfmpegInstance = () => {
  ffmpeg.setFfmpegPath(ffmpegBinary.path);
  return ffmpeg;
};
