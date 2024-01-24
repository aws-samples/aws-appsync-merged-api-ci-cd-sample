import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep} from 'aws-cdk-lib/pipelines';
import {SecretValue} from "aws-cdk-lib";
import {BookReviewsMergedApiStage} from "./book-reviews-mergedapi-stage";
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { YOUR_REPOSITORY_NAME } from '../../bin/bookReviewsMergedApi';

export class BookReviewsMergedApiPipeline extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const githubAccessToken = SecretValue.secretsManager('github-token')
        const pipeline = new CodePipeline(this, 'BookReviewsMergedApiPipeline', {
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub(YOUR_REPOSITORY_NAME, "main",  {
                    authentication: githubAccessToken
                }),
                commands: ["npm ci", "npm run build", "npx cdk synth"]
            }),
            pipelineName: 'BookReviewsMergedApiPipeline',
        });

        const integTestPolicyStatement = new PolicyStatement({
            actions: ["appsync:GraphQL"],
            resources: [`arn:aws:appsync:${this.region}:${this.account}:*`],
        });

        const integTestListExportsPolicyStatement = new PolicyStatement({
            actions: ["cloudformation:ListExports"],
            resources: ["*"],
        });

        const region = 'us-east-1'

        // Add integration test steps once the source API pipelines have been deployed.
        pipeline.addStage(new BookReviewsMergedApiStage(this, "BookReviewsMergedApiBetaStage", {
            env: {
                region: region
            },
            stageName: 'beta'
        }), {
            post: [
                /*new CodeBuildStep('Integ-Test-Beta-MergedApi', {
                    env: {
                        Stage: 'beta',
                        AWS_REGION: region
                    },
                    commands: [
                        "npm ci",
                        "npm run build",
                        "npm test integ-tests/mergedApi"
                    ],
                    rolePolicyStatements: [
                        integTestPolicyStatement,
                        integTestListExportsPolicyStatement
                    ]
                })*/
            ]
        });

        pipeline.addStage(new BookReviewsMergedApiStage(this, "BookReviewsMergedApiProdStage", {
            env: {
                region: region
            },
            stageName: 'prod'
        }), {
            post: [
                /*new CodeBuildStep('Integ-Test-Prod-MergedApi', {
                    env: {
                        Stage: 'prod',
                        AWS_REGION: region
                    },
                    commands: [
                        "npm ci",
                        "npm run build",
                        "npm test integ-tests/mergedApi"
                    ],
                    rolePolicyStatements: [
                        integTestPolicyStatement,
                        integTestListExportsPolicyStatement
                    ]
                }) */
            ]
        });
    }
}