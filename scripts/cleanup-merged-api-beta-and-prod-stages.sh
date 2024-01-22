#!/bin/bash
set -xe

AWS_REGION='us-east-1'
aws cloudformation delete-stack --region $AWS_REGION --stack-name "beta-BookReviewsMergedApiStack"

aws cloudformation delete-stack --region $AWS_REGION --stack-name "prod-BookReviewsMergedApiStack"
