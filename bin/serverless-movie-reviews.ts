#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ServerlessMovieReviewsStack } from '../lib/serverless-movie-reviews-stack';
import { AuthStack } from '../lib/auth-stack';

const app = new cdk.App();
// Auth Stack
const authStack = new AuthStack(app, 'AuthStack');
new ServerlessMovieReviewsStack(app, 'ServerlessMovieReviewsStack', {
  userPool: authStack.userPool,
});