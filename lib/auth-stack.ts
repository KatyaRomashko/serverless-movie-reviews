import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'MovieReviewUserPool', {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
    });

    // Cognito User Pool Client
    new cognito.UserPoolClient(this, 'MovieReviewUserPoolClient', {
      userPool: this.userPool,
    });
  }
}