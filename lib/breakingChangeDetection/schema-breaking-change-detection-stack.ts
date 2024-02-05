import * as cdk from "aws-cdk-lib";
import { Role, ServicePrincipal, PrincipalWithConditions } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class SchemaBreakingChangeDetectionStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id)

        const executionRole = new Role(this, 'ActivationExecutionRole', {
            assumedBy: new PrincipalWithConditions(
                new ServicePrincipal( "hooks.cloudformation.amazonaws.com"), {
                    StringEquals: { 'aws:SourceAccount':  this.account },
                    ArnLike: { 'aws:SourceArn':  `arn:aws:cloudformation:${this.region}:${this.account}:type/hook/AwsCommunity-AppSync-BreakingChangeDetection/*`},
                })
        });

        const type = new cdk.CfnTypeActivation(this, 'BreakingChangeDetectionHook', {
            executionRoleArn: executionRole.roleArn,
            typeName: "AwsCommunity::AppSync::BreakingChangeDetection",
            type: "HOOK",
            publisherId: "c830e97710da0c9954d80ba8df021e5439e7134b",
        })

        new cdk.CfnHookTypeConfig(this, 'BreakingChangeDetectionConfig', {
            typeArn: type.attrArn,
            configuration: "{\"CloudFormationConfiguration\":{\"HookConfiguration\":{\"TargetStacks\":\"ALL\",\"FailureMode\":\"FAIL\",\"Properties\":{ \"ConsiderDangerousChangesBreaking\": false}}}}"
        })
    }  
}
