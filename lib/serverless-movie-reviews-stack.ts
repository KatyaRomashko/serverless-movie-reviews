import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';

interface ServerlessMovieReviewsStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
}

export class ServerlessMovieReviewsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ServerlessMovieReviewsStackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const movieReviewsTable = new dynamodb.Table(this, 'MovieReviewsTable', {
      partitionKey: { name: 'MovieId', type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'ReviewId', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda Functions
    const getReviewsLambda = new lambda.Function(this, 'GetReviewsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-reviews.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/app-api/get-reviews')),
      environment: {
        TABLE_NAME: movieReviewsTable.tableName,
      },
    });

    const postReviewLambda = new lambda.Function(this, 'PostReviewLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'post-review.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/app-api/post-review')),
      environment: {
        TABLE_NAME: movieReviewsTable.tableName,
      },
    });

    const updateReviewLambda = new lambda.Function(this, 'UpdateReviewLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'update-review.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/app-api/update-review')),
      environment: {
        TABLE_NAME: movieReviewsTable.tableName,
      },
    });

    const translateReviewLambda = new lambda.Function(this, 'TranslateReviewLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'translate-review.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/app-api/translate-review')),
      environment: {
        TABLE_NAME: movieReviewsTable.tableName,
      },
    });

    // Grant Lambda functions access to DynamoDB
    movieReviewsTable.grantReadData(getReviewsLambda);
    movieReviewsTable.grantReadWriteData(postReviewLambda);
    movieReviewsTable.grantReadWriteData(updateReviewLambda);
    movieReviewsTable.grantReadData(translateReviewLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'MovieReviewApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const auth = new apigateway.CognitoUserPoolsAuthorizer(this, 'MovieReviewAuthorizer', {
      cognitoUserPools: [props.userPool],
    });

    const moviesResource = api.root.addResource('movies');
    const reviewsResource = moviesResource.addResource('reviews');
    const movieIdResource = reviewsResource.addResource('{movieId}');
    const reviewIdResource = movieIdResource.addResource('{reviewId}');
    const translationResource = reviewIdResource.addResource('translation');

    // GET /movies/reviews/[movieId]
    movieIdResource.addMethod('GET', new apigateway.LambdaIntegration(getReviewsLambda));

    // POST /movies/reviews
    reviewsResource.addMethod('POST', new apigateway.LambdaIntegration(postReviewLambda), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // PUT /movies/{movieId}/reviews/{reviewId}
    reviewIdResource.addMethod('PUT', new apigateway.LambdaIntegration(updateReviewLambda), {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // GET /reviews/{reviewId}/{movieId}/translation
    translationResource.addMethod('GET', new apigateway.LambdaIntegration(translateReviewLambda));
  }
}