import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Role } from "aws-cdk-lib/aws-iam";
import { GraphqlApi, SourceApiAssociation, MergeType } from "aws-cdk-lib/aws-appsync";
import { SourceApiAssociationMergeOperation } from "awscdk-appsync-utils";
import { AuthorsServiceApiStack } from "./authors-service-api-stack";

export class AuthorsServiceStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id);
        const stage = props.stageName

        const authorsServiceApi = new AuthorsServiceApiStack(this, 'AuthorsServiceApiStack', props)

        const mergedApiExecutionRole = Role.fromRoleArn(this, 'MergedApiExecutionRole',
            cdk.Fn.importValue(`${stage}-BookReviewsMergedApiExecutionRoleArn`))

        const mergedApiArn = cdk.Fn.importValue(`${stage}-BookReviewsMergedApiArn`)
        const mergedApiId = cdk.Fn.importValue(`${stage}-BookReviewsMergedApiId`)

        const mergedApi = GraphqlApi.fromGraphqlApiAttributes(this, 'MergedApi', {
            graphqlApiArn: mergedApiArn,
            graphqlApiId: mergedApiId,
        });

        // Associates this api to the BookReviewsMergedApi
        const sourceApiAssociation = new SourceApiAssociation(this, 'AuthorsSourceApiAssociation', {
            sourceApi: authorsServiceApi.authorsApi,
            mergedApi: mergedApi,
            mergedApiExecutionRole: mergedApiExecutionRole,
            mergeType: MergeType.MANUAL_MERGE,
        });

        const mergeOperation = new SourceApiAssociationMergeOperation(this, 'SourceApiMergeOperation', {
            sourceApiAssociation: sourceApiAssociation,
            alwaysMergeOnStackUpdate: true
        });
    }
}

