let openAIBaseURL = '';
let transcriptURL = '';
let paperWritingURL = '';
let paperPDFURL = '';
let REGION = process.env.NEXT_PUBLIC_REGION;
let API_KEY = process.env.NEXT_PUBLIC_API_KEY;
let MODEL_NAME = process.env.NEXT_PUBLIC_MODEL_NAME;

openAIBaseURL = 'https://' + process.env.NEXT_PUBLIC_PROD_API_HOST + '/v1/';
transcriptURL =
  'https://' + process.env.NEXT_PUBLIC_PROD_API_HOST + '/302/transcript?url=';
paperWritingURL = process.env.NEXT_PUBLIC_PROD_AI_PAPER_WRITING_API!;
paperPDFURL = process.env.NEXT_PUBLIC_PROD_AI_PAPER_PDF_API!;

export {
  API_KEY,
  MODEL_NAME,
  REGION,
  openAIBaseURL,
  paperPDFURL,
  paperWritingURL,
  transcriptURL
};

