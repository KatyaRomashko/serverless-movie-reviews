import { marshall } from "@aws-sdk/util-dynamodb";
import { Review, Translation } from "./types";  

type Entity = Review | Translation; 
export const generateItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
    },
  };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
  });
};

