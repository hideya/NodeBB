// node test-s3-connection.mjs

import { S3Client, ListBucketsCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

// Please replace with new API token
const config = {
  region: 'auto',
  endpoint: process.env.S3_UPLOADS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // forcePathStyle: true,
  // signatureVersion: 'v4',
};

const client = new S3Client(config);
const bucketName = 'shooooo-uploads-wnam';

async function testR2Connection() {
  console.log('=== R2 Connection Test ===');
  console.log('Current time:', new Date().toISOString());
  console.log('Configuration check:');
  console.log('- Access Key (first 10 characters):', config.credentials.accessKeyId.substring(0, 10) + '...');
  console.log('- Secret Key (first 10 characters):', config.credentials.secretAccessKey.substring(0, 10) + '...');
  console.log('- Endpoint:', config.endpoint);
  console.log('- Bucket:', bucketName);
  console.log('- Region:', config.region);
  console.log('');

  // Environment variable check
  console.log('Environment variable check:');
  const awsVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'AWS_PROFILE'];
  awsVars.forEach(varName => {
    console.log(`- ${varName}:`, process.env[varName] ? 'Set ⚠️' : 'Not set ✅');
  });
  console.log('');

  // 1. Basic connection test
  try {
    console.log('1. Basic connection test...');
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await client.send(listBucketsCommand);

    console.log('✅ Basic connection successful!');
    console.log('Available buckets:');
    bucketsResponse.Buckets?.forEach(bucket => {
      console.log(`  - ${bucket.Name} (Created: ${bucket.CreationDate})`);
    });
    console.log('');

  } catch (error) {
    console.log('❌ Basic connection error:', error.message);
    console.log('Error code:', error.name);
    console.log('HTTP status:', error.$metadata?.httpStatusCode);

    if (error.name === 'SignatureDoesNotMatch') {
      console.log('\n🔧 Signature error - Possible causes:');
      console.log('1. API token is incorrect');
      console.log('2. AWS environment variables are conflicting');
      console.log('3. System time is out of sync');
    }
    return; // Stop if basic connection fails
  }

  // 2. List objects in specific bucket
  try {
    console.log('2. Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 10
    });

    const listResponse = await client.send(listCommand);
    console.log('✅ Object list retrieval successful!');
    console.log(`Number of objects: ${listResponse.Contents?.length || 0}`);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log('Existing files:');
      listResponse.Contents.forEach(obj => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes, ${obj.LastModified})`);
      });
    } else {
      console.log('  Bucket is empty');
    }
    console.log('');

  } catch (error) {
    console.log('❌ Object list error:', error.message);
    console.log('Error code:', error.name);
    return;
  }

  // 3. Test file upload
  try {
    console.log('3. Test file upload...');
    const testContent = `R2 connection test successful!\nCreated: ${new Date().toISOString()}`;
    const uploadKey = `test/connection-test-${Date.now()}.txt`;

    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: uploadKey,
      Body: testContent,
      ContentType: 'text/plain; charset=utf-8'
    });

    const uploadResponse = await client.send(uploadCommand);
    console.log('✅ Upload successful!');
    console.log(`- File: ${uploadKey}`);
    console.log(`- ETag: ${uploadResponse.ETag}`);
    console.log(`- URL: https://pub-47581a50ffe64de080a93f9ae57bf6fd.r2.dev/${uploadKey}`);

  } catch (error) {
    console.log('❌ Upload error:', error.message);
    console.log('Error code:', error.name);
  }

  console.log('\n=== Test completed ===');
}

// Execute
testR2Connection().catch(console.error);
