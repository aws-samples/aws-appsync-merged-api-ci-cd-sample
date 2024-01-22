import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep} from 'aws-cdk-lib/pipelines';
import {BooksServiceStage} from "./books-service-stage";
import {SecretValue} from "aws-cdk-lib";
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class BooksServicePipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const githubAccessToken = SecretValue.secretsManager('github-token')
        const pipeline = new CodePipeline(this, 'BooksServicePipeline', {
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub('ndejaco2/MergedApiCICD', "main",  {
                    authentication: githubAccessToken
                }),
                commands: ["npm ci", "npm run build", "npx cdk synth"]
            }),
            pipelineName: 'BooksServicePipeline',
        });

        
        const sourceApiBetaStage = new BooksServiceStage(this, "BooksServiceBetaStage", {
            env: {
                region: this.region
            },
            stageName: 'beta',
        });

        const evaluateCodePolicyStatement = new PolicyStatement({
            actions: ["appsync:EvaluateCode"],
            resources: [`arn:aws:appsync:${this.region}:${this.account}:*`],
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
                        "npm test test/unit-tests/sourceApis/booksService"],
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
                        "npm test test/integ-tests/sourceApis/booksService"
                    ],
                    rolePolicyStatements: [
                        integTestPolicyStatement,
                        integTestListExportsPolicyStatement
                    ]
                }), /*
                new CodeBuildStep('Integ-Test-Beta-MergedApi', {
                    env: {
                        Stage: 'beta',
                        AWS_REGION: region
                    },
                    commands: [
                        "npm ci",
                        "npm run build",
                        "npm test test/integ-tests/mergedApi"
                    ],
                    rolePolicyStatements: [
                        integTestPolicyStatement,
                        integTestListExportsPolicyStatement
                    ]
                })*/
            ] 
        })

        const sourceApiProdStage = new BooksServiceStage(this, "BooksServiceProdStage", {
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
                        "npm test test/integ-tests/sourceApis/booksService",
                    ],
                    rolePolicyStatements: [
                        integTestPolicyStatement,
                        integTestListExportsPolicyStatement
                    ]
                }), /*
                new CodeBuildStep('Integ-Test-Prod-MergedApi', {
                    env: {
                        Stage: 'prod',
                        AWS_REGION: region
                    },
                    commands: [
                        "npm ci",
                        "npm run build",
                        "npm test test/integ-tests/mergedApi"
                    ],
                    rolePolicyStatements: [
                        integTestPolicyStatement,
                        integTestListExportsPolicyStatement
                    ]
                })
                */
            ]
        })
    }
}