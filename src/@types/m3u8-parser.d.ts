declare module 'm3u8-parser' {
  export type Playlists = Playlist[];

  export interface Playlist {
    attributes: Attributes;
    uri: string;
    timeline: number;
  }

  export interface Attributes {
    SUBTITLES: string;
    NAME: string;
    RESOLUTION: Resolution;
    BANDWIDTH: number;
    AVERAGE_BANDWIDTH: string;
  }

  export interface Resolution {
    width: number;
    height: number;
  }

  export interface Audio {
    default: boolean;
    autoselect: boolean;
    language: string;
    uri: string;
    groupId: string;
    characteristics: string;
  }

  export interface Video {
    default: boolean;
    autoselect: boolean;
    uri: string;
    groupId: string;
    characteristics: string;
  }

  export interface ClosedCaptions {
    default: boolean;
    autoselect: boolean;
    language: string;
    uri: string;
    groupId: string;
    characteristics: string;
  }

  export interface Subtitle {
    default: boolean;
    autoselect: boolean;
    language: string;
    uri: string;
    characteristics: string;
    forced: boolean;
  }

  export type MediaGroups = {
    AUDIO: Record<string, Record<string, Audio>>;
    VIDEO: Record<string, Record<string, Video>>;
    'CLOSED-CAPTIONS': Record<string, Record<string, ClosedCaptions>>;
    SUBTITLES: Record<string, Record<string, Subtitle>>;
  };

  export interface Segment {
    uri: string;
    timeline: number;
    duration: number;
  }

  export class Parser {
    manifest: Manifest | null;
    push: (text: string) => void;
    end: () => void;
  }

  export interface Manifest {
    playlists?: Playlists;
    mediaGroups?: MediaGroups;
    segments?: Segment[];
  }
}
