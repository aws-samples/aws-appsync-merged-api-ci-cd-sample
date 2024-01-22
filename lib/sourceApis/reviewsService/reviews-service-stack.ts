import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Role } from "aws-cdk-lib/aws-iam";
import { GraphqlApi, SourceApiAssociation, MergeType } from "aws-cdk-lib/aws-appsync";
import { SourceApiAssociationMergeOperation} from "awscdk-appsync-utils";
import { ReviewsServiceApiStack } from "./reviews-service-api-stack";

export class ReviewsServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: cdk.StageProps) {
        super(scope, id, props);

        const reviewsServiceApiStack = new ReviewsServiceApiStack(this, 'ReviewsServiceApiStack', props)
        const stage = props.stageName

        const mergedApiExecutionRole = Role.fromRoleArn(this, 'MergedApiExecutionRole',
            cdk.Fn.importValue(`${stage}-BookReviewsMergedApiExecutionRoleArn`))

        const mergedApiArn = cdk.Fn.importValue(`${stage}-BookReviewsMergedApiArn`)
        const mergedApiId = cdk.Fn.importValue(`${stage}-BookReviewsMergedApiId`)

        const mergedApi = GraphqlApi.fromGraphqlApiAttributes(this, 'MergedApi', {
            graphqlApiArn: mergedApiArn,
            graphqlApiId: mergedApiId,
        });

    
        // Associates this api to the BookReviewsMergedApi
        const sourceApiAssociation = new SourceApiAssociation(this, 'ReviewsSourceApiAssociation', {
            sourceApi: reviewsServiceApiStack.reviewsApi,
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