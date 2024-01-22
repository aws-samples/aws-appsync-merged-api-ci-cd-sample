#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {BooksServicePipelineStack} from "../lib/sourceApis/booksService/books-service-pipeline-stack";
import {BookReviewsMergedApiPipeline} from "../lib/mergedApi/book-reviews-mergedapi-pipeline";
import {AuthorsServicePipelineStack} from "../lib/sourceApis/authorsService/authors-service-pipeline";
import {ReviewsServicePipelineStack} from "../lib/sourceApis/reviewsService/reviews-service-pipeline";
import { SchemaBreakingChangeDetectionStack } from '../lib/breakingChangeDetection/schema-breaking-change-detection-stack';

const app = new cdk.App();

const defaultRegion = 'us-east-1'
export const YOUR_REPOSITORY_NAME = "your repository name"
new SchemaBreakingChangeDetectionStack(app, 'BreakingChangeDetection', {
    env: {
        region: defaultRegion
    }
});

new BookReviewsMergedApiPipeline(app, 'BookReviewsMergedApiPipeline', {
    env: {
        region: defaultRegion
    }
});

new AuthorsServicePipelineStack(app, 'AuthorsServicePipeline', {
    env: {
        region: defaultRegion
    }
});

new ReviewsServicePipelineStack(app, 'ReviewsServicePipeline', {
    env: {
        region: defaultRegion
    },
});

new BooksServicePipelineStack(app, 'BooksServicePipeline', {
    env: {
        region: defaultRegion
    },
})
