import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import { ReviewsServiceStack } from "./reviews-service-stack";

export class ReviewsServiceStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);
        new ReviewsServiceStack(this, 'ReviewsServiceStack', props);
    }
}