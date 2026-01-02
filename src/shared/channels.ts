import { BroadcastChannel } from 'broadcast-channel';

export const deeplinkChannel = new BroadcastChannel<DeeplinkChannel>(
  'deeplink-channel',
  {},
);

export const deletionChannel = new BroadcastChannel<DeletionChannel>(
  'deletion-channel',
  {},
);

export const parserChannel = new BroadcastChannel<ParserChannel>(
  'parser-channel',
  {},
);
