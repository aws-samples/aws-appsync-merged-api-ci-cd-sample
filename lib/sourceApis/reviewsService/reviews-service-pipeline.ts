import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep} from 'aws-cdk-lib/pipelines';
import {SecretValue} from "aws-cdk-lib";
import {ReviewsServiceStage} from "./reviews-service-stage";
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { YOUR_REPOSITORY_NAME } from '../../../bin/bookReviewsMergedApi';

export class ReviewsServicePipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const githubAccessToken = SecretValue.secretsManager('github-token')
        const pipeline = new CodePipeline(this, 'ReviewsServicePipeline', {
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub(YOUR_REPOSITORY_NAME, "main",  {
                    authentication: githubAccessToken
                }),
                commands: ["npm ci", "npm run build", "npx cdk synth"]
            }),
            pipelineName: 'ReviewsServicePipeline',
        });

        const sourceApiBetaStage = new ReviewsServiceStage(this, "ReviewsServiceBetaStage", {
            env: {
                region: this.region
            },
            stageName: 'beta',
        });

        const evaluateCodePolicyStatement = new PolicyStatement({
            actions: ["appsync:EvaluateCode"],
            resources: [`*`],
        })

        const integTestPolicyStatement = new PolicyStatement({
            actions: ["appsync:GraphQL"],
            resources: [`arn:aws:appsync:${this.region}:${this.account}:*`],
        })

        const integTestListExportsPolicyStatement = new PolicyStatement({
            actions: ["cloudformation:ListExports"],
            resources: ["*"],
        })

        pipeline.addStage(sourceApiBetaStage, {
            pre: [
                new CodeBuildStep('Unit-Test', {
                    commands: [
                        "npm ci", 
                        "npm run build", 
                        "npm test unit-tests/sourceApis/reviewsService"],
                    rolePolicyStatements: [
                        evaluateCodePolicyStatement,
                    ]
                })
            ],
            post: [
                new CodeBuildStep('Integ-Test-Beta', {
                    env: {
                        Stage: 'beta',
                        AWS_REGION: this.region
                    },
                    commands: [
                        "npm ci",
                        "npm run build",
                        "npm test integ-tests/sourceApis/reviewsService"
                    ],
                    rolePolicyStatements: [
                        integTestPolicyStatement,
                        integTestListExportsPolicyStatement
                    ]
                }),/*
                new CodeBuildStep('Integ-Test-Prod-Merged-Api', {
                    env: {
                        Stage: 'prod',
                        AWS_REGION: this.region
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
        })

        const sourceApiProdStage = new ReviewsServiceStage(this, "ReviewsServiceProdStage", {
            env: {
                region: this.region
            },
            stageName: 'prod'
        });

        pipeline.addStage(sourceApiProdStage, {
            post: [ 
                new CodeBuildStep('Integ-Test-Prod-Source-Api', {
                    env: {
                        Stage: 'prod',
                        AWS_REGION: this.region
                    },
                    commands: [
                        "npm ci",
                        "npm run build",
                        "npm test integ-tests/sourceApis/reviewsService",
                    ],
                    rolePolicyStatements: [
                        integTestPolicyStatement,
                        integTestListExportsPolicyStatement
                    ]
                }),/*
                new CodeBuildStep('Integ-Test-Prod-Merged-Api', {
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
                })*/
            ]
        })
    }
}