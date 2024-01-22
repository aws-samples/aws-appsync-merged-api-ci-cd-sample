# AppSync MergedApi CI / CD
An example pipeline for deploying a Merged API using AWS CDK and AWS CodePipeline

# Overview
This project includes 3 source AppSync APIs with resolvers written in Typescript:

1. Reviews Service
2. Books Service
3. Authors Service

Also, it contains a Merged API which is able to integrate these 3 services into a single endpoint. This is known as the Book Reviews Merged API following the same example as the previous blog (https://aws.amazon.com/blogs/mobile/introducing-merged-apis-on-aws-appsync/).


![mergedApi](https://github.com/ndejaco2/MergedApiCICD/assets/54116900/71e8d0fe-0b4a-4d27-bbfa-63cc9ff3593f)

* While this sample configures the stacks in the same repository for simplicity, each API has its own CodePipeline for deployment as these will be managed by separate teams. Each CodePipline has a beta stage, which is recommended for initial integration tests and staging, as well as a production stage.
* For this sample, all APIs are deployed within the same AWS account. 
* Each source API stack includes a special SourceApiAssociation construct which handles configuring the association to the corresponding Merged API in the corresponding pipeline stage.
* The construct includes a CustomResource backed by a Lambda function which will propagate changes to the corresponding Merged API whenever the source API stack is updated and verify that the merge is successful. If the merge operation fails, the CustomResource notifies Cloudformation of the failure causing a Rollback and the CodePipeline will halt.
* Each source API stack includes unit testing using EvaluateCode and integration tests on both the source API and the Merged API after merge occurs. 


# Deployment Prerequisities

1. The sample requires that you have the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) installed.
2. The sample requires that you have Node 16+ and NPM
3. The sample requires that you have an AWS account with credentials in order to deploy the sample. 
4. Cleanup of the sample requires the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to be installed.

# Deploying the Sample

1. Fork the repository on Github to create a repository that you own.  

2. Clone the fork locally for your local development
    ```
    git clone <your repository fork url>
    ```

3. Install dependencies and build the sample:
    ```
    npm ci && npm run build && npx cdk synth
    ```

4. Add the repository name in `YOUR_REPOSITORY_NAME` in bin/bookReviewsMergedApi.ts to ensure that the pipeline receives notifications when you commit a change to your repository on Github. 

5. Create an AWS Secrets Manager secret named "github-token" containing your [Github personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens/) as a plaintext secret.

6. Deploy the AppSync SchemaBreakingChangeDetection stack. This stack is resposible for configuraing the Cloudformation Hook which will perform breaking change detection of AppSync schema updates within Cloudformation.

    ```
    export AWS_DEFAULT_REGION='us-east-1'
    npx cdk deploy BreakingChangeDetection
    ```

7. Deploy the BookReviews MergedApi CodePipeline Stack. This stack is resposible for configuring the CodePipeline which will handle deploying changes to both the beta and production stage BookReviews Merged API. Note that initially the integration tests in this pipeline are not added initially because they have a dependency on the source APIs being associated. 
    ```
    npx cdk deploy BookReviewsMergedApiPipeline
    ```
8. Sign in to the AWS Management Console and open the [CodePipeline console](https://console.aws.amazon.com/codesuite/codepipeline/home). You should see the BookReviewsMergedApiPipeline resource with an ongoing pipeline execution. Wait for the execution to finish to ensure that the stacks have been deployed. 


9. Once the Merged API pipeline execution has completed, deploy the source API pipelined and wait for them to finish a pipeline execution to successfully deploy the beta and production stages. 
    ```
    npx cdk deploy AuthorsServicePipeline ReviewsServicePipeline BooksServicePipeline
    ```

10. Now that all initial resources are deployed, we can enable the Merged API integration tests. Uncomment the code for adding the Merged API integration tests in lib/mergedApi/book-reviews-mergedapi-pipeline.ts as well as lib/sourceApis/authorsService/authors-service-pipeline-stack.ts, lib/sourceApis/booksService/books-service-pipeline-stack.ts, and lib/sourceApis/reviewsService/reviews-service-pipeline-stack.ts. Commit the code to your branch on Github and the changes will be picked up and automatically enable the integration testing step during the next pipeline execution. 

    ```
       pipeline.addStage(new BookReviewsMergedApiStage(this, "BookReviewsMergedApiBetaStage", {
            env: {
                region: region
            },
            stageName: 'beta'
        }), {
            post: [
                new CodeBuildStep('Integ-Test-Beta-MergedApi', {
                    env: {
                        Stage: 'beta',
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
                })
            ]
        });

        pipeline.addStage(new BookReviewsMergedApiStage(this, "BookReviewsMergedApiProdStage", {
            env: {
                region: region
            },
            stageName: 'prod'
        }), {
            post: [
                new CodeBuildStep('Integ-Test-Prod-MergedApi', {
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
                })
            ]
        });

    ```

    # Cleanup
    
    1. Clean up all the code pipeline stacks:

    ```
    npx cdk destroy --all
    ```

    2. Clean up the Source API stacks created by the code pipeline (Requires AWS CLI):
    ```
    ./scripts/cleanup-source-api-beta-and-prod-stages.sh
    ```


    2. Clean up the Merged API stacks created by the code pipeline (Requires AWS CLI):
    ```
    ./scripts/cleanup-merged-api-beta-and-prod-stages.sh
    ```