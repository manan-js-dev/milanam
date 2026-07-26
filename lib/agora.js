import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

export function generateRtcToken(channelName, uid, expireSeconds = 3600) {
  if (!APP_ID || !APP_CERTIFICATE) {
    throw new Error(
      "Missing AGORA_APP_ID or AGORA_APP_CERTIFICATE in .env.local",
    );
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs,
  );

  return token;
}
