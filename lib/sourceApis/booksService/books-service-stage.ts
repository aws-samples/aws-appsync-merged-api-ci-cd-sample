import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import { BooksServiceStack } from "./books-service-stack";

export class BooksServiceStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);
        new BooksServiceStack(this, 'BooksServiceStack', props);
    }
}