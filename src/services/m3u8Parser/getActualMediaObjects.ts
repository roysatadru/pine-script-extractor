import * as m3u8Parser from 'm3u8-parser';
import _ from 'lodash';

export const getActualMediaObjects = async (
  mediaGroups: m3u8Parser.MediaGroups[keyof m3u8Parser.MediaGroups],
) => {
  const mediaObjects = [] as Array<m3u8Parser.Subtitle>;

  function getMediaObjectsRecursively(
    mediaGroups: m3u8Parser.MediaGroups[keyof m3u8Parser.MediaGroups],
  ) {
    if (
      !mediaGroups ||
      typeof mediaGroups !== 'object' ||
      Array.isArray(mediaGroups) ||
      _.isEmpty(mediaGroups)
    ) {
      return;
    }

    for (const key in mediaGroups) {
      if (Object.prototype.hasOwnProperty.call(mediaGroups, key)) {
        const mediaObject = mediaGroups[key];

        if (mediaObject?.uri) {
          mediaObjects.push({ ...mediaObject, key } as never);
        } else {
          getMediaObjectsRecursively(mediaObject as never);
        }
      }
    }
  }

  getMediaObjectsRecursively(mediaGroups);

  return mediaObjects;
};
