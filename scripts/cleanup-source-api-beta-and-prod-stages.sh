#!/bin/bash
set -xe

AWS_REGION='us-east-1'
aws cloudformation delete-stack --region $AWS_REGION --stack-name "beta-BooksServiceStack"
aws cloudformation delete-stack --region $AWS_REGION --stack-name "beta-AuthorsServiceStack"
aws cloudformation delete-stack --region $AWS_REGION --stack-name "beta-ReviewsServiceStack"


aws cloudformation delete-stack --region $AWS_REGION --stack-name "prod-BooksServiceStack"
aws cloudformation delete-stack --region $AWS_REGION --stack-name "prod-AuthorsServiceStack"
aws cloudformation delete-stack --region $AWS_REGION --stack-name "prod-ReviewsServiceStack"
