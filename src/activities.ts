import twilio from 'twilio';
import { SMSRequest, SMSResponse } from './types/sms';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function sendSMS(request: SMSRequest): Promise<SMSResponse> {
  try {
    const {toPhoneNumber, fromPhoneNumber, body, medialURLs} = request;
    const client = twilio(process.env.TWILIO_API_KEY, process.env.TWILIO_API_KEY_SECRET, {accountSid: process.env.TWILIO_ACCOUNT_SID});
    const result = await client.messages.create({
      body,
      mediaUrl: medialURLs,
      to: toPhoneNumber,
      from: fromPhoneNumber
    });
    return {id: result.sid, additionalPayload: result};
  } catch(e) {
    const errorMessage = getErrorMessage(e);
    console.error(errorMessage);
    return {errorMessage};
  }
}