export interface SMSRequest {
  toPhoneNumber: string;
  fromPhoneNumber: string;
  body: string;
  medialURLs?: string[];
}

export interface SMSResponse {
  id?: string;
  additionalPayload?: any;
  errorMessage?: string;
}