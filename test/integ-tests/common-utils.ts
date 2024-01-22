import { SignatureV4 } from "@smithy/signature-v4";
import axios from "axios";
import { Sha256 } from '@aws-crypto/sha256-js'
import { defaultProvider } from "@aws-sdk/credential-provider-node";

const {
    AWS_REGION
  } = process.env;

const sigv4 = new SignatureV4({
    service: 'appsync',
    region: AWS_REGION ?? "",
    credentials: defaultProvider(),
    sha256: Sha256,
});


export async function executeRequest(apiUrl: URL, query: string, variables?: any, operationName?: string) {
    const signedRequest = await sigv4.sign({
        method: 'POST',
        hostname: apiUrl.hostname,
        path: '/graphql',
        protocol: 'https',
        headers: {
            'Content-Type': 'application/json',
            host: apiUrl.hostname
        },
        body: JSON.stringify({
            query,
            operationName,
            variables
        })
    });

    try {
        const { data } = await axios.post(
            `https://${apiUrl.hostname}/graphql`,
            signedRequest.body,
            {
                headers: signedRequest.headers,
            }
        );

        console.log('Successfully received data: ', data);

        if (data.errors) {
            throw new Error(`Errors occurred during the request: ${data}`)
        }

        return data;
  } catch (error) {
        console.log('An error occurred', error);
        throw error;
  }
}