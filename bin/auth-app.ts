#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthAppStack } from "../lib/auth-app-stack";
import { ReviewAppStack } from "../lib/review-app-stack";

const app = new cdk.App();
const authAppStack = new AuthAppStack(app, 'AuthAppStack');

new ReviewAppStack(app, 'ReviewAppStack', {
  userPoolId: authAppStack.userPoolId,
  userPoolClientId: authAppStack.userPoolClientId,
});