import { wsAdminMetaPayload, wsUserMetaPayload } from '../types/websockets.types';

export const dayInMs = 86400000;

export const daysOfActivityMS = 30 * 86400000;

export const pointsTo2Status = 30;

export const pointsTo3Status = 60;

export const disconnectionChatTime = 5 * 60 * 1000;

export const emptyWsUserMeta: wsUserMetaPayload = {
  tasks: [],
  system: [],
  conflicts: [],
};

export const emptyWsAdminMeta: wsAdminMetaPayload = {
  my: [],
  system: [],
  moderated: [],
  conflicts: [],
};
