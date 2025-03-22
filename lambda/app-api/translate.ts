import { APIGatewayProxyHandler } from "aws-lambda";
import 'source-map-support/register';
import apiResponses from "./common/apiResponses";
import * as AWS from 'aws-sdk'
import { Translate } from "aws-sdk";

const translate = new AWS.Translate();


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const body = event.body ? JSON.parse(event.body) : undefined;
    const {text, language} = body;
    if (!text){
        return apiResponses._400({message: 'missing text from the body'})
    }
    if (!language){
        return apiResponses._400({message: 'missing language from the body'})
    }

    try{
        const translateParams: Translate.Types.TranslateTextRequest = {
            Text: text,
            SourceLanguageCode: "en",
            TargetLanguageCode: language
        };
        const translatedMessage = await translate.translateText(translateParams).promise();
        return apiResponses._200({translatedMessage})
    }catch(error){
         console.log("error in the translation", error);
         return  apiResponses._400({message:"unable translate the message"})
        }
};

