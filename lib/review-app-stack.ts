import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as custom from "aws-cdk-lib/custom-resources";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import { reviews } from "../seed/reviews";
import { generateBatch } from "../shared/util"

export class ReviewAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    const reviewsTable = new dynamodb.Table(this, "ReviewsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "movieId", type: dynamodb.AttributeType.NUMBER },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "Reviews",
    });


    // Functions
    const getReviewsFn = new lambdanode.NodejsFunction(
        this, 
        "GetReviewsFn", 
        {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/reviews/get-reviews.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
        REVIEWS_TABLE_NAME: reviewsTable.tableName,
          REGION: 'eu-west-1',
        },
    });
    const newReviewFn = new lambdanode.NodejsFunction(
        this, 
        "AddReviewFn", 
        {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: `${__dirname}/../lambdas/reviews/add-review.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
            REVIEWS_TABLE_NAME: reviewsTable.tableName,
          REGION: "eu-west-1",
        },
      });

  
    new custom.AwsCustomResource(this, "ReviewsInitData", {
        onCreate: {
          service: "DynamoDB",
          action: "batchWriteItem",
          parameters: {
            RequestItems: {
              [reviewsTable.tableName]: generateBatch(reviews),
            },
          },
          physicalResourceId: custom.PhysicalResourceId.of("ReviewsInitData"), // Unique ID for the custom resource
        },
        policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
          resources: [reviewsTable.tableArn], 
        }),
      });

// Permissions 
    reviewsTable.grantReadData(getReviewsFn);
    reviewsTable.grantWriteData(newReviewFn);

     // REST API 
     const api = new apig.RestApi(this, "ReviewAPI", {
        description: "Review api",
        deployOptions: {
          stageName: "dev",
        },
        defaultCorsPreflightOptions: {
          allowHeaders: ["Content-Type", "X-Amz-Date"],
          allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
          allowCredentials: true,
          allowOrigins: ["*"],
        },
      });
  
     
      const reviewsEndpoint = api.root.addResource("reviews");
      const movieReviewEndpoint = reviewsEndpoint.addResource("{movieId")
      movieReviewEndpoint.addMethod(
        "GET",
        new apig.LambdaIntegration(getReviewsFn, { proxy: true })
      );
      reviewsEndpoint.addMethod("POST", new apig.LambdaIntegration(newReviewFn));
  
    
  }
}