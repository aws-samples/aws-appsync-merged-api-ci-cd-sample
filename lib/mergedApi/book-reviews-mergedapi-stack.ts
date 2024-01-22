import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CfnGraphQLApi} from "aws-cdk-lib/aws-appsync";
import {Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {CfnOutput} from "aws-cdk-lib";

export class BookReviewsMergedApiStack extends cdk.Stack {
  private bookReviewsMergedApi: CfnGraphQLApi;

  constructor(scope: Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props);

    const executionRole = new Role(this, 'MergedApiExecutionRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com')
    });

    this.bookReviewsMergedApi = new CfnGraphQLApi(this, 'BookReviewsMergedApi', {
      authenticationType: "AWS_IAM",
      name: `${props.stageName}-BookReviewsMergedApi`,
      apiType: 'MERGED',
      mergedApiExecutionRoleArn: executionRole.roleArn,
    });

    new CfnOutput(this, 'BookReviewsMergedApiUrl', {
      exportName: `${props.stageName}-BookReviewsMergedApiUrl`,
      value: this.bookReviewsMergedApi.attrGraphQlUrl
    });

    new CfnOutput(this, 'BookReviewsMergedApiArn', {
      exportName: `${props.stageName}-BookReviewsMergedApiArn`,
      value: this.bookReviewsMergedApi.attrArn
    })

    new CfnOutput(this, 'BookReviewsMergedApiId', {
      exportName: `${props.stageName}-BookReviewsMergedApiId`,
      value: this.bookReviewsMergedApi.attrApiId
    });

    new CfnOutput(this, 'BookReviewsMergedApiExecutionRole', {
      exportName: `${props.stageName}-BookReviewsMergedApiExecutionRoleArn`,
      value: executionRole.roleArn
    })
  }
}