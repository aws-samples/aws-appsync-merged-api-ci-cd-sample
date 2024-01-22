import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import {BookReviewsMergedApiStack} from "./book-reviews-mergedapi-stack";

export class BookReviewsMergedApiStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);
        const bookReviewsMergedApiStage = new BookReviewsMergedApiStack(this, 'BookReviewsMergedApiStack', props);
    }
}