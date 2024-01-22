import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import { AuthorsServiceStack } from "./authors-service-stack";

export class AuthorsServiceStage extends cdk.Stage {

    public readonly apiArn: string;
    public readonly apiId: string;

    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);
        const authorsServiceStack = new AuthorsServiceStack(this, 'AuthorsServiceStack', props);
    }
}