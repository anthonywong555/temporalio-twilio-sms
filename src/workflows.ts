import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';
import { SMSRequest, SMSResponse } from './types/sms';

const { sendSMS } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

/** A workflow that simply calls an activity */
export async function example(request: SMSRequest): Promise<SMSResponse> {
  return await sendSMS(request);
}
