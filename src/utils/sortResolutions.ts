type Resolution = string | { width: number; height: number };

export const sortResolutions = (resolutions: Resolution[]) => {
  // Map each resolution to an object with the resolution string and its pixel count
  const resolutionsWithPixelCount = resolutions.map((resolution) => {
    let width: number;
    let height: number;

    if (typeof resolution !== 'string') {
      width = resolution.width;
      height = resolution.height;
    } else {
      [width, height] = resolution.split('x').map(Number);
      resolution = { width, height };
    }

    const resolutionString = `${width}x${height}`;

    return {
      resolution,
      resolutionString,
      pixelCount: width * height,
    };
  });

  // Sort the resolutions by pixel count in descending order
  resolutionsWithPixelCount.sort((a, b) => b.pixelCount - a.pixelCount);

  // Map back to the original resolution format
  return resolutionsWithPixelCount.map(({ resolution, resolutionString }) => ({
    resolution,
    resolutionString,
  }));
};
